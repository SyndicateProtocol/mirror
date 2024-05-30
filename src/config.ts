import type { Hex } from "viem"
import { env } from "./env"

const config = {
	gold: {
		apiKey: env.GOLD_API_KEY,
		projectId: env.GOLD_PROJECT_ID,
		source: {
			rpcUrl: env.BASE_RPC_URL,
			contractAddress: "0xDE1Bc6e9164af5A48c45111B811C61F11Ce58D91" as Hex,
			// Test activation pack was posted manually to the target contract & we don't want to reflect it, so fromBlock here is one block after
			// https://basescan.org/tx/0x3374d894306c96c4ee9ce4aebaf01938cd15a90b3fe34467b9a84cb8b208f5f4
			fromBlock: BigInt(13_917_074),
		},
		target: {
			chainId: 4_653,
			contractAddress: "0x21170F8BD35D0aFA8Ad55719Ce29d6489a8585db" as Hex,
		},
	},
	degen: {
		apiKey: env.DEGEN_API_KEY,
		projectId: env.DEGEN_PROJECT_ID,
		targetContractAddress: "0x2a3B6469F084Fe592BC50EeAbC148631AdAcB92e" as Hex,
		chainId: 666_666_666,
	},
}

export default config
