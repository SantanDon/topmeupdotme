import { sql } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { requestsTable } from "./donation"

export const transactionsTable = sqliteTable("transactions", {
	id: integer("id", { mode: "number" }).notNull().primaryKey({ autoIncrement: true }),
	publicRequestId: text("public_request_id")
		.notNull()
		.references(() => requestsTable.publicId),
	providerReference: text("provider_reference").notNull().unique(),
	donorEmail: text("donor_email").notNull(),
	amountInCents: integer("amount_in_cents").notNull(),
	currency: text("currency", { enum: ["ZAR"] }).notNull().default("ZAR"),
	status: text("status", {
		enum: ["pending", "vending", "completed", "failed", "refund_pending", "refunded", "reconciliation_required"],
	})
		.notNull()
		.default("pending"),
	failureReason: text("failure_reason"),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.$type<number | Date>()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.notNull()
		.$type<number | Date>()
		.default(sql`(unixepoch() * 1000)`),
})

export type InsertTransactionType = typeof transactionsTable.$inferInsert
