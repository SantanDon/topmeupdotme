export default function TermsPage() {
	return (
		<div className="min-h-screen bg-[#f4f7f2] pt-16">
			<div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
				<div className="mx-auto max-w-3xl rounded-[2rem] border border-emerald-950/10 bg-white p-7 shadow-sm sm:p-10">
					<p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Legal</p>
					<h1 className="mb-8 mt-3 text-4xl font-bold tracking-tight text-emerald-950">Terms of Service</h1>
					<div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-emerald-950 prose-a:text-emerald-700">
						<p>Last updated: {new Date().toLocaleDateString()}</p>

						<h2>1. Acceptance of Terms</h2>
						<p>
							By accessing and using TopMeUp&apos;s services, you agree to be bound by these Terms of Service and all
							applicable laws and regulations.
						</p>

						<h2>2. Service Description</h2>
						<p>
							TopMeUp provides a platform for users to request and receive electricity top-ups through social media.
							Our service includes meter verification, support-link generation, and electricity token delivery.
						</p>

						<h2>3. User Responsibilities</h2>
						<p>You agree to:</p>
						<ul>
							<li>Provide accurate and complete information</li>
							<li>Maintain the security of your account</li>
							<li>Use the service only for lawful purposes</li>
							<li>Not misuse or attempt to manipulate the service</li>
						</ul>

						<h2>4. Donations and Payments</h2>
						<p>
							All top-ups are processed through secure payment gateways. Support links are valid for 24 hours from
							generation. We cannot guarantee that your request will receive funding.
						</p>

						<h2>5. Service Availability</h2>
						<p>
							While we strive to provide uninterrupted service, we cannot guarantee that the service will be available
							at all times. We reserve the right to modify or discontinue the service at any time.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
