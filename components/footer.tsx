import { Zap } from "lucide-react"
import Link from "next/link"

export function Footer() {
	return (
		<footer className="border-t border-emerald-950/10 bg-emerald-950 text-white">
			<div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
				<div>
					<Link className="inline-flex items-center gap-2" href="/">
						<span className="grid size-9 place-items-center rounded-xl bg-lime-300 text-emerald-950">
							<Zap className="size-4 fill-current" />
						</span>
						<span className="font-display text-lg font-bold">topmeup.me</span>
					</Link>
					<p className="mt-4 max-w-sm text-sm leading-6 text-emerald-100/70">
						A simpler way to ask your community for prepaid electricity support.
					</p>
				</div>
				<div>
					<p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-200">Explore</p>
					<div className="mt-4 flex flex-col gap-3 text-sm text-emerald-100/75">
						<Link className="hover:text-white" href="/#how-it-works">
							How it works
						</Link>
						<Link className="hover:text-white" href="/about">
							About us
						</Link>
					</div>
				</div>
				<div>
					<p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-200">Legal</p>
					<div className="mt-4 flex flex-col gap-3 text-sm text-emerald-100/75">
						<Link className="hover:text-white" href="/privacy">
							Privacy
						</Link>
						<Link className="hover:text-white" href="/terms">
							Terms
						</Link>
					</div>
				</div>
			</div>
			<div className="border-t border-white/10 px-4 py-5 text-center text-xs text-emerald-100/60">
				© {new Date().getFullYear()} TopMeUp. Built for community support in South Africa.
			</div>
		</footer>
	)
}
