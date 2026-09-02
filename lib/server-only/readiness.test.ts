import { describe, expect, it } from "bun:test"
import { evaluateConfigurationReadiness } from "./readiness"

describe("evaluateConfigurationReadiness", () => {
	it("reports missing required configuration without exposing values", () => {
		const result = evaluateConfigurationReadiness({
			APP_URL: "https://staging.example",
			DESERT_RETAIL_API_URL: "https://provider.example/Service.asmx",
			DESERT_RETAIL_USERNAME: "provider-user",
			DESERT_RETAIL_PASSWORD: undefined,
			PAYSTACK_SECRET_KEY: "sk_test_secret",
			TURSO_DB_URL: "libsql://staging.example",
		})

		expect(result.status).toBe("not_ready")
		expect(result.missing).toEqual(["DESERT_RETAIL_PASSWORD"])
		expect(result.configured).toContain("PAYSTACK_SECRET_KEY")
		expect(JSON.stringify(result)).not.toContain("sk_test_secret")
	})

	it("reports ready when every required value is present", () => {
		const result = evaluateConfigurationReadiness({
			APP_URL: "https://staging.example",
			DESERT_RETAIL_API_URL: "https://provider.example/Service.asmx",
			DESERT_RETAIL_USERNAME: "provider-user",
			DESERT_RETAIL_PASSWORD: "provider-password",
			PAYSTACK_SECRET_KEY: "sk_test_secret",
			TURSO_DB_URL: "libsql://staging.example",
		})

		expect(result).toEqual({
			configured: [
				"APP_URL",
				"DESERT_RETAIL_API_URL",
				"DESERT_RETAIL_USERNAME",
				"DESERT_RETAIL_PASSWORD",
				"PAYSTACK_SECRET_KEY",
				"TURSO_DB_URL",
			],
			missing: [],
			status: "ready",
		})
	})
})
