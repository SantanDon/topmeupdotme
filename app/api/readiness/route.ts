import { NextResponse } from "next/server"
import { evaluateConfigurationReadiness } from "@/lib/server-only/readiness"

export const dynamic = "force-dynamic"

export function GET(): Response {
	const readiness = evaluateConfigurationReadiness(process.env)
	return NextResponse.json(readiness, {
		headers: { "Cache-Control": "no-store" },
		status: readiness.status === "ready" ? 200 : 503,
	})
}
