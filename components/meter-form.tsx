"use client"

import { Check, ChevronLeft, LockKeyhole } from "lucide-react"
import Link from "next/link"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import type { z } from "zod"
import { generateLinkAction, verifyMeterAction } from "@/actions/meter"
import { Button } from "@/components/ui/button"
import type { recipientDetailsSchema, verifyMeterSchema } from "@/lib/validations"
import { MeterVerificationForm } from "./meter-verification-form"
import { RecipientDetailsForm } from "./recipient-details-form"

type LinkGenerationFormPhase = "verify-meter" | "choose-provider" | "meter-verified"

type VerifiedAccount = {
	readonly voucherCode: string
	readonly customerName: string
	readonly utilityName: string
	readonly minimumVendAmountInCents: number
	readonly maximumVendAmountInCents: number
}

export function MeterForm() {
	const [phase, setPhase] = useState<LinkGenerationFormPhase>("verify-meter")
	const [verifiedMeterNumber, setVerifiedMeterNumber] = useState("")
	const [verifiedAccounts, setVerifiedAccounts] = useState<readonly VerifiedAccount[]>([])
	const [selectedVoucherCode, setSelectedVoucherCode] = useState("")
	const { isPending: isVerifyingMeter, execute: verifyMeter } = useAction(verifyMeterAction, {
		onSuccess: ({ data }) => {
			if (data?.status === "meter-verified" && data.accounts.length > 0) {
				setVerifiedAccounts(data.accounts)
				setSelectedVoucherCode(data.accounts[0]?.voucherCode ?? "")
				setPhase(data.accounts.length > 1 ? "choose-provider" : "meter-verified")
			}
		},
		onError: () => {
			toast.error("We could not verify that meter. Check the number and try again.")
			setPhase("verify-meter")
		},
	})
	const { isPending: isGeneratingLink, execute: generateLink } = useAction(generateLinkAction, {
		onError: () => {
			toast.error("We could not create your link. Please try again.")
		},
	})

	const handleMeterVerification = async (values: z.infer<typeof verifyMeterSchema>) => {
		setVerifiedMeterNumber(values.meterNumber)
		setVerifiedAccounts([])
		setSelectedVoucherCode("")
		verifyMeter(values)
	}

	const handleRecipientDetails = async (values: z.infer<typeof recipientDetailsSchema>) => {
		generateLink({
			...values,
			meterNumber: verifiedMeterNumber,
			voucherCode: selectedVoucherCode,
		})
	}

	const isSubmitting = isVerifyingMeter || isGeneratingLink
	const isDetailsPhase = phase === "meter-verified"
	const isProviderChoicePhase = phase === "choose-provider"

	return (
		<div className="w-full rounded-[1.75rem] border border-emerald-950/10 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.14)] sm:p-8">
			<div className="mb-7 flex items-center justify-between gap-4">
				<div>
					<p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
					Step {isDetailsPhase ? "3" : isProviderChoicePhase ? "2" : "1"} of 3
					</p>
					<h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
						{isDetailsPhase ? "Where should we send updates?" : isProviderChoicePhase ? "Choose your electricity provider" : "Start with your meter"}
					</h2>
				</div>
				<div className="flex gap-1.5">
					<span className="h-1.5 w-8 rounded-full bg-emerald-700" />
				<span className={`h-1.5 w-8 rounded-full ${isProviderChoicePhase || isDetailsPhase ? "bg-emerald-700" : "bg-slate-200"}`} />
				<span className={`h-1.5 w-8 rounded-full ${isDetailsPhase ? "bg-emerald-700" : "bg-slate-200"}`} />
				</div>
			</div>

			{isDetailsPhase ? (
				<>
					<div className="mb-5 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5 text-xs">
						<span className="flex items-center gap-2 font-semibold text-emerald-900">
							<Check className="size-3.5" />
							Meter ending {verifiedMeterNumber.slice(-3)}
						</span>
						<Button
							className="h-auto p-0 text-xs text-emerald-700 hover:text-emerald-900"
							disabled={isGeneratingLink}
							onClick={() => setPhase("verify-meter")}
							type="button"
							variant="link"
						>
							<ChevronLeft className="mr-1 size-3" />
							Change
						</Button>
					</div>
					<RecipientDetailsForm
						buttonText={isGeneratingLink ? "Creating your link…" : "Create my support link"}
						isSubmitting={isGeneratingLink}
						onSubmit={handleRecipientDetails}
					/>
				</>
			) : isProviderChoicePhase ? (
				<div className="space-y-3">
					<p className="text-sm leading-6 text-slate-600">This meter is registered with more than one provider. Choose the one that matches the recipient’s electricity account.</p>
					{verifiedAccounts.map((account) => (
						<button
							className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-600 hover:bg-emerald-50"
							key={account.voucherCode}
							onClick={() => {
								setSelectedVoucherCode(account.voucherCode)
								setPhase("meter-verified")
							}}
							type="button"
						>
							<span className="block text-sm font-bold text-slate-900">{account.utilityName || "Electricity provider"}</span>
							<span className="mt-1 block text-xs text-slate-500">{account.customerName || "Account matched"}</span>
							<span className="mt-2 block text-xs font-semibold text-emerald-700">R{account.minimumVendAmountInCents / 100} to R{account.maximumVendAmountInCents / 100}</span>
						</button>
					))}
				</div>
			) : (
				<MeterVerificationForm
					buttonText={isVerifyingMeter ? "Checking your meter…" : "Verify meter"}
					isSubmitting={isVerifyingMeter}
					onSubmit={handleMeterVerification}
				/>
			)}

			<div className="mt-6 border-t border-slate-100 pt-5">
				<p className="flex items-start gap-2 text-xs leading-5 text-slate-500">
					<LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-emerald-700" />
					<span>
						Your meter number stays private. By continuing, you agree to our{" "}
						<Link className="font-semibold text-emerald-700 hover:underline" href="/terms">
							terms
						</Link>{" "}
						and{" "}
						<Link className="font-semibold text-emerald-700 hover:underline" href="/privacy">
							privacy policy
						</Link>
						.
					</span>
				</p>
			</div>
		</div>
	)
}
