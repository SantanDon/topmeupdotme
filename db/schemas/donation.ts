import { customNanoid } from "@/lib/keys"
import { relations, sql } from "drizzle-orm"
import { sqliteTable, integer, real, text } from "drizzle-orm/sqlite-core"
export const requestsTable = sqliteTable("requests", {
	id: integer("id", { mode: "number" }).notNull().primaryKey({ autoIncrement: true }),
	publicId: text("public_id")
		.notNull()
		.$defaultFn(() => customNanoid())
		.unique(),

	status: text("status", { enum: ["activated", "consumed"] })
		.default("activated")
		.notNull(),
	generatedLink: text("generated_link").notNull().unique(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	email: text("email").notNull(),
	phone: text("phone").notNull(),
	minimumVendAmount: integer("minimum_vend_amount").notNull().default(100),
	maximumVendAmount: integer("maximum_vend_amount"),
	meterNumber: text("meter_number").notNull(),
	voucherCode: text("voucher_code").notNull().default("UNKNOWN"),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.$type<number | Date>()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.notNull()
		.$type<number | Date>()
		.default(sql`(unixepoch() * 1000)`),
})
export const donationsTable = sqliteTable("donations", {
	id: integer("id", { mode: "number" }).notNull().primaryKey({ autoIncrement: true }),
	publicRequestId: text("public_request_id")
		.references(() => requestsTable.publicId)
		.notNull(),
	transactionRequestId: text("transaction_request_id").notNull().unique(),
	transactionReference: text("transaction_reference"),
	transactionReceipt: text("transaction_receipt").notNull(),
	token: text("token").notNull(),
	tax: integer("tax").notNull(),
	donationAmount: integer("donation_amount").notNull(),
	subTaxDonationAmount: integer("sub_tax_donation_amount").notNull(),
	electricityQuantity: real("electricity_quantity").notNull(),
	energyUnit: text("energy_unit").default("kWh").notNull(),
	donorName: text("donor_name").notNull(),
	donorEmail: text("donor_email").notNull(),
	receipientFirstName: text("receipient_first_name").notNull(),
	receipientLastName: text("receipient_last_name").notNull(),
	receipientMeterNumber: text("receipient_meter_number").notNull(),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.$type<number | Date>()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.notNull()
		.$type<number | Date>()
		.default(sql`(unixepoch() * 1000)`),
})

export const requestsRelation = relations(requestsTable, ({ many }) => ({
	donations: many(donationsTable),
}))
export const donationsRelation = relations(donationsTable, ({ one }) => ({
	request: one(requestsTable, {
		fields: [donationsTable.publicRequestId],
		references: [requestsTable.publicId],
	}),
}))
export type InsertDonationRequestType = typeof requestsTable.$inferInsert
export type InsertDonationType = typeof donationsTable.$inferInsert
