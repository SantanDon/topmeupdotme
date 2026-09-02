import { and, eq } from "drizzle-orm"
import { getDB } from "@/db/no-cache-db"
import { donationsTable, requestsTable } from "@/db/schemas/donation"
import { transactionsTable } from "@/db/schemas/transactions"
import { customNanoid } from "@/lib/keys"
import { desertRetailClient, paystackClient } from "@/lib/server-only/integrations"
import { isVendValueConsistent } from "@/lib/server-only/desert-retail/fulfillment-rules"
import type { CreditVendResult } from "@/lib/server-only/desert-retail/ravasvend-contract"
import { sendCompletionNotifications } from "@/lib/server-only/notifications"
import { safeErrorFields } from "@/lib/server-only/logging/safe-error"
import { setReconciliationIfVending, setTransactionStatus } from "./transaction-status"

type VendExecutionResult = CreditVendResult | { readonly ok: false; readonly reconciliationRequired: true }

export async function fulfillPaidDonation(reference: string): Promise<void> {
	try {
		const verified = await paystackClient.verifyTransaction(reference)
		const db = await getDB()
		const pending = await db.query.transactionsTable.findFirst({
			where: eq(transactionsTable.providerReference, verified.reference),
		})
		if (!pending || pending.status !== "pending") {
			return
		}
		if (
			pending.amountInCents !== verified.amountInCents ||
			pending.currency !== verified.currency ||
			pending.donorEmail !== verified.donorEmail ||
			pending.publicRequestId !== verified.publicRequestId
		) {
			await setTransactionStatus(reference, "reconciliation_required", "Verified payment did not match the order")
			return
		}

		const claimed = await db
			.update(transactionsTable)
			.set({ status: "vending", updatedAt: new Date() })
			.where(and(eq(transactionsTable.providerReference, reference), eq(transactionsTable.status, "pending")))
			.returning({ id: transactionsTable.id })
		if (claimed.length !== 1) {
			return
		}

		const donationRequest = await db.query.requestsTable.findFirst({
			where: eq(requestsTable.publicId, pending.publicRequestId),
		})
		if (!donationRequest) {
			await refundAfterProviderFault(reference, pending.amountInCents, "Donation request was not found")
			return
		}

		const vendResult = await executeVendWithRecovery(
			donationRequest.meterNumber,
			pending.amountInCents,
			reference,
			donationRequest.voucherCode
		)
		if (!vendResult.ok && "reconciliationRequired" in vendResult) {
			return
		}
		if (!vendResult.ok) {
			await refundAfterProviderFault(reference, pending.amountInCents, vendResult.fault.message)
			return
		}
		if (
			!isVendValueConsistent({
				paidAmountInCents: pending.amountInCents,
				taxInCents: vendResult.value.taxInCents,
				vendAmountInCents: vendResult.value.amountInCents,
			})
		) {
			await setTransactionStatus(
				reference,
				"reconciliation_required",
				"Electricity provider value did not match the paid amount"
			)
			return
		}

		await db.transaction(async (transaction) => {
			await transaction.insert(donationsTable).values({
				publicRequestId: donationRequest.publicId,
				transactionRequestId: reference,
				transactionReference: reference,
				transactionReceipt: vendResult.value.receiptNumber,
				token: vendResult.value.token,
				tax: vendResult.value.taxInCents,
				donationAmount: pending.amountInCents,
				subTaxDonationAmount: vendResult.value.amountInCents,
				electricityQuantity: vendResult.value.units,
				energyUnit: vendResult.value.unitsIso,
				donorName: "Anonymous donor",
				donorEmail: pending.donorEmail,
				receipientFirstName: donationRequest.firstName,
				receipientLastName: donationRequest.lastName,
				receipientMeterNumber: donationRequest.meterNumber,
			})
			await transaction
				.update(transactionsTable)
				.set({ status: "completed", updatedAt: new Date() })
				.where(eq(transactionsTable.providerReference, reference))
		})
		await sendCompletionNotifications({
			amountInCents: pending.amountInCents,
			completedAt: new Date().toISOString(),
			donorEmail: pending.donorEmail,
			meterNumber: donationRequest.meterNumber,
			receiptNumber: vendResult.value.receiptNumber,
			recipientEmail: donationRequest.email,
			recipientName: `${donationRequest.firstName} ${donationRequest.lastName}`,
			reference,
			token: vendResult.value.token,
			units: vendResult.value.units,
		})
	} catch (error) {
		try {
			await setReconciliationIfVending(reference, "Fulfillment failed before the outcome was confirmed")
		} catch (statusError) {
			if (statusError instanceof Error) {
				console.error("[Transaction reconciliation update failed]", {
					referenceSuffix: reference.slice(-8),
					...safeErrorFields(statusError),
				})
			} else {
				throw statusError
			}
		}
		if (error instanceof Error) {
			console.error("[Webhook fulfillment failed]", {
				referenceSuffix: reference.slice(-8),
				...safeErrorFields(error),
			})
			return
		}
		throw error
	}
}

async function executeVendWithRecovery(
	meterNumber: string,
	amountInCents: number,
	reference: string,
	voucherCode: string
): Promise<VendExecutionResult> {
	try {
		const vendResult = await desertRetailClient.creditVendForAccount(meterNumber, amountInCents, reference, voucherCode)
		if (!vendResult.ok && vendResult.fault.mustALR) {
			const adviceResult = await recoverCreditVend(meterNumber, reference)
			if (!adviceResult) {
				await setTransactionStatus(
					reference,
					"reconciliation_required",
					"Provider requires Advice but the outcome is not yet confirmed"
				)
				return { ok: false, reconciliationRequired: true }
			}
			return adviceResult
		}
		return vendResult
	} catch (error) {
		const adviceResult = await recoverCreditVend(meterNumber, reference)
		if (!adviceResult) {
			await setTransactionStatus(
				reference,
				"reconciliation_required",
				"Electricity provider response was ambiguous; Advice did not confirm the outcome"
			)
			if (error instanceof Error) {
				console.error("[Vending requires reconciliation]", {
					referenceSuffix: reference.slice(-8),
					...safeErrorFields(error),
				})
				return { ok: false, reconciliationRequired: true }
			}
			throw error
		}
		if (error instanceof Error) {
			console.error("[Vending recovered with Advice]", {
				referenceSuffix: reference.slice(-8),
				...safeErrorFields(error),
			})
			return adviceResult
		}
		throw error
	}
}

async function recoverCreditVend(
	meterNumber: string,
	reference: string
): Promise<Extract<CreditVendResult, { readonly ok: true }> | null> {
	try {
		const result = await desertRetailClient.advice(meterNumber, reference, `advice-${customNanoid(20)}`, reference)
		return result.ok ? result : null
	} catch (error) {
		if (error instanceof Error) {
			console.error("[Advice requires reconciliation]", {
				referenceSuffix: reference.slice(-8),
				...safeErrorFields(error),
			})
			return null
		}
		throw error
	}
}

async function refundAfterProviderFault(reference: string, amountInCents: number, reason: string): Promise<void> {
	try {
		await paystackClient.createRefund(reference, amountInCents)
		await setTransactionStatus(reference, "refund_pending", reason)
	} catch (error) {
		await setTransactionStatus(reference, "reconciliation_required", `${reason}; automatic refund failed`)
		if (error instanceof Error) {
			console.error("[Refund requires reconciliation]", {
				referenceSuffix: reference.slice(-8),
				...safeErrorFields(error),
			})
			return
		}
		throw error
	}
}
