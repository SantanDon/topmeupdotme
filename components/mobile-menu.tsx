"use client"

import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { Menu, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function MobileMenu() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button aria-label="Open menu" className="bg-transparent text-emerald-950 hover:bg-emerald-100" size="icon">
					<Menu className="size-5" />
				</Button>
			</SheetTrigger>
			<SheetContent className="border-emerald-950/10 bg-[#f4f7f2]" side="top">
				<SheetTitle>
					<VisuallyHidden.Root>Navigation menu</VisuallyHidden.Root>
				</SheetTitle>
				<SheetHeader>
					<div className="flex items-center gap-2 text-left text-emerald-950">
						<span className="grid size-9 place-items-center rounded-xl bg-emerald-950 text-lime-300">
							<Zap className="size-4 fill-current" />
						</span>
						<span className="font-display font-bold">topmeup.me</span>
					</div>
					<nav className="flex flex-col gap-1 pt-5 text-left">
						<Link className="rounded-xl px-3 py-3 font-semibold hover:bg-emerald-100" href="/#how-it-works">
							How it works
						</Link>
						<Link className="rounded-xl px-3 py-3 font-semibold hover:bg-emerald-100" href="/about">
							About
						</Link>
						<Link className="rounded-xl bg-emerald-950 px-3 py-3 font-semibold text-white" href="/#request-support">
							Request support
						</Link>
					</nav>
				</SheetHeader>
			</SheetContent>
		</Sheet>
	)
}
