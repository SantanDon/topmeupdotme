import { ResultSet } from "@libsql/client"
import { SQLiteTransaction } from "drizzle-orm/sqlite-core"
// import { headers } from "next/headers"
import { ExtractTablesWithRelations } from "drizzle-orm"
import { cache } from "react"
import { getDB } from "./no-cache-db"
import * as donationsSchema from "./schemas/donation"
import * as transactionsSchema from "./schemas/transactions"

// const getSubdomain = async (): Promise<string> => {
// 	const headersList = headers()
// 	const host = headersList.get("host") || ""
// 	if (host === "localhost:3000") {
// 		return ""
// 	}
// 	const subdomain = host.split(".")[0]
// 	return subdomain
// }
export const schema = {
	...donationsSchema,
	...transactionsSchema,
}
const getDBCache = cache(getDB)

export type Transaction = SQLiteTransaction<
	"async",
	ResultSet,
	typeof schema,
	ExtractTablesWithRelations<typeof schema>
>

export { getDBCache }
