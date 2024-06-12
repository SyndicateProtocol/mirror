import { chainListener } from "./instances/chain"
import { pollListener } from "./instances/poll"

export const listeners = [chainListener, pollListener]
export const enabledListeners = listeners.filter((l) => l.enabled)

export const initListeners = () =>
	Promise.all(enabledListeners.map((l) => l.init()))
export const destroyListeners = () =>
	Promise.all(listeners.map((l) => l.destroy()))
