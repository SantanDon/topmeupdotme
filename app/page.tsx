import { BadgeCheck, CreditCard, Share2, Sparkles, Zap } from "lucide-react"
import { Hero } from "@/components/hero"

const steps = [
	{
		number: "01",
		title: "Verify your meter",
		description: "Enter your prepaid meter number. We check it with the electricity provider before a link can be created.",
		icon: BadgeCheck,
	},
	{
		number: "02",
		title: "Share one link",
		description: "Your private meter number stays masked. Friends and family see a simple, trustworthy request page.",
		icon: Share2,
	},
	{
		number: "03",
		title: "Receive electricity",
		description: "After a secure payment, the top-up is converted into a token and your receipt is recorded.",
		icon: Zap,
	},
] as const

export default function Home() {
	return (
		<>
			<Hero />
			<section className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28" id="how-it-works">
				<div className="mx-auto max-w-7xl">
					<div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
						<div>
							<p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Three simple steps</p>
							<h2 className="mt-4 max-w-md text-4xl font-bold tracking-tight text-emerald-950 sm:text-5xl">
								Help that reaches the meter.
							</h2>
							<p className="mt-5 max-w-md text-sm leading-7 text-slate-600">
								No bank beneficiary setup. No public meter number. Just a clear path from someone who cares to the
								electricity you need.
							</p>
						</div>
						<div className="grid gap-4">
							{steps.map((step) => {
								const Icon = step.icon
								return (
									<div
										className="group grid gap-5 rounded-2xl border border-emerald-950/10 bg-[#f8faf6] p-6 transition hover:-translate-y-0.5 hover:border-emerald-700/30 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:grid-cols-[auto_1fr_auto] sm:items-center"
										key={step.number}
									>
										<span className="font-mono text-xs font-bold text-emerald-700">{step.number}</span>
										<div>
											<h3 className="text-xl font-bold text-slate-950">{step.title}</h3>
											<p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
										</div>
										<span className="grid size-11 place-items-center rounded-xl bg-emerald-950 text-lime-300 transition group-hover:rotate-3">
											<Icon className="size-5" />
										</span>
									</div>
								)
							})}
						</div>
					</div>
				</div>
			</section>

			<section className="px-4 py-20 sm:px-6 lg:px-8">
				<div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-emerald-950 text-white lg:grid-cols-2">
					<div className="p-8 sm:p-12 lg:p-16">
						<div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-lime-200">
							<Sparkles className="size-3.5" />
							Built for trust
						</div>
						<h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Kindness needs a safe handoff.</h2>
						<p className="mt-5 max-w-lg text-sm leading-7 text-emerald-100/75">
							Meter details are verified server-side, payment happens on Paystack, and electricity is issued only after
							the provider confirms the payment.
						</p>
					</div>
					<div className="grid content-center gap-4 bg-lime-300 p-8 text-emerald-950 sm:p-12 lg:p-16">
						<div className="flex items-start gap-4 rounded-2xl bg-white/55 p-5">
							<CreditCard className="mt-0.5 size-5 shrink-0" />
							<div>
								<p className="font-bold">Payment details stay with Paystack</p>
								<p className="mt-1 text-sm leading-6 text-emerald-950/70">TopMeUp never stores card numbers.</p>
							</div>
						</div>
						<div className="flex items-start gap-4 rounded-2xl bg-white/55 p-5">
							<BadgeCheck className="mt-0.5 size-5 shrink-0" />
							<div>
								<p className="font-bold">Each request expires after 24 hours</p>
								<p className="mt-1 text-sm leading-6 text-emerald-950/70">Old links cannot linger indefinitely.</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}
