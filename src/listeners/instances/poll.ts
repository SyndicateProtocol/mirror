import { SyndicateClient } from "@syndicateio/syndicate-node"
import { waitForHash } from "@syndicateio/syndicate-node/utils/waitForHash"
import { PollListener } from "../poll"

const syndicate = new SyndicateClient({ token: "SYNDICATE_API_KEY" })
const projectId = "<your-project-ID>"
const chainId = 5432 // replace with target chain ID

async function getPrice() {
	const res = await fetch(
		"https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
	)
	if (!res.ok) {
		throw new Error("Failed to fetch price")
	}
	const data = (await res.json()) as { ethereum: { usd: number } }
	return data.ethereum.usd
}

export const pollListener = new PollListener<number>({
	id: "price-mirror",
	pollingInterval: 60,
	dataFetchers: [() => getPrice()],
	onData: async ({ fulfilled, rejected }) => {
		const price = fulfilled[0]
		if (!price) {
			console.debug("[price-mirror]: no price data")
			return
		}

		console.debug(`[price-mirror]: got eth price: ${price}`)

		// const { transactionId } = await syndicate.transact
		// 	.sendTransaction({
		// 		chainId,
		// 		projectId,
		// 		contractAddress: "<your-contract-address>",
		// 		functionSignature: "updatePrice(uint256 price)",
		// 		args: { price },
		// 	})
		// 	.catch((_) => {
		// 		throw new Error("Could not get price")
		// 	})
		// const hash = await waitForHash(syndicate, {
		// 	transactionId,
		// 	projectId,
		// })
		// console.log(`got hash: ${hash} for transaction ID: ${transactionId}`)

		if (rejected.length > 0) {
			console.error(`rejected: ${rejected.length}`)
			for (const err of rejected) {
				console.error(err)
			}
		}
	},
})
