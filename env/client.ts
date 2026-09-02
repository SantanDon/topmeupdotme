// src/env.mjs
import { createEnv } from "@t3-oss/env-nextjs"
import { vercel } from "@t3-oss/env-nextjs/presets"
import { config } from "dotenv"
import { z } from "zod"
config()
export const env = createEnv({
	/*
	 * Serverside Environment variables, not available on the client.
	 * Will throw if you access these variables on the client.
	 */
	client: {
		NEXT_PUBLIC_PROD_DOMAIN: z.string(),
		NEXT_PUBLIC_DOMAIN: z.string(),
		NEXT_PUBLIC_PEACH_PAYMENT_ENTITY_ID: z.string(),
		NEXT_PUBLIC_CHECKOUT_JS: z.string(),
	},
	/*
	 * Environment variables available on the client (and server).
	 *
	 * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
	 */
	/*
	 * Due to how Next.js bundles environment variables on Edge and Client,
	 * we need to manually destructure them to make sure all are included in bundle.
	 *
	 * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
	 */
	runtimeEnv: {
		NEXT_PUBLIC_PROD_DOMAIN: process.env.NEXT_PUBLIC_PROD_DOMAIN,
		NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
		NEXT_PUBLIC_PEACH_PAYMENT_ENTITY_ID: process.env.NEXT_PUBLIC_PEACH_PAYMENT_ENTITY_ID,
		NEXT_PUBLIC_CHECKOUT_JS: process.env.NEXT_PUBLIC_CHECKOUT_JS,
	},
	// Extend the Vercel preset.
	extends: [vercel()],
})
