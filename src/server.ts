import express, { json } from "express"
import { env } from "~/env"
import { initListeners, listeners } from "~/listeners"

export const app = express()
app.use(json())

app.get("/", (_, res) => {
	const ids = listeners.map((listener) => listener.id)
	return res.status(200).send(ids)
})

app.get("/health", (_, res) => {
	return res.status(200).send("🪞")
})

app.listen(env.PORT, () => {
	console.log(`sever started at http://localhost:${env.PORT}`)
	initListeners()
})
