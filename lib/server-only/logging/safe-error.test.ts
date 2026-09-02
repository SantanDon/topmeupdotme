import { describe, expect, it } from "bun:test"
import { safeErrorFields } from "./safe-error"

describe("safeErrorFields", () => {
	it("keeps provider details out of structured logs", () => {
		const error = new Error("provider request failed", { cause: new Error("secret response body") })

		expect(safeErrorFields(error)).toEqual({ name: "Error", message: "provider request failed" })
		expect(JSON.stringify(safeErrorFields(error))).not.toContain("secret response body")
	})

	it("normalizes unknown thrown values", () => {
		expect(safeErrorFields({ password: "secret" })).toEqual({ name: "UnknownError", message: "Unknown server error" })
	})
})
