import { z } from "zod"

export enum AppEnv {
	Development = "development",
	Production = "production",
}

const schema = z.object({
	PORT: z.string().default("3000"),
	APP_ENV: z.nativeEnum(AppEnv).default(AppEnv.Development),
	BASE_RPC_URL: z
		.string()
		.min(1, { message: "BASE_RPC_URL missing from .env" }),
	CMC_API_KEY: z.string().min(1, { message: "CMC_API_KEY missing from .env" }),
	PF_API_KEY: z.string().min(1, { message: "PF_API_KEY missing from .env" }),
	GOLD_API_KEY: z
		.string()
		.min(1, { message: "GOLD_API_KEY missing from .env" }),
	DEGEN_API_KEY: z
		.string()
		.min(1, { message: "DEGEN_API_KEY missing from .env" }),
	GOLD_PROJECT_ID: z
		.string()
		.min(1, { message: "GOLD_PROJECT_ID missing from .env" }),
	DEGEN_PROJECT_ID: z
		.string()
		.min(1, { message: "DEGEN_PROJECT_ID missing from .env" }),
	GOLD_UUID_NAMESPACE: z.string().min(1, {
		message: "GOLD_UUID_NAMESPACE missing from .env",
	}),
})

export const env = schema.parse(process.env)

export const isDev = env.APP_ENV === AppEnv.Development
