import { v4 } from "uuid"

export type ListenerParams = {
	id: string
}

export abstract class Listener {
	readonly uniqId = v4().split("-")[0]
	readonly id?: string
	abstract init(): void
	abstract destroy(): void

	constructor(id: string) {
		this.id = id
	}

	// biome-ignore lint: console takes any
	private _log(...data: any[]) {
		console.log(this.prefix(), ...data)
	}

	// biome-ignore lint: console takes any
	private _error(...data: any[]) {
		console.error(this.prefix(), ...data)
	}

	// biome-ignore lint: console takes any
	private _warn(...data: any[]) {
		console.warn(this.prefix(), ...data)
	}

	// biome-ignore lint: console takes any
	private _info(...data: any[]) {
		console.info(this.prefix(), ...data)
	}

	// biome-ignore lint: console takes any
	private _debug(...data: any[]) {
		console.debug(this.prefix(), ...data)
	}

	protected logger = {
		log: this._log.bind(this),
		error: this._error.bind(this),
		warn: this._warn.bind(this),
		info: this._info.bind(this),
		debug: this._debug.bind(this),
	}

	private prefix() {
		return `[${new Date().toISOString()} - ${this.id ? this.id : this.uniqId}]`
	}
}

export type Logger = Listener["logger"]
