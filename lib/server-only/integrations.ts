import "server-only"
import { env } from "@/env/server"
import { DesertRetailClient } from "./desert-retail/client"
import { PaystackClient } from "./paystack/client"

export const desertRetailClient = new DesertRetailClient({
	endpoint: env.DESERT_RETAIL_API_URL,
	username: env.DESERT_RETAIL_USERNAME,
	password: env.DESERT_RETAIL_PASSWORD,
	terminalId: env.DESERT_RETAIL_TERMINAL_ID,
	timeoutMs: 10_000,
})

export const paystackClient = new PaystackClient({
	baseUrl: env.PAYSTACK_API_URL,
	secretKey: env.PAYSTACK_SECRET_KEY,
	timeoutMs: 10_000,
})
