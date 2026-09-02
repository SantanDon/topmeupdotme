import { HeartHandshake, Link2, ShieldCheck, Zap } from "lucide-react"

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-[#f4f7f2] px-4 pb-20 pt-28 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-6xl">
				<section className="grid gap-10 overflow-hidden rounded-[2rem] bg-emerald-950 p-8 text-white sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:p-16">
					<div>
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-200">Why TopMeUp exists</p>
						<h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-6xl">A small ask should be simple to answer.</h1>
					</div>
					<div className="self-end">
						<p className="text-base leading-8 text-emerald-100/75">
							TopMeUp helps people request prepaid electricity support without publishing their meter number or asking
							friends to set up a bank beneficiary.
						</p>
					</div>
				</section>

				<section className="grid gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr]">
					<div>
						<p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">The idea</p>
						<h2 className="mt-4 text-4xl font-bold tracking-tight text-emerald-950">Turn a shared link into real electricity.</h2>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						{[
							{
								title: "Private by default",
								description: "Supporters see a masked meter reference, not the full number.",
								icon: ShieldCheck,
							},
							{
								title: "Easy to share",
								description: "One temporary link works across WhatsApp and social media.",
								icon: Link2,
							},
							{
								title: "Purpose-bound",
								description: "The payment is used to purchase electricity for the verified meter.",
								icon: Zap,
							},
							{
								title: "Built for community",
								description: "The product makes everyday mutual aid easier to give and receive.",
								icon: HeartHandshake,
							},
						].map((item) => {
							const Icon = item.icon
							return (
								<div className="rounded-2xl border border-emerald-950/10 bg-white p-6" key={item.title}>
									<span className="grid size-10 place-items-center rounded-xl bg-lime-300 text-emerald-950">
										<Icon className="size-5" />
									</span>
									<h3 className="mt-5 text-xl font-bold text-slate-950">{item.title}</h3>
									<p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
								</div>
							)
						})}
					</div>
				</section>

				<section className="rounded-[2rem] border border-emerald-950/10 bg-white p-8 sm:p-12">
					<p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Founder</p>
					<h2 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950">Mathemba Magwentshu</h2>
					<p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
						Mathemba created TopMeUp around a practical belief: technology should reduce the friction between someone who
						needs help and someone ready to offer it. The platform starts with prepaid electricity because the outcome is
						immediate, specific, and easy to understand.
					</p>
				</section>
			</div>
		</div>
	)
}
