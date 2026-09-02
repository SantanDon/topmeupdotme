"use client"

import { Check, Copy, Share2 } from "lucide-react"
import {
	FacebookIcon,
	FacebookShareButton,
	TwitterIcon,
	TwitterShareButton,
	WhatsappIcon,
	WhatsappShareButton,
} from "react-share"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "./ui/button"

type ShareCardProps = {
	readonly donationLink: string
	readonly receipientName: string
}

export function ShareCard({ donationLink, receipientName }: ShareCardProps) {
	const [copied, setCopied] = useState(false)
	const shareMessage = `Help ${receipientName} with a prepaid electricity top-up`

	const handleCopy = async () => {
		await navigator.clipboard.writeText(donationLink)
		setCopied(true)
		toast.success("Support link copied")
		setTimeout(() => setCopied(false), 2_000)
	}

	return (
		<div className="w-full max-w-lg rounded-[2rem] border border-emerald-950/10 bg-white p-7 shadow-[0_30px_90px_rgba(15,23,42,0.12)] sm:p-10">
			<div className="grid size-14 place-items-center rounded-2xl bg-lime-300 text-emerald-950">
				<Share2 className="size-6" />
			</div>
			<p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Your link is ready</p>
			<h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Share it with people you trust.</h1>
			<p className="mt-3 text-sm leading-6 text-slate-600">
				The page keeps your full meter number private and lets supporters choose what they can give.
			</p>

			<div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-3">
				<p className="break-all font-mono text-xs leading-5 text-slate-600">{donationLink}</p>
				<Button
					className="mt-3 h-11 w-full rounded-xl bg-emerald-950 font-bold text-white hover:bg-emerald-800"
					onClick={handleCopy}
				>
					{copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
					{copied ? "Copied" : "Copy support link"}
				</Button>
			</div>

			<div className="mt-7">
				<p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Or share directly</p>
				<div className="mt-3 flex gap-3">
					<WhatsappShareButton title={shareMessage} url={donationLink}>
						<WhatsappIcon round size={38} />
					</WhatsappShareButton>
					<FacebookShareButton title={shareMessage} url={donationLink}>
						<FacebookIcon round size={38} />
					</FacebookShareButton>
					<TwitterShareButton title={shareMessage} url={donationLink}>
						<TwitterIcon round size={38} />
					</TwitterShareButton>
				</div>
			</div>
			<p className="mt-7 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500">
				This link expires automatically after 24 hours.
			</p>
		</div>
	)
}
