import { Http } from "../../clients/http"
import { Syndicate } from "../../clients/syndicate"
import type { CoinGeckoSimplePriceResponse } from "../../types"
import { PollListener } from "../poll"

const http = new Http(
	"https://api.coingecko.com/api/v3/simple/price?ids=degen-base&vs_currencies=usd",
)

const syn = new Syndicate("SYNDICATE_API_KEY")

export const pollListener = new PollListener<number>({
	enabled: true,
	id: "price-mirror",
	pollIntervalSeconds: 60,
	dataToAwait: [
		() =>
			Http.get<CoinGeckoSimplePriceResponse>(
				"https://api.coingecko.com/api/v3/simple/price?ids=degen-base&vs_currencies=usd",
			).then((data) => data["degen-base"].usd),
	],
	onData: async ({ fulfilled, rejected: _ }) => {
		const price = fulfilled[0]
		console.debug(
			`[price-mirror]: got price: ${price}, uncomment below to broadcast`,
		)
		// const { transactionId } = await syn
		//   .sendTransaction({
		// 		chainId: <target-chain-ID-here>,
		// 		contractAddress: <target-contract-address-here>,
		// 		projectId: <your-project-ID-here>,
		//     functionSignature: 'updatePrice(uint256 price)',
		//     args: { price }
		//   })
		//   .catch((_) => {
		//     throw new Error('Could not get price')
		//   })
		// const hash = await syn.waitForHash({
		// 	transactionId,
		// 	projectId: <your-project-ID-here>
		// })
		// console.log(`got hash: ${hash} for transaction ID: ${transactionId}`)
	},
})
