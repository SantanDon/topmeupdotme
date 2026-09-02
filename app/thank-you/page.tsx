import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { z } from "zod"
import { ThankyouCard } from "@/components/thank-you-card"
import { getDBCache } from "@/db/main"
import { donationsTable } from "@/db/schemas/donation"

dayjs.extend(utc)

const searchParamsSchema = z.object({
	reference: z.string().regex(/^TMU-[\dA-Za-z]{24}$/),
})

export default async function DonationThankYouPage({
	searchParams,
}: {
	readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const parsed = searchParamsSchema.safeParse(await searchParams)
	if (!parsed.success) {
		notFound()
	}
	const db = await getDBCache()
	const donation = await db.query.donationsTable.findFirst({
		where: eq(donationsTable.transactionRequestId, parsed.data.reference),
	})
	if (!donation || !donation.transactionReference) {
		notFound()
	}
	return (
		<div className="min-h-screen bg-[#f4f7f2] px-4 pb-16 pt-24">
			<ThankyouCard
				amount={(donation.donationAmount / 100).toFixed(2)}
				date={dayjs(donation.updatedAt).utc().format("DD MMM YYYY, HH:mm [UTC]")}
				meterNumber={donation.receipientMeterNumber}
				quantity={donation.electricityQuantity.toString()}
				receipt={donation.transactionReceipt}
				receipientName={`${donation.receipientFirstName} ${donation.receipientLastName}`}
				reference={donation.transactionReference}
				token={donation.token}
				unit={donation.energyUnit}
			/>
		</div>
	)
}
