"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { getDB } from "@/db/no-cache-db"
import { requestsTable } from "@/db/schemas/donation"
import { customNanoid } from "@/lib/keys"
import { actionClient, PublicActionError } from "@/lib/server-only/action-client"
import { selectMeterAccount } from "@/lib/server-only/desert-retail/select-account"
import { desertRetailClient } from "@/lib/server-only/integrations"
import { getEnvURLData } from "@/lib/urls"
import { generationLinkSchemaWithVoucher, verifyMeterSchema } from "@/lib/validations"

export const verifyMeterAction = actionClient
	.metadata({
		actionName: "verifyMeter",
	})
	.schema(verifyMeterSchema)
	.outputSchema(
		z.object({
			status: z.literal("meter-verified"),
			accounts: z.array(
				z.object({
					voucherCode: z.string(),
					customerName: z.string(),
					utilityName: z.string(),
					minimumVendAmountInCents: z.number(),
					maximumVendAmountInCents: z.number(),
				})
			),
		})
	)
	.action(async ({ parsedInput }) => {
		const result = await desertRetailClient.confirmCustomer(parsedInput.meterNumber, `confirm-${customNanoid(20)}`)
		if (!result.ok || result.value.length === 0) {
			throw new PublicActionError("We could not verify that meter number. Check it and try again.")
		}
		return {
			status: "meter-verified",
			accounts: result.value.map((account) => ({
				voucherCode: account.voucherCode,
				customerName: account.customerName,
				utilityName: account.utilityName,
				minimumVendAmountInCents: account.minimumVendAmountInCents,
				maximumVendAmountInCents: account.maximumVendAmountInCents,
			})),
		}
	})

export const generateLinkAction = actionClient
	.metadata({
		actionName: "generateLink",
	})
	.schema(generationLinkSchemaWithVoucher)
	.action(async ({ parsedInput }) => {
		const meterResult = await desertRetailClient.confirmCustomer(parsedInput.meterNumber, `confirm-${customNanoid(20)}`)
		const selectedAccount = meterResult.ok ? selectMeterAccount(meterResult.value, parsedInput.voucherCode) : null
		if (!selectedAccount) {
			throw new PublicActionError("The meter could not be re-verified. Please restart and try again.")
		}

		const db = await getDB()
		const { baseURL } = getEnvURLData()
		const publicId = customNanoid()
		await db.insert(requestsTable).values({
			publicId,
			firstName: parsedInput.firstName,
			lastName: parsedInput.lastName,
			phone: parsedInput.phoneNumber,
			meterNumber: parsedInput.meterNumber,
			minimumVendAmount: selectedAccount.minimumVendAmountInCents,
			maximumVendAmount: selectedAccount.maximumVendAmountInCents,
			voucherCode: selectedAccount.voucherCode,
			email: parsedInput.email,
			generatedLink: `${baseURL}/d/${publicId}`,
		})
		redirect(`/share/${publicId}`)
	})
