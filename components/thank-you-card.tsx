"use client"

import { Check, CheckCircle2, Copy, Zap } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

type ThankYouCardProps = {
	readonly receipt: string
	readonly token: string
	readonly amount: string
	readonly unit: string
	readonly quantity: string
	readonly reference: string
	readonly receipientName: string
	readonly date: string
	readonly meterNumber: string | number
}

export function ThankyouCard(props: ThankYouCardProps) {
	const [copied, setCopied] = useState(false)
	const transactionDetails = [
		`Electricity token: ${props.token}`,
		`Meter: ${props.meterNumber}`,
		`Amount: R${props.amount}`,
		`Units: ${props.quantity} ${props.unit}`,
		`Receipt: ${props.receipt}`,
		`Reference: ${props.reference}`,
	].join("\n")

	const handleCopy = async () => {
		await navigator.clipboard.writeText(transactionDetails)
		setCopied(true)
		toast.success("Token and receipt copied")
		setTimeout(() => setCopied(false), 2_000)
	}

	return (
		<div className="mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
			<div className="bg-emerald-950 px-7 py-9 text-white sm:px-10">
				<CheckCircle2 className="size-11 text-lime-300" />
				<p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-lime-200">Electricity delivered</p>
				<h1 className="mt-2 text-4xl font-bold tracking-tight">Thank you for showing up.</h1>
				<p className="mt-3 text-sm leading-6 text-emerald-100/75">
					Your top-up for {props.receipientName} was converted into a prepaid electricity token.
				</p>
			</div>

			<div className="p-7 sm:p-10">
				<div className="rounded-2xl border border-lime-300/70 bg-lime-50 p-5 text-center">
					<div className="mx-auto grid size-10 place-items-center rounded-xl bg-lime-300 text-emerald-950">
						<Zap className="size-5 fill-current" />
					</div>
					<p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Electricity token</p>
					<p className="mt-2 break-words font-mono text-xl font-bold tracking-[0.12em] text-emerald-950 sm:text-2xl">
						{props.token}
					</p>
				</div>

				<dl className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
					{[
						["Amount", `R${props.amount}`],
						["Electricity", `${props.quantity} ${props.unit}`],
						["Meter", props.meterNumber.toString()],
						["Receipt", props.receipt],
						["Reference", props.reference],
						["Date", props.date],
					].map(([label, value]) => (
						<div className="border-b border-slate-100 pb-3" key={label}>
							<dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt>
							<dd className="mt-1 break-all text-sm font-semibold text-slate-800">{value}</dd>
						</div>
					))}
				</dl>

				<div className="mt-7 grid gap-3 sm:grid-cols-3 print:hidden">
					<Button
						className="h-11 rounded-xl bg-emerald-950 font-bold text-white hover:bg-emerald-800"
						onClick={handleCopy}
					>
						{copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
						{copied ? "Copied" : "Copy token and receipt"}
					</Button>
					<Button asChild className="h-11 rounded-xl" variant="outline">
						<Link href="/">Return home</Link>
					</Button>
					<Button asChild className="h-11 rounded-xl" variant="outline">
						<a download href={`/api/receipts/${encodeURIComponent(props.reference)}`}>
							Download PDF
						</a>
					</Button>
				</div>
			</div>
		</div>
	)
}
