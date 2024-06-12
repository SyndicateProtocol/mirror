import type { Hex } from "viem"

type Args = Record<string, string | object | number | bigint>
type DateTime = string
type UUID = string

export interface WaitForHashOptions {
	projectId: string
	transactionId: string
	maxAttempts?: number
	every?: number
}

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
	transactionId: string
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
