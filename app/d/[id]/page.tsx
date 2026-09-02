import { Clock3, HeartHandshake, ShieldCheck, Zap } from "lucide-react"
import { DonationForm } from "@/components/donation-form"
import { getDonationRequestSummary } from "@/lib/server-only/fetchers/donation"

export default async function DonatePage({ params }: { readonly params: Promise<{ readonly id: string }> }) {
	const { id } = await params
	const request = await getDonationRequestSummary(id)

	return (
		<div className="min-h-screen bg-[#f4f7f2] px-4 pb-16 pt-24 text-slate-950 sm:px-6 lg:px-8">
			<div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
				<aside className="relative overflow-hidden bg-emerald-950 px-6 py-10 text-white sm:px-10 lg:px-12 lg:py-14">
					<div className="absolute -right-24 -top-24 size-64 rounded-full border border-lime-300/20" />
					<div className="absolute -right-12 -top-12 size-40 rounded-full border border-lime-300/20" />
					<div className="relative">
						<div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-lime-200">
							<HeartHandshake className="size-3.5" />
							Verified request
						</div>
						<p className="text-sm font-medium text-emerald-200">You are helping</p>
						<h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{request.receipientName}</h1>
						<p className="mt-4 max-w-md text-sm leading-6 text-emerald-100/75">
							Your payment is converted into a prepaid electricity token for the verified meter below.
						</p>

						<div className="mt-10 space-y-3">
							<div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4">
								<div className="grid size-10 place-items-center rounded-xl bg-lime-300 text-emerald-950">
									<Zap className="size-5" />
								</div>
								<div>
									<p className="text-xs uppercase tracking-wider text-emerald-200/70">Verified meter</p>
									<p className="mt-1 font-mono text-base tracking-[0.2em]">••••••••{request.meterNumberLastThreeDigits}</p>
								</div>
							</div>
							<div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4">
								<div className="grid size-10 place-items-center rounded-xl bg-white/10 text-lime-200">
									<Clock3 className="size-5" />
								</div>
								<div>
									<p className="text-xs uppercase tracking-wider text-emerald-200/70">Request expires</p>
									<p className="mt-1 text-sm font-semibold">{request.expiresIn}</p>
								</div>
							</div>
						</div>

						<div className="mt-10 border-t border-white/10 pt-6">
							<div className="flex items-center justify-between text-sm">
								<span className="text-emerald-100/70">Community support so far</span>
								<span className="font-bold">{request.totalDonationsCount} top-ups</span>
							</div>
							<div className="mt-2 flex items-end justify-between">
								<span className="text-xs text-emerald-100/60">Total delivered</span>
								<span className="text-2xl font-bold text-lime-200">
									R{Number(request.totalDonationsAmount ?? 0) / 100}
								</span>
							</div>
						</div>
					</div>
				</aside>

				<section className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
					<div className="mx-auto max-w-xl">
						<div className="flex items-center justify-between gap-4">
							<div>
							<p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Electricity top-up</p>
								<h2 className="mt-2 text-3xl font-bold tracking-tight">Keep the lights on</h2>
							</div>
							<ShieldCheck className="size-8 text-emerald-700" />
						</div>
						<p className="mb-8 mt-3 text-sm leading-6 text-slate-600">
							Choose what you can give. Every successful payment is matched to this meter before electricity is issued.
						</p>
						<DonationForm
							maximumVendAmountInCents={request.maximumVendAmountInZAR * 100}
							minimumVendAmountInCents={request.minimumVendAmountInZAR * 100}
							publicId={id}
						/>
					</div>
				</section>
			</div>
		</div>
	)
}
