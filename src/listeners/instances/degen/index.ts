import { env } from "~/env"
import { HttpGetter } from "~/getters/httpGetter"
import type { CoinGeckoSimplePriceResponse, PortalsFiResponse } from "~/types"
import { HttpListener } from "../../http"
import { onData } from "./onData"

const degenListener = new HttpListener<number>({
	id: "$degen",
	getters: [
		new HttpGetter<CoinGeckoSimplePriceResponse, number>({
			url: "https://api.coingecko.com/api/v3/simple/price?ids=degen-base&vs_currencies=usd",
			onJson: (json) => {
				return json["degen-base"].usd
			},
		}),
		new HttpGetter<PortalsFiResponse, number>({
			url: "https://api.portals.fi/v2/tokens?ids=base:0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
			headers: {
				Authorization: `Bearer ${env.PF_API_KEY}`,
			},
			onJson: (json) => {
				return json.tokens[0].price
			},
		}),
	],
	onData,
})

export default degenListener
