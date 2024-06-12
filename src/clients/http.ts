import { stringify } from "viem"

export class Http {
	private readonly baseUrl: string
	private readonly headers: Record<string, string>

	constructor(baseUrl: string, headers: Record<string, string> = {}) {
		this.baseUrl = baseUrl
		this.headers = headers
	}

	static get<T>(url: string) {
		return new Http(url).get<T>()
	}

	async get<T>(path?: string) {
		let url = this.baseUrl
		if (path) {
			url += path
		}

		const res = await fetch(url, {
			method: "GET",
			headers: this.headers,
		})
		if (!res.ok) {
			const reason = await res.text()
			console.warn(`Failed to fetch ${path}: ${reason}`)
			throw new Error(reason)
		}
		return (await res.json()) as T
	}

	async post<T>(path?: string, body: Record<string, unknown> = {}) {
		let url = this.baseUrl
		if (path) {
			url += path
		}

		const res = await fetch(url, {
			method: "POST",
			body: stringify(body),
			headers: {
				"Content-Type": "application/json",
				...this.headers,
			},
		})

		if (!res.ok) {
			const reason = await res.text()
			console.warn(`Failed to post to ${path}: ${reason}`)
			throw new Error(reason)
		}

		return (await res.json()) as T
	}
}
