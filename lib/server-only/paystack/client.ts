import ky from "ky"
import { z } from "zod"

export type PaystackClientConfig = {
	readonly baseUrl: string
	readonly secretKey: string
	readonly timeoutMs: number
}

export type InitializeTransactionInput = {
	readonly amountInCents: number
	readonly callbackUrl: string
	readonly donorEmail: string
	readonly publicRequestId: string
	readonly reference: string
}

export type InitializedTransaction = {
	readonly authorizationUrl: string
	readonly accessCode: string
	readonly reference: string
}

export type VerifiedTransaction = {
	readonly amountInCents: number
	readonly currency: "ZAR"
	readonly donorEmail: string
	readonly publicRequestId: string
	readonly reference: string
	readonly status: "success"
}

export class PaystackRequestError extends Error {
	readonly name = "PaystackRequestError"

	constructor(readonly operation: "initialize" | "verify" | "refund", options?: ErrorOptions) {
		super(`Paystack transaction ${operation} request failed`, options)
	}
}

const initializeResponseSchema = z.object({
	status: z.literal(true),
	data: z.object({
		authorization_url: z.string().url(),
		access_code: z.string().min(1),
		reference: z.string().min(1),
	}),
})

const verifyResponseSchema = z.object({
	status: z.literal(true),
	data: z.object({
		status: z.literal("success"),
		reference: z.string().min(1),
		amount: z.number().int().positive(),
		currency: z.literal("ZAR"),
		customer: z.object({
			email: z.string().email(),
		}),
		metadata: z.preprocess(parseMetadata, z.object({ publicRequestId: z.string().min(1) })),
	}),
})

const refundResponseSchema = z.object({
	status: z.literal(true),
	data: z.object({
		status: z.string().min(1),
	}),
})

function parseMetadata(value: unknown): unknown {
	if (typeof value !== "string") return value
	try {
		return JSON.parse(value)
	} catch (error) {
		if (error instanceof SyntaxError) return undefined
		throw error
	}
}

export class PaystackClient {
	constructor(private readonly config: PaystackClientConfig) {}

	async initializeTransaction(input: InitializeTransactionInput): Promise<InitializedTransaction> {
		try {
			const response: unknown = await ky
				.post(`${this.config.baseUrl}/transaction/initialize`, {
					headers: this.authorizationHeaders(),
					json: {
						amount: input.amountInCents.toString(),
						email: input.donorEmail,
						currency: "ZAR",
						reference: input.reference,
						callback_url: input.callbackUrl,
						metadata: JSON.stringify({
							publicRequestId: input.publicRequestId,
						}),
					},
					retry: {
						limit: 0,
					},
					timeout: this.config.timeoutMs,
				})
				.json()
			const parsed = initializeResponseSchema.parse(response)
			return {
				authorizationUrl: parsed.data.authorization_url,
				accessCode: parsed.data.access_code,
				reference: parsed.data.reference,
			}
		} catch (error) {
			if (error instanceof Error) {
				throw new PaystackRequestError("initialize", { cause: error })
			}
			throw error
		}
	}

	async verifyTransaction(reference: string): Promise<VerifiedTransaction> {
		try {
			const response: unknown = await ky
				.get(`${this.config.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`, {
					headers: this.authorizationHeaders(),
					retry: {
						limit: 1,
						methods: ["get"],
						statusCodes: [408, 429, 500, 502, 503, 504],
					},
					timeout: this.config.timeoutMs,
				})
				.json()
			const parsed = verifyResponseSchema.parse(response)
			return {
				amountInCents: parsed.data.amount,
				currency: parsed.data.currency,
				donorEmail: parsed.data.customer.email,
				publicRequestId: parsed.data.metadata.publicRequestId,
				reference: parsed.data.reference,
				status: parsed.data.status,
			}
		} catch (error) {
			if (error instanceof Error) {
				throw new PaystackRequestError("verify", { cause: error })
			}
			throw error
		}
	}

	async createRefund(reference: string, amountInCents: number): Promise<{ readonly status: string }> {
		try {
			const response: unknown = await ky
				.post(`${this.config.baseUrl}/refund`, {
					headers: this.authorizationHeaders(),
					json: {
						transaction: reference,
						amount: amountInCents,
						currency: "ZAR",
						customer_note: "Electricity vending could not be fulfilled",
						merchant_note: "Automated full refund after vending failure",
					},
					retry: {
						limit: 0,
					},
					timeout: this.config.timeoutMs,
				})
				.json()
			const parsed = refundResponseSchema.parse(response)
			return {
				status: parsed.data.status,
			}
		} catch (error) {
			if (error instanceof Error) {
				throw new PaystackRequestError("refund", { cause: error })
			}
			throw error
		}
	}

	private authorizationHeaders(): Readonly<Record<string, string>> {
		return {
			Authorization: `Bearer ${this.config.secretKey}`,
			"Content-Type": "application/json",
		}
	}
}
