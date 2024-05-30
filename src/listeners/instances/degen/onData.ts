import { Syndicate } from "~/clients/syndicate"
import config from "~/config"
import type { OnHttpDataParams } from "../../http"

const syn = new Syndicate(config.degen.apiKey)

export async function onData({
	rejected,
	fulfilled,
	logger,
}: OnHttpDataParams<number>) {
	let prices = fulfilled

	if (rejected.length) {
		logger.warn(`rejected: ${rejected.length}`)
		for (const reason of rejected) {
			logger.error(reason)
		}
	}

	const outliers = getOutliers(prices)
	if (outliers.length) {
		logger.warn(`outliers: ${outliers.length}`)
		for (const value of outliers) {
			logger.warn(`outlier: $${value}, removing from price pool`)
			prices = prices.filter((price) => price !== value)
		}
	}

	if (!prices.length) {
		logger.error("no prices, aborting")
		return
	}

	const mean = getMean(prices)
	const price = Math.round(mean * 1e6)
	try {
		const { transactionId } = await syn.sendTransaction({
			args: { price },
			functionSignature: "updatePrice(uint256 price)",
			chainId: config.degen.chainId,
			contractAddress: config.degen.targetContractAddress,
			projectId: config.degen.projectId,
		})

		logger.info(
			`[${prices.length} source${
				prices.length > 1 ? "s" : ""
			}] relecting mean price: $${mean} (${price}) to degen, transactionId: ${transactionId}`,
		)
	} catch (e) {
		logger.error("error reflecting to degen", e)
	}
}

function getMean(data: number[]): number {
	return data.reduce((acc, value) => acc + value, 0) / data.length
}

function getStandardDeviation(data: number[], mean: number): number {
	const variance =
		data.reduce((acc, value) => acc + (value - mean) ** 2, 0) / data.length
	return Math.sqrt(variance)
}

function getOutliers(data: number[], threshold = 2): number[] {
	const mean = getMean(data)
	const stdDeviation = getStandardDeviation(data, mean)
	return data.filter((x) => Math.abs((x - mean) / stdDeviation) > threshold)
}
