import degenListener from "./instances/degen"
import goldListener from "./instances/gold"

export const listeners = [goldListener, degenListener]

export const initListeners = () =>
	Promise.all(listeners.map((listener) => listener.init()))
export const destroyListeners = () =>
	Promise.all(listeners.map((listener) => listener.destroy()))
