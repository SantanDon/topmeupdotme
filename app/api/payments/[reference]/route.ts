import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"
import { getDB } from "@/db/no-cache-db"
import { transactionsTable } from "@/db/schemas/transactions"
import { createRateLimiter } from "@/lib/server-only/http/rate-limit"

const referenceSchema = z.string().regex(/^TMU-[\dA-Za-z]{24}$/)
const statusRateLimiter = createRateLimiter({ limit: 60, windowMs: 60_000 })

export async function GET(
	_request: Request,
	{ params }: { readonly params: Promise<{ readonly reference: string }> }
): Promise<Response> {
	const clientKey = requestClientKey(_request)
	const rateLimit = statusRateLimiter.check(clientKey)
	if (!rateLimit.allowed) {
		return NextResponse.json(
			{ status: "rate_limited" },
			{
				headers: {
					"Cache-Control": "no-store",
					"Retry-After": String(rateLimit.retryAfterSeconds),
				},
				status: 429,
			}
		)
	}
	const parsedReference = referenceSchema.safeParse((await params).reference)
	if (!parsedReference.success) {
		return NextResponse.json({ status: "not_found" }, { status: 404, headers: { "Cache-Control": "no-store" } })
	}
	const db = await getDB()
	const transaction = await db.query.transactionsTable.findFirst({
		columns: {
			status: true,
		},
		where: eq(transactionsTable.providerReference, parsedReference.data),
	})
	if (!transaction) {
		return NextResponse.json({ status: "not_found" }, { status: 404, headers: { "Cache-Control": "no-store" } })
	}
	return NextResponse.json(
		{
			status: transaction.status,
			redirectUrl:
				transaction.status === "completed"
					? `/thank-you?reference=${encodeURIComponent(parsedReference.data)}`
					: undefined,
		},
		{ headers: { "Cache-Control": "no-store" } }
	)
}

function requestClientKey(request: Request): string {
	const forwardedFor = request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim()
	return forwardedFor || request.headers.get("x-real-ip")?.trim() || "anonymous"
}
