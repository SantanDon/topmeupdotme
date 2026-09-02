export default function PrivacyPage() {
	return (
		<div className="min-h-screen bg-[#f4f7f2] pt-16">
			<div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
				<div className="mx-auto max-w-3xl rounded-[2rem] border border-emerald-950/10 bg-white p-7 shadow-sm sm:p-10">
					<p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Legal</p>
					<h1 className="mb-8 mt-3 text-4xl font-bold tracking-tight text-emerald-950">Privacy Policy</h1>
					<div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-emerald-950 prose-a:text-emerald-700">
						<p>Last updated: {new Date().toLocaleDateString()}</p>

						<h2>Introduction</h2>
						<p>
							At TopMeUp, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
							and safeguard your information when you use our service.
						</p>

						<h2>Information We Collect</h2>
						<p>We collect information that you provide directly to us, including:</p>
						<ul>
							<li>Meter numbers</li>
							<li>Email addresses</li>
							<li>Mobile numbers</li>
							<li>Transaction data</li>
						</ul>

						<h2>How We Use Your Information</h2>
						<p>We use the information we collect to:</p>
						<ul>
							<li>Process your electricity top-ups</li>
							<li>Generate and manage support links</li>
							<li>Send you transaction confirmations</li>
							<li>Provide customer support</li>
							<li>Improve our services</li>
						</ul>

						<h2>Data Security</h2>
						<p>
							We implement appropriate technical and organizational measures to protect your personal data against
							unauthorized or unlawful processing, accidental loss, destruction, or damage.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
