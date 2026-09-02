"use client"

import { CircleCheck, Clock3, Loader2, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { nextPaymentStatusPollDelay } from "./payment-status-policy"

const statusResponseSchema = z.object({
	status: z.enum([
		"pending",
		"vending",
		"completed",
		"failed",
		"refund_pending",
		"refunded",
		"reconciliation_required",
	]),
	redirectUrl: z.string().optional(),
})

type PaymentStatusProps = {
	readonly reference: string
}

export function PaymentStatus({ reference }: PaymentStatusProps) {
	const router = useRouter()
	const [status, setStatus] = useState<z.infer<typeof statusResponseSchema>["status"]>("pending")
	const [hasTimedOut, setHasTimedOut] = useState(false)

	useEffect(() => {
		const controller = new AbortController()
		let timeoutId: ReturnType<typeof setTimeout> | undefined
		const deadline = Date.now() + 10 * 60_000
		setStatus("pending")
		setHasTimedOut(false)

		const scheduleNextCheck = (retryAfterMs = 0): void => {
			const delay = nextPaymentStatusPollDelay(Date.now(), deadline, retryAfterMs)
			if (delay === null) {
				setHasTimedOut(true)
				return
			}
			timeoutId = setTimeout(checkStatus, delay)
		}

		const checkStatus = async (): Promise<void> => {
			try {
				const response = await fetch(`/api/payments/${encodeURIComponent(reference)}`, {
					cache: "no-store",
					signal: controller.signal,
				})
				if (!response.ok) {
					const retryAfterSeconds = Number.parseInt(response.headers.get("retry-after") ?? "", 10)
					const retryAfterMs =
						Number.isSafeInteger(retryAfterSeconds) && retryAfterSeconds > 0 ? retryAfterSeconds * 1_000 : 0
					scheduleNextCheck(retryAfterMs)
					return
				}
				const result = statusResponseSchema.parse(await response.json())
				setStatus(result.status)
				if (result.status === "completed" && result.redirectUrl) {
					router.replace(result.redirectUrl)
					return
				}
				if (result.status === "pending" || result.status === "vending") {
					scheduleNextCheck()
				}
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError") {
					return
				}
				scheduleNextCheck(3_000)
			}
		}

		void checkStatus()
		return () => {
			controller.abort()
			if (timeoutId) {
				clearTimeout(timeoutId)
			}
		}
	}, [reference, router])

	const isRefund = status === "refund_pending" || status === "refunded"
	const needsHelp = status === "failed" || status === "reconciliation_required"

	return (
		<div className="mx-auto max-w-lg rounded-[2rem] border border-emerald-950/10 bg-white p-8 text-center shadow-[0_30px_90px_rgba(15,23,42,0.12)] sm:p-10">
			<div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-950 text-lime-300">
				{isRefund ? (
					<RotateCcw className="size-7" />
				) : hasTimedOut || needsHelp ? (
					<Clock3 className="size-7" />
				) : status === "completed" ? (
					<CircleCheck className="size-7" />
				) : (
					<Loader2 className="size-7 animate-spin" />
				)}
			</div>
			<p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Top-up received</p>
			<h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
				{isRefund
					? "Your refund is being handled"
					: hasTimedOut
						? "Payment status is taking longer"
						: needsHelp
							? "We are checking your top-up"
							: "Delivering electricity"}
			</h1>
			<p className="mt-4 text-sm leading-6 text-slate-600">
				{isRefund
					? "The electricity purchase could not be completed, so a full refund was started automatically."
					: hasTimedOut
						? "The payment may still be processing. Keep this reference and contact us if the token does not arrive."
						: needsHelp
							? "Your payment is safe. The provider response needs a manual check before we can confirm the token."
							: "Please keep this page open while we verify payment and issue the electricity token."}
			</p>
			<div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 font-mono text-xs text-slate-500">{reference}</div>
			{(isRefund || needsHelp || hasTimedOut) && (
				<Button asChild className="mt-6 rounded-xl bg-emerald-700 hover:bg-emerald-800">
					<Link href="/">Return home</Link>
				</Button>
			)}
		</div>
	)
}
