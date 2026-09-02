"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { recipientDetailsSchema } from "@/lib/validations"
import { PhoneInput } from "./ui/phone-input"

type RecipientDetailsFormProps = {
	readonly onSubmit: (values: z.infer<typeof recipientDetailsSchema>) => Promise<void>
	readonly isSubmitting: boolean
	readonly buttonText: string
}

const inputClassName = "h-11 rounded-xl border-slate-200 bg-white text-slate-950"

export function RecipientDetailsForm({ onSubmit, isSubmitting, buttonText }: RecipientDetailsFormProps) {
	const form = useForm<z.infer<typeof recipientDetailsSchema>>({
		resolver: zodResolver(recipientDetailsSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			phoneNumber: "",
		},
		mode: "onChange",
	})

	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
				<div className="grid gap-4 sm:grid-cols-2">
					<FormField
						control={form.control}
						name="firstName"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-semibold text-slate-800">First name</FormLabel>
								<FormControl>
									<Input {...field} autoComplete="given-name" className={inputClassName} placeholder="Your first name" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="lastName"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-semibold text-slate-800">Last name</FormLabel>
								<FormControl>
									<Input {...field} autoComplete="family-name" className={inputClassName} placeholder="Your last name" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-semibold text-slate-800">Email address</FormLabel>
							<FormControl>
								<Input {...field} autoComplete="email" className={inputClassName} placeholder="you@example.com" type="email" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="phoneNumber"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-semibold text-slate-800">Mobile number</FormLabel>
							<FormControl>
								<PhoneInput
									{...field}
									className="[&>input]:h-11 [&>input]:border-slate-200 [&>input]:bg-white [&>input]:text-slate-950"
									defaultCountry="ZA"
									placeholder="Enter your mobile number"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					className="h-12 w-full rounded-xl bg-emerald-950 text-base font-bold text-white hover:bg-emerald-800"
					disabled={isSubmitting}
					type="submit"
				>
					{buttonText}
					{isSubmitting ? <Loader2 className="ml-2 size-4 animate-spin" /> : <ArrowRight className="ml-2 size-4" />}
				</Button>
			</form>
		</Form>
	)
}
