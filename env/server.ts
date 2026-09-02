import { createEnv } from "@t3-oss/env-nextjs"
import { config } from "dotenv"
import { z } from "zod"

config()

export const env = createEnv({
	isServer: typeof window === "undefined",
	// Preview deployments can render the public UI before provider credentials are supplied.
	// Keep strict validation as the default; only an explicit deployment flag skips it.
	skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
	server: {
		APP_URL: z.string().url(),
		DESERT_RETAIL_API_URL: z.string().url(),
		DESERT_RETAIL_USERNAME: z.string().min(1),
		DESERT_RETAIL_PASSWORD: z.string().min(1),
		DESERT_RETAIL_TERMINAL_ID: z.string().min(1).default("TOPMEUP"),
		PAYSTACK_API_URL: z.string().url().default("https://api.paystack.co"),
		PAYSTACK_SECRET_KEY: z.string().min(1),
		TURSO_DB_URL: z.string().min(1).default("file:local.db"),
		TURSO_DB_AUTH_TOKEN: z.string().optional(),
		RESEND_API_KEY: z.string().optional(),
		NOREPLY_EMAIL_DOMAIN: z.string().optional(),
	},
	runtimeEnv: {
		APP_URL: process.env.APP_URL,
		DESERT_RETAIL_API_URL: process.env.DESERT_RETAIL_API_URL,
		DESERT_RETAIL_USERNAME: process.env.DESERT_RETAIL_USERNAME,
		DESERT_RETAIL_PASSWORD: process.env.DESERT_RETAIL_PASSWORD,
		DESERT_RETAIL_TERMINAL_ID: process.env.DESERT_RETAIL_TERMINAL_ID,
		PAYSTACK_API_URL: process.env.PAYSTACK_API_URL,
		PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
		TURSO_DB_URL: process.env.TURSO_DB_URL,
		TURSO_DB_AUTH_TOKEN: process.env.TURSO_DB_AUTH_TOKEN,
		RESEND_API_KEY: process.env.RESEND_API_KEY,
		NOREPLY_EMAIL_DOMAIN: process.env.NOREPLY_EMAIL_DOMAIN,
	},
	emptyStringAsUndefined: true,
})
