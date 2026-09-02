import "server-only"
import { getDBCache } from "@/db/main"
import { DonationsDBSchema } from "@/db/no-cache-db"
import { donationsTable } from "@/db/schemas/donation"
import { count, desc, eq, sum } from "drizzle-orm"
import { LibSQLDatabase } from "drizzle-orm/libsql"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import relativeTime from "dayjs/plugin/relativeTime"
import { notFound } from "next/navigation"

dayjs.extend(utc)
dayjs.extend(relativeTime)

const fetchRequestInfo = async (db: LibSQLDatabase<DonationsDBSchema>, id: string) => {
	return await db.query.requestsTable.findFirst({
		columns: {
			firstName: true,
			lastName: true,
			meterNumber: true,
			updatedAt: true,
			minimumVendAmount: true, // in cents
			maximumVendAmount: true, // in cents
		},
		with: {
			donations: {
				columns: {
					donationAmount: true, // in cents
					updatedAt: true,
				},
				orderBy: desc(donationsTable.updatedAt),
				limit: 3,
			},
		},
		where: (t, { eq }) => eq(t.publicId, id),
	})
}

const fetchRecentDonationsInfo = async (db: LibSQLDatabase<DonationsDBSchema>, id: string) => {
	return await db
		.select({
			totalDonationsCount: count(),
			totalDonationsAmount: sum(donationsTable.donationAmount),
		})
		.from(donationsTable)
		.where(eq(donationsTable.publicRequestId, id))
		.get()
}
export const getDonationRequestSummary = async (id: string) => {
	if (!id) {
		return notFound()
	}
	const db = await getDBCache()
	const [requestInfo, recentDonationsInfo] = await Promise.all([
		fetchRequestInfo(db, id),
		fetchRecentDonationsInfo(db, id),
	])
	if (!requestInfo || !recentDonationsInfo) {
		return notFound()
	}
	const hasExceeded24Hours = dayjs().diff(dayjs(requestInfo.updatedAt), "hour", true) > 24
	if (hasExceeded24Hours) {
		return notFound()
	}
	return {
		meterNumber: requestInfo.meterNumber,
		totalDonationsCount: recentDonationsInfo.totalDonationsCount || 0,
		totalDonationsAmount: recentDonationsInfo.totalDonationsAmount,
		minimumVendAmountInZAR: requestInfo.minimumVendAmount / 100,
		maximumVendAmountInZAR: requestInfo.maximumVendAmount ? requestInfo.maximumVendAmount / 100 : 100_000 / 100,
		receipientName: `${requestInfo.firstName} ${requestInfo.lastName}`,
		meterNumberLastThreeDigits: requestInfo.meterNumber.slice(-3),
		expiresIn: dayjs(requestInfo.updatedAt).utc().add(24, "hour").from(dayjs().utc()),
		recentDonations: requestInfo.donations.map((donation) => ({
			amount: donation.donationAmount / 100,
			updatedAt: dayjs(donation.updatedAt).utc().fromNow(),
		})),
	}
}
