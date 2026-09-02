"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Loader2, LockKeyhole } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { initializeDonationAction } from "@/actions/donation"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type DonationFormProps = {
	readonly publicId: string
	readonly minimumVendAmountInCents: number
	readonly maximumVendAmountInCents: number
}

export function DonationForm({
	publicId,
	minimumVendAmountInCents,
	maximumVendAmountInCents,
}: DonationFormProps) {
	const minimumInRands = minimumVendAmountInCents / 100
	const maximumInRands = maximumVendAmountInCents / 100
	const schema = z.object({
		donorEmail: z.string().trim().email("Enter a valid email address"),
		amountInRands: z.coerce
			.number()
			.int("Use a whole rand amount")
									.min(minimumInRands, `Minimum top-up is R${minimumInRands}`)
			.max(maximumInRands, `Maximum top-up is R${maximumInRands}`),
	})
	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			donorEmail: "",
			amountInRands: minimumInRands,
		},
		mode: "onChange",
	})
	const { execute, isPending } = useAction(initializeDonationAction, {
		onSuccess: ({ data }) => {
			if (data?.authorizationUrl) {
				window.location.assign(data.authorizationUrl)
				return
			}
			toast.error("Payment could not be started. Please try again.")
		},
		onError: () => {
			toast.error("Payment could not be started. Check your details and try again.")
		},
	})

	const suggestedAmounts = Array.from(
		new Set(
			[
				minimumInRands,
				Math.min(maximumInRands, Math.max(minimumInRands, 100)),
				Math.min(maximumInRands, Math.max(minimumInRands, 250)),
				Math.min(maximumInRands, Math.max(minimumInRands, 500)),
			].filter((amount) => amount >= minimumInRands && amount <= maximumInRands)
		)
	)
	const selectedAmount = form.watch("amountInRands")

	return (
		<Form {...form}>
			<form
				className="space-y-6"
				onSubmit={form.handleSubmit((values) => {
					execute({
						publicId,
						donorEmail: values.donorEmail,
						amountInCents: values.amountInRands * 100,
					})
				})}
			>
				<FormField
					control={form.control}
					name="amountInRands"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-semibold text-slate-800">Choose an amount</FormLabel>
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
								{suggestedAmounts.map((amount) => (
									<button
										className={cn(
											"rounded-xl border px-3 py-3 text-sm font-bold transition",
											selectedAmount === amount
												? "border-emerald-700 bg-emerald-700 text-white shadow-[0_8px_24px_rgba(4,120,87,0.18)]"
												: "border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:bg-emerald-50"
										)}
										key={amount}
										onClick={() => field.onChange(amount)}
										type="button"
									>
										R{amount}
									</button>
								))}
							</div>
							<FormControl>
								<div className="relative">
									<span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">R</span>
									<Input
										{...field}
										className="h-12 rounded-xl border-slate-200 bg-white pl-9 text-base text-slate-950"
										inputMode="numeric"
										max={maximumInRands}
										min={minimumInRands}
										onChange={(event) => field.onChange(event.target.valueAsNumber)}
										type="number"
									/>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="donorEmail"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-semibold text-slate-800">Your email</FormLabel>
							<FormControl>
								<Input
									{...field}
									autoComplete="email"
									className="h-12 rounded-xl border-slate-200 bg-white text-slate-950"
									placeholder="you@example.com"
									type="email"
								/>
							</FormControl>
							<p className="text-xs leading-5 text-slate-500">We use this only for your receipt and payment updates.</p>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					className="h-12 w-full rounded-xl bg-emerald-700 text-base font-bold text-white shadow-[0_12px_30px_rgba(4,120,87,0.22)] hover:bg-emerald-800"
					disabled={isPending}
					type="submit"
				>
					{isPending ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							Opening secure payment
						</>
					) : (
						<>
							Continue to Paystack
							<ArrowRight className="ml-2 size-4" />
						</>
					)}
				</Button>
				<p className="flex items-center justify-center gap-2 text-xs text-slate-500">
					<LockKeyhole className="size-3.5 text-emerald-700" />
					Payment details are handled securely by Paystack.
				</p>
			</form>
		</Form>
	)
}
