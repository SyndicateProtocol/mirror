import { Listener, type ListenerParams } from "./listener"

enum PromiseStatus {
	Fulfilled = "fulfilled",
	Rejected = "rejected",
}

export interface OnPollDataParams<T> {
	fulfilled: PromiseFulfilledResult<T>["value"][]
	rejected: PromiseRejectedResult["reason"][]
}

export interface PollListenerParams<T> extends ListenerParams {
	pollingInterval?: number
	onData: (data: OnPollDataParams<T>) => void
	dataFetchers: (() => Promise<T>)[]
}

export class PollListener<T> extends Listener {
	private readonly DEFAULT_POLLING_INTERVAL = 60
	private readonly pollIntervalSeconds: number
	private interval?: Timer

	constructor(private readonly params: PollListenerParams<T>) {
		super({ id: params.id, enabled: params.enabled })
		this.pollIntervalSeconds =
			params.pollingInterval || this.DEFAULT_POLLING_INTERVAL
	}

	init() {
		if (!this.enabled) {
			console.info(`[${this.id}] disabled`)
			return
		}
		this.listen()
	}

	listen() {
		console.info(`[${this.id}] listening...`)
		this.fetch()
		this.interval = setInterval(
			async () => await this.fetch(),
			this.pollIntervalSeconds * 1_000,
		)
	}

	private async fetch() {
		const data = await Promise.allSettled(
			this.params.dataFetchers.map((fn) => fn()),
		)

		const fulfilled = data
			.filter((result) => result.status === PromiseStatus.Fulfilled)
			.map((result) => (result as PromiseFulfilledResult<T>).value)

		const rejected = data
			.filter((result) => result.status === PromiseStatus.Rejected)
			.map((result) => (result as PromiseRejectedResult).reason)

		this.params.onData({
			fulfilled,
			rejected,
		})
	}

	destroy() {
		console.info(`[${this.id}] destroying...`)
		clearInterval(this.interval)
	}
}
