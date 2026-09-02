import { defineConfig, type Config } from "drizzle-kit"
import { z } from "zod"
import "./envConfig.ts"

const databaseEnvironmentSchema = z.object({
	TURSO_DB_URL: z.string().min(1).default("file:local.db"),
	TURSO_DB_AUTH_TOKEN: z.string().min(1).optional(),
})
const databaseEnvironment = databaseEnvironmentSchema.parse(process.env)

export default defineConfig({
	dialect: "turso",
	schema: "./db/schemas/*",
	out: "./db/migrations",
	dbCredentials: {
		url: databaseEnvironment.TURSO_DB_URL,
		authToken: databaseEnvironment.TURSO_DB_AUTH_TOKEN,
	},
	verbose: false,
}) satisfies Config
