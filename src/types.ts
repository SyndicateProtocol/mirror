import type { Hex } from "viem"

type Args = Record<string, string | object | number | bigint>
type DateTime = string
type UUID = string

export type SyndicateSendTransactionBody = {
	args: Args
	chainId: number
	contractAddress: Hex | string
	functionSignature: string
	projectId: string
	requestId?: string
}

export type SyndicateGetTransactionParams = {
	projectId: string
	id: string
}

export type SyndicateGetTransactionsParams = {
	projectId: string
	page?: number
	limit?: number
}

export type SyndicateSendTransactionResponse = {
	transactionId: string
}

export type SyndicateGetTransactionResponse = TransactionRequest
export type SyndicateGetTransactionsResponse = {
	transactionRequests: Array<TransactionRequest>
	total: number
}

enum TxStatus {
	Pending = "PENDING",
	Processed = "PROCESSED",
	Submitted = "SUBMITTED",
	Confirmed = "CONFIRMED",
	Paused = "PAUSED",
}

export type TransactionRequest = {
	transactionId: UUID
	chainId: number
	projectId: UUID
	contractAddress: Hex
	data: Hex
	value: string
	createdAt: DateTime
	updatedAt: DateTime
	invalid: boolean
	functionSignature: string
	transactionAttempts: Array<TransactionAttempt>
	decodedData: Args
}
type TransactionAttempt = {
	transactionId: UUID
	hash: Hex
	chainId: number
	status: TxStatus
	reverted: false
	block: number
	blockCreatedAt: DateTime
	signedTxn: Hex
	walletAddress: Hex
	nonce: number
	createdAt: DateTime
	updatedAt: DateTime
}

export type CoinGeckoSimplePriceResponse = {
	"degen-base": { usd: number }
}

export type PortalsFiResponse = {
	pageItems: number
	totalItems: number
	more: boolean
	page: number
	tokens: Array<PortalsFiToken>
}

type PortalsFiToken = {
	key: string
	name: string
	decimals: number
	symbol: string
	price: number
	address: string
	addresses: Record<string, string>
	platform: string
	network: string
	updatedAt: DateTime
	createdAt: DateTime
	tokens: Array<unknown>
	liquidity: number
	image: string
	metrics: Record<string, unknown>
	metadata: Record<string, unknown>
	tokenId: UUID
}

export type PriceResponses = CoinGeckoSimplePriceResponse | PortalsFiResponse

export type GoldMetadataResponse = {
	name: string
	description: string
	image: string
	attributes: Array<Attributes>
}

type Attribute<T, K> = {
	trait_type: T
	value: K
}

type Attributes =
	| ActivatedAttrbitue
	| FertilizerAttribute
	| GrowthRateAttribute
	| PlotTypeAttribute
	| PlotYieldAttribute
	| SeasonAttribute
	| SeedBagAttribute
	| SizeHeightAttribute
	| SizeWidthAttribute

type ActivatedAttrbitue = Attribute<"Activated", "Yes" | "No">
type FertilizerAttribute = Attribute<"Fertilizer", keyof typeof GoldFertilizer>
type GrowthRateAttribute = Attribute<"Growth Rate", keyof typeof GoldGrowthRate>
type PlotTypeAttribute = Attribute<"Plot Type", keyof typeof GoldPlotType>
type PlotYieldAttribute = Attribute<"Plot Yield", keyof typeof GoldPlotYield>
type SeasonAttribute = Attribute<"Season", string>
type SeedBagAttribute = Attribute<"Seed Bag", keyof typeof GoldCropName>
type SizeHeightAttribute = Attribute<"Size Height", string>
type SizeWidthAttribute = Attribute<"Size Width", string>

export enum GoldPlotType {
	"Grain Field" = "plot_type.GRAIN_FIELD",
	"Bean Garden" = "plot_type.BEAN_GARDEN",
	"Fruit Vine" = "plot_type.FRUIT_VINE",
	"Berry Bush" = "plot_type.BERRY_BUSH",
	"Flower Bed" = "plot_type.FLOWER_BED",
}

export enum GoldFertilizer {
	None = 0,
	"Grow 10k" = 1,
	"Grow 20k" = 2,
}

export enum GoldGrowthRate {
	Slow = 0,
	Medium = 1,
	Fast = 2,
}

export enum GoldPlotYield {
	Low = 0,
	Medium = 1,
	High = 2,
}

export enum GoldCropName {
	// GRAIN FIELD
	Corn = "zCAPRICORN",
	Oats = "zCOSMOAT",
	Wheat = "zSUNGRASS",
	"Wild Rice" = "zMOONGRASS",

	// BEAN GARDEN
	"Black beans" = "zVOIDPOP",
	Chickpeas = "zPASTEROID",
	"Green peas" = "zPLANETOID",
	"Kidney beans" = "zMARSPOP",
	"Pinto beans" = "zCRATERPOP",

	// FRUIT VINE
	Cantaloupe = "zMOONFRUIT",
	Grapes = "zCLUSTERBERRY",
	Pumpkins = "zMARSQUASH",
	Tomatoes = "zSUNBURST",
	Watermelon = "zEARTHMELON",

	// BERRY BUSH
	Blackberries = "zVOIDBERRY",
	Blueberries = "zSKYBERRY",
	"Goji berries" = "zDWARFBERRY",
	Raspberries = "zGLOWBERRY",
	Strawberries = "zSTARBERRY",

	// FLOWER BED
	Daisies = "zCLOUDBLOOM",
	Hops = "zVINEBLOOM",
	Lilies = "zNOVABLOOM",
	Roses = "zGALAXYBLOOM",
	Sunflowers = "zSOLARBLOOM",
}
