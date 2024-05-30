import type {
	SyndicateGetTransactionParams,
	SyndicateGetTransactionResponse,
	SyndicateSendTransactionBody,
	SyndicateSendTransactionResponse,
} from "~/types"
import { isDev } from "./../env"
import { Http } from "./http"

export class Syndicate {
	private readonly http

	constructor(apiKey: string) {
		this.http = new Http(
			isDev ? "https://staging-api.syndicate.io" : "https://api.syndicate.io",
			{
				Authorization: `Bearer ${apiKey}`,
			},
		)
	}

	sendTransaction(body: SyndicateSendTransactionBody) {
		return this.http.post<SyndicateSendTransactionResponse>(
			"/transact/sendTransaction",
			body,
		)
	}

	getRequest({ projectId, id }: SyndicateGetTransactionParams) {
		return this.http.get<SyndicateGetTransactionResponse>(
			`/wallet/project/${projectId}/request/${id}`,
		)
	}
}
