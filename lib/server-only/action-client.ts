import "server-only"
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { z } from "zod"
import { safeErrorFields } from "./logging/safe-error"

export class PublicActionError extends Error {
	readonly name = "PublicActionError"
}

export const actionClient = createSafeActionClient({
	handleServerError: (error) => {
		if (isRedirectError(error)) {
			throw error
		}
		console.error("[Server action failed]", safeErrorFields(error))
		if (error instanceof PublicActionError) {
			return { message: error.message }
		}
		return {
			message: DEFAULT_SERVER_ERROR_MESSAGE,
		}
	},
	defineMetadataSchema: () =>
		z.object({
			actionName: z.string(),
		}),
}).use(async ({ next, metadata }) => {
	const startTime = performance.now()
	const executionResult = await next()
	console.info("[Server action]", {
		actionName: metadata.actionName,
		durationMs: Math.round(performance.now() - startTime),
		succeeded: !executionResult.serverError,
	})
	return executionResult
})
