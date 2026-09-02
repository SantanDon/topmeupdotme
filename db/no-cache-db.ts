import { createClient, type Client } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import { env } from "@/env/server"
import * as donationsSchema from "./schemas/donation"
import * as transactionsSchema from "./schemas/transactions"

export const getDB = async () => {
	const url = env.TURSO_DB_URL
	const authToken = env.TURSO_DB_AUTH_TOKEN
	let turso: Client

	try {
		turso = createClient({ url, authToken })
	} catch (error) {
		if (error instanceof Error) {
			throw new DatabaseConfigurationError(error.message, { cause: error })
		}
		throw error
	}

	return drizzle({
		client: turso,
		connection: {
			url,
			authToken,
		},
		schema: {
			...donationsSchema,
			...transactionsSchema,
		},
		logger: process.env.NODE_ENV === "development",
	})
}

export class DatabaseConfigurationError extends Error {
	readonly name = "DatabaseConfigurationError"
}

export type DonationsDBSchema = typeof donationsSchema & typeof transactionsSchema
