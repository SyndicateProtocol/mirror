export type ListenerParams = {
	id: string
	enabled: boolean
}

export abstract class Listener {
	readonly id: string
	readonly startTime = Date.now()
	abstract init(): void
	abstract destroy(): void
	enabled = false

	constructor(id: string, enabled: boolean) {
		this.id = id
		this.enabled = enabled
	}
}
