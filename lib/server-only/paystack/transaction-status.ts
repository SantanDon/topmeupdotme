import { and, eq } from "drizzle-orm"
import { getDB } from "@/db/no-cache-db"
import { transactionsTable } from "@/db/schemas/transactions"

export type TransactionStatus =
	| "pending"
	| "vending"
	| "completed"
	| "failed"
	| "refund_pending"
	| "refunded"
	| "reconciliation_required"

const refundStatusMap: Readonly<Record<string, TransactionStatus>> = {
	"refund.pending": "refund_pending",
	"refund.processing": "refund_pending",
	"refund.processed": "refunded",
	"refund.failed": "reconciliation_required",
	"refund.needs-attention": "reconciliation_required",
}

export async function recordRefundStatus(event: string, reference: string): Promise<void> {
	const status = refundStatusMap[event]
	if (status) {
		await setTransactionStatus(reference, status, event)
	}
}

export async function setTransactionStatus(
	reference: string,
	status: TransactionStatus,
	failureReason: string | null
): Promise<void> {
	const db = await getDB()
	await db
		.update(transactionsTable)
		.set({ status, failureReason, updatedAt: new Date() })
		.where(eq(transactionsTable.providerReference, reference))
}

export async function setReconciliationIfVending(reference: string, failureReason: string): Promise<void> {
	const db = await getDB()
	await db
		.update(transactionsTable)
		.set({ status: "reconciliation_required", failureReason, updatedAt: new Date() })
		.where(and(eq(transactionsTable.providerReference, reference), eq(transactionsTable.status, "vending")))
}
