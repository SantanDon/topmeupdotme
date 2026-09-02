import { afterEach, describe, expect, it } from "bun:test"
import { PaystackClient } from "./client"

const servers: Bun.Server<unknown>[] = []

afterEach(() => {
	for (const server of servers) {
		server.stop(true)
	}
	servers.length = 0
})

describe("PaystackClient", () => {
	it("initializes a ZAR transaction from the server in subunits", async () => {
		// Given
		const requests: Request[] = []
		const requestBodies: unknown[] = []
		const server = Bun.serve({
			port: 0,
			async fetch(request) {
				requests.push(request)
				requestBodies.push(await request.json())
				return Response.json({
					status: true,
					message: "Authorization URL created",
					data: {
						authorization_url: "https://checkout.paystack.com/access-code",
						access_code: "access-code",
						reference: "TMU_123",
					},
				})
			},
		})
		servers.push(server)
		const client = new PaystackClient({
			baseUrl: `http://127.0.0.1:${server.port}`,
			secretKey: "sk_test_example",
			timeoutMs: 2_000,
		})

		// When
		const transaction = await client.initializeTransaction({
			amountInCents: 20_000,
			callbackUrl: "https://topmeup.me/payment/complete",
			donorEmail: "donor@example.com",
			publicRequestId: "request-123",
			reference: "TMU_123",
		})

		// Then
		expect(transaction.authorizationUrl).toBe("https://checkout.paystack.com/access-code")
		expect(requests[0]?.url).toEndWith("/transaction/initialize")
		expect(requests[0]?.headers.get("authorization")).toBe("Bearer sk_test_example")
		expect(requestBodies[0]).toEqual({
			amount: "20000",
			email: "donor@example.com",
			currency: "ZAR",
			reference: "TMU_123",
			callback_url: "https://topmeup.me/payment/complete",
			metadata: JSON.stringify({ publicRequestId: "request-123" }),
		})
	})

	it("verifies the paid amount, currency, donor, and request metadata", async () => {
		// Given
		const server = Bun.serve({
			port: 0,
			fetch() {
				return Response.json({
					status: true,
					message: "Verification successful",
					data: {
						status: "success",
						reference: "TMU_123",
						amount: 20_000,
						currency: "ZAR",
						customer: { email: "donor@example.com" },
						metadata: { publicRequestId: "request-123" },
					},
				})
			},
		})
		servers.push(server)
		const client = new PaystackClient({
			baseUrl: `http://127.0.0.1:${server.port}`,
			secretKey: "sk_test_example",
			timeoutMs: 2_000,
		})

		// When
		const transaction = await client.verifyTransaction("TMU_123")

		// Then
		expect(transaction).toEqual({
			amountInCents: 20_000,
			currency: "ZAR",
			donorEmail: "donor@example.com",
			publicRequestId: "request-123",
			reference: "TMU_123",
			status: "success",
		})
	})

	it("accepts Paystack's stringified metadata response", async () => {
		const server = Bun.serve({
			port: 0,
			fetch() {
				return Response.json({
					status: true,
					data: {
						status: "success",
						reference: "TMU_123",
						amount: 20_000,
						currency: "ZAR",
						customer: { email: "donor@example.com" },
						metadata: JSON.stringify({ publicRequestId: "request-123" }),
					},
				})
			},
		})
		servers.push(server)
		const client = new PaystackClient({
			baseUrl: `http://127.0.0.1:${server.port}`,
			secretKey: "sk_test_example",
			timeoutMs: 2_000,
		})

		const transaction = await client.verifyTransaction("TMU_123")

		expect(transaction.publicRequestId).toBe("request-123")
	})

	it("queues a full refund against the provider reference", async () => {
		// Given
		const requestBodies: unknown[] = []
		const server = Bun.serve({
			port: 0,
			async fetch(request) {
				requestBodies.push(await request.json())
				return Response.json({
					status: true,
					message: "Refund has been queued for processing",
					data: {
						status: "pending",
					},
				})
			},
		})
		servers.push(server)
		const client = new PaystackClient({
			baseUrl: `http://127.0.0.1:${server.port}`,
			secretKey: "sk_test_example",
			timeoutMs: 2_000,
		})

		// When
		const result = await client.createRefund("TMU_123", 20_000)

		// Then
		expect(result).toEqual({ status: "pending" })
		expect(requestBodies[0]).toEqual({
			transaction: "TMU_123",
			amount: 20_000,
			currency: "ZAR",
			customer_note: "Electricity vending could not be fulfilled",
			merchant_note: "Automated full refund after vending failure",
		})
	})
})
