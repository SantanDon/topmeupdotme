import { isPossiblePhoneNumber } from "libphonenumber-js"
import { z } from "zod"

export const searchParamsSchema = z.object({
	error: z.enum(["invalid", "verification-failed"]).optional(),
})

export const verifyMeterSchema = z
	.object({
		meterNumber: z
			.string()
			.trim()
			.regex(/^\d{11,13}$/, "Enter an 11 to 13 digit prepaid meter number"),
	})
	.strict()

export const recipientDetailsSchema = z
	.object({
		firstName: z.string().trim().min(2, "First name must be at least 2 characters").max(50),
		lastName: z.string().trim().min(2, "Last name must be at least 2 characters").max(50),
		email: z.string().trim().toLowerCase().email("Enter a valid email address"),
		phoneNumber: z
			.string()
			.refine(isPossiblePhoneNumber, { message: "Please match a valid South African phone number" }),
	})
	.strict()

export const receipientDetailsSchema = recipientDetailsSchema
export const generationLinkSchema = verifyMeterSchema.merge(recipientDetailsSchema).strict()
export const generationLinkSchemaWithVoucher = generationLinkSchema.extend({ voucherCode: z.string().trim().min(1) }).strict()

export const initializeDonationSchema = z
	.object({
		publicId: z.string().regex(/^[\dA-Za-z]{12}$/, "Invalid donation link"),
		donorEmail: z.string().trim().toLowerCase().email("Enter a valid email address"),
		amountInCents: z.number().int().positive(),
	})
	.strict()
export const donationSchema = z.object({
	publicId: z.string(),
	amount: z.coerce
		.number()
		.int()
		.positive()
		.min(100, "Amount must be greater than or equal to 100 ZAR")
		.transform((val) => val * 100), // convert to cents from ZAR
})
export const donationSearchParamsSchema = z.object({
	transactionRef: z.string(),
	donationAmount: z.union([
		z
			.string()
			.transform((val) => Number(val))
			.pipe(z.number().min(0)),
		z.number().min(0),
	]),
	token: z.string(),
	receipt: z.string(),
	meterNumber: z.string(),
	quantity: z.union([
		z
			.string()
			.transform((val) => Number(val))
			.pipe(z.number().min(0)),
		z.number().min(0),
	]),
	unit: z.string(),
})
