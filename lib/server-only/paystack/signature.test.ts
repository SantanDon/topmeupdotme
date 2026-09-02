import { createHmac } from "node:crypto"
import { describe, expect, it } from "bun:test"
import { isValidPaystackSignature } from "./signature"

describe("Paystack webhook signature", () => {
	it("accepts the HMAC-SHA512 signature for the exact raw request body", () => {
		// Given
		const rawBody = '{"event":"charge.success","data":{"reference":"TMU_123"}}'
		const secretKey = "sk_test_example"
		const signature = createHmac("sha512", secretKey).update(rawBody).digest("hex")

		// When
		const result = isValidPaystackSignature(rawBody, signature, secretKey)

		// Then
		expect(result).toBe(true)
	})

	it("rejects a signature when the request body has been changed", () => {
		// Given
		const rawBody = '{"event":"charge.success","data":{"reference":"TMU_123"}}'
		const secretKey = "sk_test_example"
		const signature = createHmac("sha512", secretKey)
			.update('{"event":"charge.success","data":{"reference":"TMU_999"}}')
			.digest("hex")

		// When
		const result = isValidPaystackSignature(rawBody, signature, secretKey)

		// Then
		expect(result).toBe(false)
	})

	it("rejects malformed hexadecimal signatures", () => {
		// Given
		const rawBody = '{"event":"charge.success"}'

		// When
		const result = isValidPaystackSignature(rawBody, "not-hex", "sk_test_example")

		// Then
		expect(result).toBe(false)
	})
})
