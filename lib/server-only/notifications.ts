import "server-only"
import { render } from "@react-email/render"
import { createElement } from "react"
import { Resend } from "resend"
import DonationReceiptEmail from "@/emails/donation-receipt"
import RecipientNotificationEmail from "@/emails/recipient-notification"
import { env } from "@/env/server"
import { safeErrorFields } from "./logging/safe-error"

export type CompletionNotification = {
	readonly donorEmail: string
	readonly amountInCents: number
	readonly recipientEmail: string
	readonly recipientName: string
	readonly meterNumber: string
	readonly token: string
	readonly units: number
	readonly receiptNumber: string
	readonly reference: string
	readonly completedAt: string
}

export async function sendCompletionNotifications(input: CompletionNotification): Promise<void> {
	const domain = env.NOREPLY_EMAIL_DOMAIN?.trim()
	if (!env.RESEND_API_KEY || !domain) return

	try {
		const resend = new Resend(env.RESEND_API_KEY)
		const from = `Top Me Up <noreply@${domain}>`
		const platformWebsite = env.APP_URL.replace(/^https?:\/\//, "")
		const donorHtml = await render(
			createElement(DonationReceiptEmail, {
				amount: input.amountInCents / 100,
				donorEmail: input.donorEmail,
				donorName: "Supporter",
				donationDate: input.completedAt,
				electricityToken: input.token,
				electricityUnits: input.units,
				platformName: "Top Me Up",
				platformWebsite,
				receiptNumber: input.receiptNumber,
				recipientMeterNumber: input.meterNumber,
				recipientName: input.recipientName,
				transactionId: input.reference,
			})
		)
		const recipientHtml = await render(
			createElement(RecipientNotificationEmail, {
				amount: input.amountInCents / 100,
				donationDate: input.completedAt,
				donorName: "A supporter",
				electricityToken: input.token,
				electricityUnits: input.units,
				meterNumber: input.meterNumber,
				platformName: "Top Me Up",
				platformWebsite,
				receiptNumber: input.receiptNumber,
				recipientEmail: input.recipientEmail,
				recipientName: input.recipientName,
				transactionId: input.reference,
			})
		)

		const results = await Promise.allSettled([
			resend.emails.send({
				from,
				to: input.donorEmail,
				subject: `Your Top Me Up receipt ${input.receiptNumber}`,
				html: donorHtml,
			}),
			resend.emails.send({
				from,
				to: input.recipientEmail,
				subject: "Your electricity top-up is ready",
				html: recipientHtml,
			}),
		])
		for (const result of results) {
			if (result.status === "rejected") {
				console.error("[Completion notification failed]", safeErrorFields(result.reason))
			}
		}
	} catch (error) {
		if (error instanceof Error) {
			console.error("[Completion notification failed]", safeErrorFields(error))
			return
		}
		throw error
	}
}
