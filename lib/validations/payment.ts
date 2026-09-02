import { z } from "zod"

/**
 * Represents a card used in a payment transaction
 */
export const PaymentCardSchema = z.object({
	/** First 6 digits of the card number */
	bin: z.string(),
	/** Card expiry month (2 digits) */
	expiryMonth: z.string(),
	/** Card expiry year (4 digits) */
	expiryYear: z.string(),
	/** Name of the card holder */
	holder: z.string(),
	/** Last 4 digits of the card number */
	last4Digits: z.string(),
})

/**
 * Represents the result of a payment transaction
 */
export const TransactionResultSchema = z.object({
	/** Result code indicating the status of the transaction */
	code: z.string(),
	/** Human-readable description of the transaction result */
	description: z.string(),
})

/**
 * Represents additional details about the transaction result
 */
export const ResultDetailsSchema = z.object({
	/** Response code from the acquirer */
	AcquirerResponse: z.string(),
	/** Detailed description of the transaction result */
	ExtendedDescription: z.string(),
})

/**
 * Represents the completed checkout event from Peach Payments
 */
export const CompletedCheckoutEventSchema = z.object({
	/** Transaction amount as a string with decimal places */
	amount: z.string(),
	/** Card information used in the transaction */
	card: PaymentCardSchema,
	/** Unique identifier for the checkout session */
	checkoutId: z.string(),
	/** Currency code (e.g., "ZAR") */
	currency: z.string(),
	/** Unique identifier for the transaction */
	id: z.string(),
	/** Merchant information */
	merchant: z.object({
		name: z.string(),
	}),
	/** Merchant's internal transaction reference */
	merchantTransactionId: z.string(),
	/** Brand of the payment card (e.g., "VISA") */
	paymentBrand: z.string(),
	/** Type of payment (e.g., "DB" for debit) */
	paymentType: z.string(),
	/** Transaction result information */
	result: TransactionResultSchema,
	/** Additional details about the transaction result */
	resultDetails: ResultDetailsSchema,
	/** Digital signature for transaction verification */
	signature: z.string(),
	/** ISO 8601 timestamp of the transaction */
	timestamp: z.string(),
})

/**
 * Schema for processing payment and vending electricity
 */
export const processPaymentSchema = z.object({
	donorEmail: z.string().email("Please enter a valid email address"),
	/** Completed checkout event from Peach Payments */
	paymentEvent: CompletedCheckoutEventSchema.refine((event) => event.result.code === "000.100.110", {
		message: "Invalid payment result code",
	}).refine((event) => event.currency === "ZAR", {
		message: "Invalid currency",
	}),
	/** Public ID associated with the donation request */
	publicId: z.string().min(1, "Public ID is required"),
})
