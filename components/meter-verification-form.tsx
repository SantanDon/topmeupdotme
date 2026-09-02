"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { verifyMeterSchema } from "@/lib/validations"

type MeterVerificationFormProps = {
	readonly onSubmit: (values: z.infer<typeof verifyMeterSchema>) => Promise<void>
	readonly isSubmitting: boolean
	readonly buttonText: string
}

export function MeterVerificationForm({ onSubmit, isSubmitting, buttonText }: MeterVerificationFormProps) {
	const form = useForm<z.infer<typeof verifyMeterSchema>>({
		resolver: zodResolver(verifyMeterSchema),
		defaultValues: {
			meterNumber: "",
		},
		mode: "onChange",
	})

	return (
		<Form {...form}>
			<form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="meterNumber"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-semibold text-slate-800">Prepaid meter number</FormLabel>
							<FormControl>
								<Input
									{...field}
									autoComplete="off"
									className="h-12 rounded-xl border-slate-200 bg-white font-mono text-base tracking-[0.08em] text-slate-950"
									inputMode="numeric"
									maxLength={13}
									placeholder="Enter 11–13 digits"
								/>
							</FormControl>
							<p className="text-xs leading-5 text-slate-500">You can usually find this number on your meter or token slip.</p>
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
