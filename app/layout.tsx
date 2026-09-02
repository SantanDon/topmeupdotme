import "./globals.css"
import type { Metadata } from "next"
import { Bricolage_Grotesque, Manrope } from "next/font/google"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/nav"
import { Toaster } from "sonner"

const displayFont = Bricolage_Grotesque({
	subsets: ["latin"],
	variable: "--font-display",
})
const bodyFont = Manrope({
	subsets: ["latin"],
	variable: "--font-body",
})

export const metadata: Metadata = {
	title: {
		default: "TopMeUp — Electricity help, shared simply",
		template: "%s | TopMeUp",
	},
	description:
		"Create a verified electricity support link and let your community top up your prepaid meter securely.",
}

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={`${displayFont.variable} ${bodyFont.variable} min-h-screen bg-[#f4f7f2] text-slate-950`}>
				<Navbar />
				<main>{children}</main>
				<Footer />
				<Toaster richColors />
			</body>
		</html>
	)
}
