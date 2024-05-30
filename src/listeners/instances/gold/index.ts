import config from "~/config"
import { ChainListener } from "~/listeners/chain"
import { activatedStartPackOnSourceEventABI, onData } from "./onData"

const { source } = config.gold
const { contractAddress, rpcUrl, fromBlock } = source

const goldListener = new ChainListener({
	id: "cropxyz",
	event: activatedStartPackOnSourceEventABI,
	rpcUrl,
	contractAddress,
	fromBlock,
	onData,
})

export default goldListener
