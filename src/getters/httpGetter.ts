import { Http } from "~/clients/http"

interface HttpGetterParams<T, K> {
	url: string
	onJson: (json: T) => K
	headers?: Record<string, string>
}

export class HttpGetter<T, K = void> {
	private http: Http
	constructor(private readonly params: HttpGetterParams<T, K>) {
		this.http = new Http(params.url, params.headers)
	}

	async get(path?: string) {
		const json = await this.http.get<T>(path)
		return this.params.onJson(json)
	}
}
