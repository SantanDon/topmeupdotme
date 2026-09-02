import { notFound } from "next/navigation"
import { z } from "zod"
import { PaymentStatus } from "@/components/payment-status"

const searchParamsSchema = z.object({
	reference: z.string().regex(/^TMU-[\dA-Za-z]{24}$/).optional(),
	trxref: z.string().regex(/^TMU-[\dA-Za-z]{24}$/).optional(),
})

export default async function PaymentCompletePage({
	searchParams,
}: {
	readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const parsed = searchParamsSchema.safeParse(await searchParams)
	if (!parsed.success) {
		notFound()
	}
	const reference = parsed.data.reference ?? parsed.data.trxref
	if (!reference) {
		notFound()
	}

	return (
		<div className="min-h-screen bg-[#f4f7f2] px-4 pb-16 pt-28">
			<PaymentStatus reference={reference} />
		</div>
	)
}
