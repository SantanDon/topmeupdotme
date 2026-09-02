import { Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MobileMenu } from "./mobile-menu"

export function Navbar() {
	return (
		<header className="fixed inset-x-0 top-0 z-50 border-b border-emerald-950/10 bg-[#f4f7f2]/90 backdrop-blur-xl">
			<nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link aria-label="TopMeUp home" className="flex items-center gap-2" href="/">
					<span className="grid size-9 place-items-center rounded-xl bg-emerald-950 text-lime-300">
						<Zap className="size-4 fill-current" />
					</span>
					<span className="font-display text-lg font-bold tracking-tight text-emerald-950">topmeup.me</span>
				</Link>
				<div className="hidden items-center gap-7 sm:flex">
					<Link className="text-sm font-semibold text-slate-600 transition hover:text-emerald-800" href="/#how-it-works">
						How it works
					</Link>
					<Link className="text-sm font-semibold text-slate-600 transition hover:text-emerald-800" href="/about">
						About
					</Link>
					<Button asChild className="rounded-xl bg-emerald-950 text-white hover:bg-emerald-800">
						<Link href="/#request-support">Request support</Link>
					</Button>
				</div>
				<div className="sm:hidden">
					<MobileMenu />
				</div>
			</nav>
		</header>
	)
}
