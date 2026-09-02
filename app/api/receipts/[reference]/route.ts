import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"
import { getDB } from "@/db/no-cache-db"
import { donationsTable } from "@/db/schemas/donation"
import { createReceiptPdf } from "@/lib/server-only/receipt-pdf"

const referenceSchema = z.string().regex(/^TMU-[\dA-Za-z]{24}$/)

export async function GET(
	_request: Request,
	{ params }: { readonly params: Promise<{ readonly reference: string }> }
): Promise<Response> {
	const parsedReference = referenceSchema.safeParse((await params).reference)
	if (!parsedReference.success) {
		return NextResponse.json({ status: "not_found" }, { status: 404, headers: { "Cache-Control": "no-store" } })
	}
	const db = await getDB()
	const donation = await db.query.donationsTable.findFirst({
		where: eq(donationsTable.transactionRequestId, parsedReference.data),
	})
	if (!donation || !donation.transactionReference) {
		return NextResponse.json({ status: "not_found" }, { status: 404, headers: { "Cache-Control": "no-store" } })
	}

	const pdf = await createReceiptPdf({
		amount: (donation.donationAmount / 100).toFixed(2),
		date: new Date(donation.updatedAt).toISOString(),
		meterNumber: donation.receipientMeterNumber,
		quantity: donation.electricityQuantity.toString(),
		receipt: donation.transactionReceipt,
		recipientName: `${donation.receipientFirstName} ${donation.receipientLastName}`,
		reference: donation.transactionReference,
		token: donation.token,
		unit: donation.energyUnit,
	})
	return new Response(pdf, {
		headers: {
			"Cache-Control": "private, no-store",
			"Content-Disposition": `attachment; filename="topmeup-${parsedReference.data}.pdf"`,
			"Content-Type": "application/pdf",
		},
	})
}
