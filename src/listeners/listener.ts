import { v4 } from "uuid"

export type ListenerParams = {
	id?: string
	enabled?: boolean
}

export abstract class Listener {
	readonly id: string
	readonly startTime = Date.now()
	abstract init(): void
	abstract destroy(): void
	enabled = true

	constructor({ id, enabled }: ListenerParams) {
		this.id = id ?? v4()
		if (enabled !== undefined) {
			this.enabled = enabled
		}
	}
}
