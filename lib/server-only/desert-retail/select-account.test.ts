import { describe, expect, it } from "bun:test"
import { selectMeterAccount } from "./select-account"
import type { MeterAccount } from "./ravasvend-contract"

const accounts: readonly MeterAccount[] = [
	{
		customerAddress: "12 Main Road",
		customerName: "Test Customer",
		maximumVendAmountInCents: 100_000,
		meterNumber: "01234567890",
		minimumVendAmountInCents: 2_000,
		utilityName: "City Power",
		voucherCode: "ESKOM",
	},
]

describe("selectMeterAccount", () => {
	it("returns the account whose voucher was selected", () => {
		expect(selectMeterAccount(accounts, "ESKOM")).toEqual(accounts[0])
	})

	it("rejects a voucher that was not returned by meter verification", () => {
		expect(selectMeterAccount(accounts, "TAMPERED")).toBeNull()
	})
})
