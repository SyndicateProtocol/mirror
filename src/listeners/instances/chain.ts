import { SyndicateClient } from "@syndicateio/syndicate-node"
import { waitForHash } from "@syndicateio/syndicate-node/utils/waitForHash"
import { v5 } from "uuid"
import { parseAbiItem } from "viem"
import { ChainListener } from "../chain"

const ETH_MAINNET_RPC_URL = "https://eth.drpc.org"
const PUNK_LISTEN_FROM_BLOCK = BigInt(19963995)
const PUNK_ADDRESS = "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB"
const PUNK_BOUGHT_EVENT = parseAbiItem(
	"event PunkBought(uint indexed punkIndex, uint value, address indexed fromAddress, address indexed toAddress)",
)

const syndicate = new SyndicateClient({ token: "SYNDICATE_API_KEY" })
const projectId = "<your-project-ID>"
const chainId = 5432 // replace with target chain ID

export const chainListener = new ChainListener({
	id: "punk-mirror",
	rpcUrl: ETH_MAINNET_RPC_URL,
	fromBlock: PUNK_LISTEN_FROM_BLOCK,
	event: PUNK_BOUGHT_EVENT,
	contractAddress: PUNK_ADDRESS,
	onData: async ({ logs }) => {
		const promises = logs.map(
			async ({
				args: { punkIndex, fromAddress, toAddress },
				transactionHash,
			}) => {
				console.debug(`[punk-mirror]: punk ${punkIndex} bought`)

				if (!toAddress) {
					console.error(`toAddress is not defined for punkIndex: ${punkIndex}`)
					return
				}

				// We generate a unique uuid to prevent duplicate transactions
				const requestId = v5(
					`${transactionHash}-${punkIndex}-${fromAddress}-${toAddress}`,
					v5.URL,
				)

				// // Check if the request has already been processed
				// const req = await syndicate.wallet
				// 	.getTransactionRequest(projectId, requestId)
				// 	.catch((e) => {
				// 		console.debug(`[punk-mirror] beginning reflection ${requestId}`)
				// 	})

				// if (req) {
				// 	const attempt = req.transactionAttempts?.find(
				// 		(a) => a.transactionId === requestId,
				// 	)
				// 	console.debug(
				// 		`[punk-mirror] tx ${requestId} already reflected: (${attempt?.status}) ${attempt?.hash}`,
				// 	)
				// 	return
				// }

				// // Mint an NFT on base to the purchaser of a cryptopunk
				// const { transactionId } = await syndicate.transact
				// 	.sendTransaction({
				// 		requestId,
				// 		chainId,
				// 		projectId,
				// 		contractAddress: "<your-contract-address>",
				// 		functionSignature: "<your-function-signature>",
				// 		args: {
				// 			to: toAddress,
				// 		},
				// 	})
				// 	.catch((_) => {
				// 		throw new Error(
				// 			`request ID: ${requestId} has already been processed`,
				// 		)
				// 	})
				// const hash = waitForHash(syndicate, { transactionId, projectId: "" })
				// console.log(`got hash: ${hash} for transaction ID: ${transactionId}`)
			},
		)

		const settled = await Promise.allSettled(promises)
		const rejected = settled.filter((p) => p.status === "rejected")
		if (rejected.length > 0) {
			console.error(`rejected: ${rejected.length}`)
			for (const promise of rejected) {
				console.error(promise)
			}
		}
	},
})
