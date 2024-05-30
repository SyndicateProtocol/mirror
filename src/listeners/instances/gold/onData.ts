import { v5 } from "uuid"
import { parseAbiItem, stringify } from "viem"
import { Http } from "~/clients/http"
import { Syndicate } from "~/clients/syndicate"
import config from "~/config"
import { env } from "~/env"
import type { OnChainDataParams } from "~/listeners/chain"
import {
	GoldCropName,
	GoldFertilizer,
	GoldGrowthRate,
	GoldPlotType,
	GoldPlotYield,
	type GoldMetadataResponse,
} from "~/types"

const syn = new Syndicate(config.gold.apiKey)

export const activatedStartPackOnSourceEventABI = parseAbiItem(
	"event ActivatedStarterPackOnSource(bytes32 blockHash,uint256 blockNumber,uint256 indexed activationSourceNonce,uint256 indexed tokenId,uint256 sizeSpecificTokenId,uint256 width,uint256 height,string tokenURI,address indexed activator)",
)

function findTraitOrThrow(
	metadata: GoldMetadataResponse,
	traitType: GoldMetadataResponse["attributes"][0]["trait_type"],
) {
	const trait = metadata.attributes.find(
		(attr) => attr.trait_type === traitType,
	)
	if (!trait) {
		throw new Error(`metadata missing trait: ${traitType}`)
	}
	return trait.value
}

function getRandRange() {
	return [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)]
}

export function getTargetArgsFromMetadata(metadata: GoldMetadataResponse) {
	const plotType = findTraitOrThrow(metadata, "Plot Type")
	const cropName = findTraitOrThrow(metadata, "Seed Bag")
	const height = findTraitOrThrow(metadata, "Size Height")
	const fertilizer = findTraitOrThrow(metadata, "Fertilizer")
	const growthRate = findTraitOrThrow(metadata, "Growth Rate")
	const yieldIndex = findTraitOrThrow(metadata, "Plot Yield")
	const season = findTraitOrThrow(metadata, "Season")
	return {
		plotTypeNameEntered: GoldPlotType[plotType as keyof typeof GoldPlotType],
		cropName: GoldCropName[cropName as keyof typeof GoldCropName],
		size: height,
		// hardcoded for now, may possibly be included in metadata in the future
		tileArea: 9,
		fertilizer: Number(
			GoldFertilizer[fertilizer as keyof typeof GoldFertilizer],
		),
		growthRateIndex: Number(
			GoldGrowthRate[growthRate as keyof typeof GoldGrowthRate],
		),
		yieldIndex: Number(GoldPlotYield[yieldIndex as keyof typeof GoldPlotYield]),
		season: Number(season),
	}
}

export async function onData({
	logs,
	logger,
}: OnChainDataParams<typeof activatedStartPackOnSourceEventABI>) {
	logger.info(`got ${logs.length} events`)
	const promises = logs.map(
		async ({
			args: { activationSourceNonce, tokenId, activator, tokenURI },
		}) => {
			if (!activationSourceNonce || !tokenId || !activator || !tokenURI) {
				logger.error({ activationSourceNonce, tokenId, activator, tokenURI })
				throw new Error("missing required args")
			}

			// Create a unique identifier given unique identifiers from the event + target chain ID & contract address
			const { contractAddress, chainId } = config.gold.target
			const toHash = `${activationSourceNonce}${tokenId}${activator}${tokenURI}${contractAddress}${chainId}`
			const requestId = v5(toHash, env.GOLD_UUID_NAMESPACE)

			const req = await syn
				.getRequest({
					id: requestId,
					projectId: config.gold.projectId,
				})
				.catch((e) => {
					logger.info(`beginning reflection ${requestId}`)
				})

			if (req) {
				if (req.invalid) {
					// do nothing on invalid requests for now
					logger.error(`reflection ${requestId} invalid, doing nothing...`)
					return
				}

				const attempt = req.transactionAttempts.find(
					(a) => a.transactionId === requestId,
				)
				logger.info(
					`tx ${requestId} already reflected: (${attempt?.status}) ${attempt?.hash}`,
				)
				return
			}

			const metadata = await Http.get<GoldMetadataResponse>(tokenURI).catch(
				(e) => {
					const msg = `failed to get metadata from tokenURI: ${tokenURI}`
					logger.error(msg, e)
					throw new Error(msg, e)
				},
			)

			const argsFromMetadata = getTargetArgsFromMetadata(metadata)
			for (const [key, value] of Object.entries(argsFromMetadata)) {
				if (value === undefined) {
					const msg = `missing metadata value: ${key}`
					logger.error(msg)
					throw new Error(msg)
				}
			}

			const args = {
				...argsFromMetadata,
				activationSourceNonce,
				activator,
				randomListingGrowthRate: getRandRange(),
				randomListingYield: getRandRange(),
			}
			const functionSignature =
				"activateDestination(uint256 activationSourceNonce, string plotTypeNameEntered, string cropName, uint8[] randomListingGrowthRate, uint8[] randomListingYield, address activator, uint8 season, uint8 size, uint8 tileArea, uint8 fertilizer, uint8 growthRateIndex, uint8 yieldIndex)"

			const body = {
				requestId,
				functionSignature,
				args,
				chainId: config.gold.target.chainId,
				contractAddress: config.gold.target.contractAddress,
				projectId: config.gold.projectId,
			}

			logger.info(`reflecting to gold: ${stringify(body)}`)

			try {
				const { transactionId } = await syn.sendTransaction(body)
				logger.info(`reflection ${transactionId} successful`)
			} catch (e) {
				logger.error("failed to send transaction", e)
			}
		},
	)

	const settled = await Promise.allSettled(promises)
	const rejected = settled.filter((p) => p.status === "rejected")
	if (rejected.length > 0) {
		logger.error(`rejected: ${rejected.length}`)
		for (const promise of rejected) {
			logger.error(promise)
		}
	}
}
