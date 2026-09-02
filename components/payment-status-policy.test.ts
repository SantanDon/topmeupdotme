import { describe, expect, it } from "bun:test"
import { nextPaymentStatusPollDelay } from "./payment-status-policy"

describe("nextPaymentStatusPollDelay", () => {
	it("stops polling once the deadline has passed", () => {
		expect(nextPaymentStatusPollDelay(10_000, 10_000)).toBeNull()
	})

	it("honours a provider retry hint without exceeding the deadline", () => {
		expect(nextPaymentStatusPollDelay(10_000, 20_000, 8_000)).toBe(8_000)
		expect(nextPaymentStatusPollDelay(19_000, 20_000, 8_000)).toBe(1_000)
	})
})
