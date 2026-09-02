import { describe, expect, it } from "bun:test"
import { isVendValueConsistent } from "./fulfillment-rules"

describe("isVendValueConsistent", () => {
	it("accepts a provider amount plus VAT that equals the paid amount", () => {
		expect(
			isVendValueConsistent({
				paidAmountInCents: 15_050,
				taxInCents: 1_050,
				vendAmountInCents: 14_000,
			})
		).toBe(true)
	})

	it("rejects a provider response whose value does not reconcile", () => {
		expect(
			isVendValueConsistent({
				paidAmountInCents: 15_050,
				taxInCents: 1_049,
				vendAmountInCents: 14_000,
			})
		).toBe(false)
	})
})
