import type { AbiEvent } from "abitype"
import {
	createPublicClient,
	http,
	type Log,
	type WatchEventReturnType,
} from "viem"
import { Listener, type ListenerParams } from "./listener"

type Logs<
	T extends AbiEvent | undefined = undefined,
	K extends boolean | undefined = undefined,
	E extends
		| readonly AbiEvent[]
		| readonly unknown[]
		| undefined = T extends AbiEvent ? [T] : undefined,
	F extends string | undefined = T extends AbiEvent ? T["name"] : undefined,
> = Log<bigint, number, false, T, K, E, F>[]

export interface OnChainDataParams<T extends AbiEvent> {
	logs: Logs<T>
}

export interface ChainListenerParams<T extends AbiEvent>
	extends ListenerParams {
	rpcUrl: string
	contractAddress: `0x${string}`
	event: T
	fromBlock: bigint
	pollingInterval?: number
	onData: (params: OnChainDataParams<T>) => void
}

/**
 * @class ChainListener
 * @param {rpcUrl} string - RPC URL of the source chain
 * @param {address} function - Address of the contract on the chain of said rpc `rpcUrl` to listen for said `event`
 * @param {event} T - Event to listen for on `address`
 * @param {fromBlock} number - Block number to start fetching logs from
 * @param {onData} number - Callback function to handle data from chain logs
 */
export class ChainListener<T extends AbiEvent> extends Listener {
	private viem
	private unwatch: WatchEventReturnType | undefined

	private readonly pollingInterval

	constructor(private readonly params: ChainListenerParams<T>) {
		super({ id: params.id, enabled: params.enabled })
		this.viem = createPublicClient({
			transport: http(this.params.rpcUrl),
		})
		this.pollingInterval = this.params.pollingInterval ?? 10
	}

	init() {
		if (!this.enabled) {
			console.info(`[${this.id}] disabled`)
			return
		}
		this.unwatch = this.listen()
		this.getHistory().catch((e) => {
			console.error(`[${this.id}] failed to fetch history`, e)
		})
	}

	listen() {
		console.info(`[${this.id}] listening...`)
		return this.viem.watchEvent({
			pollingInterval: this.pollingInterval * 1_000,
			onLogs: (logs) => {
				if (logs.length > 0) {
					this.params.onData({ logs })
				}
			},
			address: this.params.contractAddress,
			event: this.params.event,
		})
	}

	async getHistory() {
		// @note currently we do not handle the case where a single query to getLogs() is too large
		// eth_getLogs has a max limit of 10,000 logs & will throw if there are more results
		// https://docs.infura.io/api/networks/ethereum/json-rpc-methods/eth_getlogs

		// TODO: adjust step size & retry if we see the following error

		// {
		//   "jsonrpc": "2.0",
		//   "id": 1,
		//   "error": {
		//     "code": -32005,
		//     "message": "query returned more than 10000 results"
		//   }
		// }
		const step = BigInt(1_000)
		const from = this.params.fromBlock
		const to = await this.viem.getBlockNumber()
		if (to < from) {
			console.debug(
				`[${this.id}] To block number: ${to} is less than from block number: ${from}, skipping fetching history.`,
			)
			return []
		}

		for (let fromBlock = from; fromBlock <= to; fromBlock += step) {
			const toBlock = minBigInt(fromBlock + step, to)
			const logs = await this.viem.getLogs({
				address: this.params.contractAddress,
				event: this.params.event,
				fromBlock,
				toBlock,
			})
			if (logs.length > 0) {
				this.params.onData({ logs })
			}
		}
	}

	destroy() {
		console.info(`[${this.id}] destroying...`)
		this.unwatch?.()
	}
}

function minBigInt(a: bigint, ...args: (bigint | undefined)[]): bigint {
	let m = a
	for (const z of args) {
		if (typeof z !== "undefined" && z < m) {
			m = z
		}
	}
	return m
}
