export class RequestBodyTooLargeError extends Error {
	readonly name = "RequestBodyTooLargeError"

	constructor(readonly maxBytes: number) {
		super(`Request body exceeded the ${maxBytes} byte limit`)
	}
}

export async function readTextBodyWithLimit(request: Request, maxBytes: number): Promise<string> {
	if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
		throw new RangeError("maxBytes must be a positive safe integer")
	}

	const declaredLength = request.headers.get("content-length")
	if (declaredLength !== null) {
		const parsedLength = Number(declaredLength)
		if (Number.isFinite(parsedLength) && parsedLength > maxBytes) {
			throw new RequestBodyTooLargeError(maxBytes)
		}
	}

	if (!request.body) {
		return ""
	}

	const reader = request.body.getReader()
	const decoder = new TextDecoder()
	let receivedBytes = 0
	let body = ""

	try {
		while (true) {
			const { done, value } = await reader.read()
			if (done) {
				break
			}
			receivedBytes += value.byteLength
			if (receivedBytes > maxBytes) {
				await reader.cancel()
				throw new RequestBodyTooLargeError(maxBytes)
			}
			body += decoder.decode(value, { stream: true })
		}
		body += decoder.decode()
		return body
	} finally {
		reader.releaseLock()
	}
}
