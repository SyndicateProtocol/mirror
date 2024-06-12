import express, { json } from "express"
import { enabledListeners, initListeners } from "./listeners"

export const app = express()
app.use(json())

app.get("/", (_, res) => {
	return res.status(200).send(
		enabledListeners.map(({ id, startTime }) => ({
			id,
			startTime,
		})),
	)
})

app.get("/health", (_, res) => {
	return res.status(200).send("🪞🪞")
})

const PORT = 3000
app.listen(PORT, () => {
	console.info(`[server] started at http://localhost:${PORT}`)
	initListeners()
})
