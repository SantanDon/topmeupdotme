export type SafeErrorFields = {
	readonly name: string
	readonly message: string
}

export function safeErrorFields(error: unknown): SafeErrorFields {
	if (error instanceof Error) {
		return { name: error.name, message: error.message }
	}
	return { name: "UnknownError", message: "Unknown server error" }
}
