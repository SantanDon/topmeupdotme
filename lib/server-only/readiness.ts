const REQUIRED_CONFIGURATION_KEYS = [
	"APP_URL",
	"DESERT_RETAIL_API_URL",
	"DESERT_RETAIL_USERNAME",
	"DESERT_RETAIL_PASSWORD",
	"PAYSTACK_SECRET_KEY",
	"TURSO_DB_URL",
] as const

type ConfigurationReadiness = {
	readonly status: "ready" | "not_ready"
	readonly configured: readonly string[]
	readonly missing: readonly string[]
}

export function evaluateConfigurationReadiness(
	values: Readonly<Record<string, string | undefined>>
): ConfigurationReadiness {
	const configured = REQUIRED_CONFIGURATION_KEYS.filter((key) => values[key]?.trim().length)
	const missing = REQUIRED_CONFIGURATION_KEYS.filter((key) => !values[key]?.trim().length)
	return {
		configured,
		missing,
		status: missing.length === 0 ? "ready" : "not_ready",
	}
}
