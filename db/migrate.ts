import { createClient } from "@libsql/client"
import { loadEnvConfig } from "@next/env"
import { drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"
import { z } from "zod"
import * as donationsSchema from "./schemas/donation"
import * as transactionsSchema from "./schemas/transactions"

loadEnvConfig(process.cwd())

const databaseEnvironmentSchema = z.object({
	TURSO_DB_URL: z.string().min(1).default("file:local.db"),
	TURSO_DB_AUTH_TOKEN: z.string().min(1).optional(),
})

async function runMigration(): Promise<void> {
	const databaseEnvironment = databaseEnvironmentSchema.parse(process.env)
	const client = createClient({
		url: databaseEnvironment.TURSO_DB_URL,
		authToken: databaseEnvironment.TURSO_DB_AUTH_TOKEN,
	})
	const db = drizzle({
		client,
		schema: {
			...donationsSchema,
			...transactionsSchema,
		},
	})
	const startedAt = performance.now()
	await migrate(db, { migrationsFolder: "db/migrations" })
	console.info(`[Database] Migrations completed in ${Math.round(performance.now() - startedAt)}ms`)
	client.close()
}

runMigration().catch((error: unknown) => {
	if (error instanceof Error) {
		console.error("[Database] Migration failed", error)
		process.exitCode = 1
		return
	}
	throw error
})
