import express, { json } from "express"
import { env } from "./env"
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

app.listen(env.PORT, () => {
	console.info(`[server] started at http://localhost:${env.PORT}`)
	initListeners()
})
