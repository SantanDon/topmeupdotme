"use server"

import { and, eq } from "drizzle-orm"
import { z } from "zod"
import { getDB } from "@/db/no-cache-db"
import { requestsTable } from "@/db/schemas/donation"
import { transactionsTable } from "@/db/schemas/transactions"
import { customNanoid } from "@/lib/keys"
import { actionClient, PublicActionError } from "@/lib/server-only/action-client"
import { paystackClient } from "@/lib/server-only/integrations"
import { getEnvURLData } from "@/lib/urls"
import { initializeDonationSchema } from "@/lib/validations"

export const initializeDonationAction = actionClient
	.metadata({
		actionName: "initializeDonation",
	})
	.schema(initializeDonationSchema)
	.outputSchema(
		z.object({
			authorizationUrl: z.string().url(),
		})
	)
	.action(async ({ parsedInput }) => {
		const db = await getDB()
		const request = await db.query.requestsTable.findFirst({
			columns: {
				publicId: true,
				status: true,
				minimumVendAmount: true,
				maximumVendAmount: true,
				updatedAt: true,
			},
			where: and(eq(requestsTable.publicId, parsedInput.publicId), eq(requestsTable.status, "activated")),
		})
		if (!request || Date.now() - new Date(request.updatedAt).getTime() > 24 * 60 * 60 * 1_000) {
			throw new PublicActionError("This donation link has expired.")
		}

		const maximumVendAmount = request.maximumVendAmount ?? 100_000
		if (
			parsedInput.amountInCents < request.minimumVendAmount ||
			parsedInput.amountInCents > maximumVendAmount
		) {
			throw new PublicActionError(
				`Choose an amount between R${request.minimumVendAmount / 100} and R${maximumVendAmount / 100}.`
			)
		}

		const providerReference = `TMU-${customNanoid(24)}`
		await db.insert(transactionsTable).values({
			publicRequestId: request.publicId,
			providerReference,
			donorEmail: parsedInput.donorEmail,
			amountInCents: parsedInput.amountInCents,
		})

		try {
			const { baseURL } = getEnvURLData()
			const initialized = await paystackClient.initializeTransaction({
				amountInCents: parsedInput.amountInCents,
				callbackUrl: `${baseURL}/payment/complete`,
				donorEmail: parsedInput.donorEmail,
				publicRequestId: request.publicId,
				reference: providerReference,
			})
			return {
				authorizationUrl: initialized.authorizationUrl,
			}
		} catch (error) {
			await db
				.update(transactionsTable)
				.set({
					status: "failed",
					failureReason: "Payment initialization failed",
					updatedAt: new Date(),
				})
				.where(eq(transactionsTable.providerReference, providerReference))
			if (error instanceof Error) {
				throw new PublicActionError("Payment could not be started. Please try again.", { cause: error })
			}
			throw error
		}
	})
