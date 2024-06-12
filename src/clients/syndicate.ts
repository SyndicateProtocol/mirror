import { sleep } from "bun"
import type {
	SyndicateGetTransactionParams,
	SyndicateGetTransactionResponse,
	SyndicateSendTransactionBody,
	SyndicateSendTransactionResponse,
	WaitForHashOptions,
} from "../types"
import { Http } from "./http"

const AttemptStatus = {
	Pending: "PENDING",
	Processed: "PROCESSED",
	Submitted: "SUBMITTED",
	Confirmed: "CONFIRMED",
	Paused: "PAUSED",
	Abandoned: "ABANDONED",
} as const

export class Syndicate {
	private readonly http

	private readonly onChainStatuses: Array<
		(typeof AttemptStatus)[keyof typeof AttemptStatus]
	> = [
		AttemptStatus.Pending,
		AttemptStatus.Processed,
		AttemptStatus.Submitted,
		AttemptStatus.Confirmed,
	]

	constructor(apiKey: string) {
		this.http = new Http("https://api.syndicate.io", {
			Authorization: `Bearer ${apiKey}`,
		})
	}

	sendTransaction(body: SyndicateSendTransactionBody) {
		return this.http.post<SyndicateSendTransactionResponse>(
			"/transact/sendTransaction",
			body,
		)
	}

	getRequest({ projectId, transactionId }: SyndicateGetTransactionParams) {
		return this.http.get<SyndicateGetTransactionResponse>(
			`/wallet/project/${projectId}/request/${transactionId}`,
		)
	}

	async waitForHash({
		projectId,
		transactionId,
		maxAttempts = 20,
		every = 1000,
	}: WaitForHashOptions) {
		let currAttempts = 0
		let transactionHash = null

		while (!transactionHash) {
			await sleep(every)

			if (currAttempts >= maxAttempts - 1) {
				throw new WaitForHashMaxAttemptsReachedError()
			}

			const txAttempts = (await this.getRequest({ projectId, transactionId }))
				?.transactionAttempts
			const onChainTx = txAttempts?.find(
				(tx) => this.onChainStatuses.indexOf(tx.status) >= 0,
			)

			if (onChainTx) {
				transactionHash = onChainTx.hash
				break
			}

			currAttempts += 1
		}

		return transactionHash
	}
}

export class WaitForHashMaxAttemptsReachedError extends Error {
	constructor() {
		super("Max attempts reached")
	}
}
