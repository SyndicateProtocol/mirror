import type { HttpGetter } from "../getters/httpGetter"
import { Listener, type ListenerParams } from "./listener"

export interface OnHttpDataParams<T> {
	fulfilled: PromiseFulfilledResult<T>["value"][]
	rejected: PromiseRejectedResult["reason"][]
	logger: Listener["logger"]
}

export interface HttpListenerParams<T> extends ListenerParams {
	// biome-ignore lint/suspicious/noExplicitAny: Http getters intial response do not need to be homogenous, but return from onJson must be
	getters: HttpGetter<any, T>[]
	onData: (data: OnHttpDataParams<T>) => void
	pollingInterval?: number
}

/**
 * @class HttpListener
 * @param {id} string - Unique identifier for the listener
 * @param {getters} Http - Array of Http instances used to query resources
 * @param {onData} function - Callback function to handle data from Http queries
 * @param {pollingInterval} number - Interval in seconds to poll Http resources
 */
export class HttpListener<T> extends Listener {
	private pollingInterval = 60

	constructor(private readonly params: HttpListenerParams<T>) {
		super(params.id)
		if (params.pollingInterval) {
			this.pollingInterval = params.pollingInterval
		}
	}

	async init() {
		this.listen()
	}

	listen() {
		this.logger.info("starting...")
		this.query()
		setInterval(async () => await this.query(), this.pollingInterval * 1_000)
	}

	private async query() {
		const data = await Promise.allSettled(
			this.params.getters.map((getter) => getter.get()),
		)

		const fulfilled = data
			.filter((result) => result.status === "fulfilled")
			.map((result) => (result as PromiseFulfilledResult<T>).value)

		const rejected = data
			.filter((result) => result.status === "rejected")
			.map((result) => (result as PromiseRejectedResult).reason)

		this.params.onData({
			fulfilled,
			rejected,
			logger: this.logger,
		})
	}

	async destroy() {
		this.logger.info("dying ⚰️...")
	}
}
