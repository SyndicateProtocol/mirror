import { z } from "zod"

const schema = z.object({
	PORT: z.string().default("3000"),
})

export const env = schema.parse(process.env)
