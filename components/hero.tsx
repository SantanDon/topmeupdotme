import { ArrowDownRight, CheckCircle2, Share2, ShieldCheck, Zap } from "lucide-react"
import { MeterForm } from "@/components/meter-form"

export function Hero() {
	return (
		<section className="energy-grid relative overflow-hidden bg-[#f4f7f2] px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-28 lg:pt-36">
			<div className="absolute left-[-8rem] top-20 size-80 rounded-full bg-lime-300/30 blur-3xl" />
			<div className="absolute right-[-10rem] top-32 size-96 rounded-full bg-emerald-300/20 blur-3xl" />
			<div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
				<div className="max-w-3xl">
					<div className="inline-flex items-center gap-2 rounded-full border border-emerald-950/10 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 shadow-sm">
						<span className="size-2 rounded-full bg-lime-500 shadow-[0_0_0_4px_rgba(132,204,22,0.16)]" />
						Community-powered electricity
					</div>
					<h1 className="mt-7 text-balance text-5xl font-bold leading-[0.96] tracking-[-0.045em] text-emerald-950 sm:text-6xl lg:text-7xl">
						Ask for a little help.
						<span className="mt-2 block text-emerald-700">Keep the lights on.</span>
					</h1>
					<p className="mt-7 max-w-2xl text-pretty text-base leading-7 text-slate-600 sm:text-lg">
						Verify your prepaid meter, create one secure support link, and share it with the people who want to help.
						Their top-up becomes electricity for your meter.
					</p>
					<div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-700">
						<span className="flex items-center gap-2">
							<CheckCircle2 className="size-4 text-emerald-700" />
							Verified meters
						</span>
						<span className="flex items-center gap-2">
							<ShieldCheck className="size-4 text-emerald-700" />
							Secure payments
						</span>
						<span className="flex items-center gap-2">
							<Zap className="size-4 text-emerald-700" />
							Direct electricity tokens
						</span>
					</div>
					<a
						className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 transition hover:text-emerald-600"
						href="#how-it-works"
					>
						See how it works
						<ArrowDownRight className="size-4" />
					</a>
				</div>

				<div className="relative" id="request-support">
					<div className="absolute -left-5 -top-5 hidden rotate-[-5deg] items-center gap-2 rounded-xl bg-lime-300 px-4 py-3 text-xs font-bold text-emerald-950 shadow-lg sm:flex">
						<Share2 className="size-4" />
						Share anywhere
					</div>
					<MeterForm />
				</div>
			</div>
		</section>
	)
}
