"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

type Props = {
	error?: Error & { digest?: string }
	reset?: () => void
}

const Error = ({ error, reset }: Props) => {
	return (
		<div className="min-h-screen flex items-center justify-center ">
			<div className="max-w-md w-full p-8 rounded-lg bg-background/50 shadow-lg text-center">
				<div className="mb-6">
					<h1 className="text-6xl font-bold  mb-2">Oops!</h1>
					<p className=" mb-6 text-muted-foreground">{"An unexpected error has occurred"}</p>
				</div>

				<div className="flex justify-center gap-4 pt-4">
					<Button variant={"secondary"} onClick={() => reset?.()}>
						Try Again
					</Button>
					<Link href="/">
						<Button>Return Home</Button>
					</Link>
				</div>
			</div>
		</div>
	)
}

export default Error
