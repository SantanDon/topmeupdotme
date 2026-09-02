import { env } from "@/env/server"

export const getEnvURLData = () => {
	return {
		inProduction: process.env.NODE_ENV === "production",
		baseURL: env.APP_URL,
	} as const
}
