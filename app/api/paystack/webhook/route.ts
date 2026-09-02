import { waitUntil } from "@vercel/functions"
import { NextResponse } from "next/server"
import { z } from "zod"
import { env } from "@/env/server"
import { fulfillPaidDonation } from "@/lib/server-only/paystack/fulfill-paid-donation"
import { readTextBodyWithLimit, RequestBodyTooLargeError } from "@/lib/server-only/http/read-text-body"
import { recordRefundStatus } from "@/lib/server-only/paystack/transaction-status"
import { isValidPaystackSignature } from "@/lib/server-only/paystack/signature"

const webhookEnvelopeSchema = z.object({
	event: z.string().min(1),
	data: z.unknown(),
})

const chargeSuccessDataSchema = z.object({
	reference: z.string().min(1),
})

const refundDataSchema = z.object({
	transaction_reference: z.string().min(1),
})

const MAX_PAYSTACK_WEBHOOK_BYTES = 64 * 1_024

export async function POST(request: Request): Promise<Response> {
	let rawBody: string
	try {
		rawBody = await readTextBodyWithLimit(request, MAX_PAYSTACK_WEBHOOK_BYTES)
	} catch (error) {
		if (error instanceof RequestBodyTooLargeError) {
			return NextResponse.json({ accepted: false }, { status: 413 })
		}
		throw error
	}
	const signature = request.headers.get("x-paystack-signature") ?? ""
	if (!isValidPaystackSignature(rawBody, signature, env.PAYSTACK_SECRET_KEY)) {
		return NextResponse.json({ accepted: false }, { status: 401 })
	}

	let input: unknown
	try {
		input = JSON.parse(rawBody)
	} catch (error) {
		if (error instanceof SyntaxError) {
			return NextResponse.json({ accepted: false }, { status: 400 })
		}
		throw error
	}
	const envelope = webhookEnvelopeSchema.safeParse(input)
	if (!envelope.success) {
		return NextResponse.json({ accepted: false }, { status: 400 })
	}

	if (envelope.data.event === "charge.success") {
		const charge = chargeSuccessDataSchema.safeParse(envelope.data.data)
		if (!charge.success) {
			return NextResponse.json({ accepted: false }, { status: 400 })
		}
		waitUntil(fulfillPaidDonation(charge.data.reference))
		return NextResponse.json({ accepted: true })
	}

	if (envelope.data.event.startsWith("refund.")) {
		const refund = refundDataSchema.safeParse(envelope.data.data)
		if (!refund.success) {
			return NextResponse.json({ accepted: false }, { status: 400 })
		}
		waitUntil(recordRefundStatus(envelope.data.event, refund.data.transaction_reference))
	}

	return NextResponse.json({ accepted: true })
}
