import { getDB } from "@/db/no-cache-db"
import { requestsTable } from "@/db/schemas/donation"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { ShareCard } from "@/components/share-card"

type Props = {
	params: Promise<{
		pubId: string
	}>
}

const ShareLinkPage = async ({ params }: Props) => {
	const db = await getDB()
	const [donationRequest] = await db
		.select({
			generatedLink: requestsTable.generatedLink,
			firstName: requestsTable.firstName,
			lastName: requestsTable.lastName,
		})
		.from(requestsTable)
		.where(eq(requestsTable.publicId, (await params).pubId))
		.limit(1)

	if (!donationRequest) {
		notFound()
	}

	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-[#f4f7f2] px-4 pb-16 pt-24">
			<ShareCard
				donationLink={donationRequest.generatedLink}
				receipientName={`${donationRequest.firstName} ${donationRequest.lastName}`}
			/>
		</div>
	)
}

export default ShareLinkPage
