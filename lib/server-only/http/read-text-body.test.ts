import { describe, expect, it } from "bun:test"
import { readTextBodyWithLimit, RequestBodyTooLargeError } from "./read-text-body"

describe("readTextBodyWithLimit", () => {
	it("returns the exact UTF-8 body when it is within the limit", async () => {
		const rawBody = '{"event":"charge.success","message":"Electricity ⚡"}'
		const request = new Request("https://example.test/webhook", {
			method: "POST",
			body: rawBody,
		})

		await expect(readTextBodyWithLimit(request, 1_024)).resolves.toBe(rawBody)
	})

	it("rejects a body whose declared content length exceeds the limit", async () => {
		const request = new Request("https://example.test/webhook", {
			method: "POST",
			headers: { "content-length": "2048" },
			body: "{}",
		})

		await expect(readTextBodyWithLimit(request, 1_024)).rejects.toBeInstanceOf(RequestBodyTooLargeError)
	})

	it("rejects a streamed body once its actual byte length exceeds the limit", async () => {
		const encoder = new TextEncoder()
		const request = new Request("https://example.test/webhook", {
			method: "POST",
			body: new ReadableStream<Uint8Array>({
				start(controller) {
					controller.enqueue(encoder.encode("12345"))
					controller.enqueue(encoder.encode("67890"))
					controller.close()
				},
			}),
			duplex: "half",
		} as RequestInit & { duplex: "half" })

		await expect(readTextBodyWithLimit(request, 8)).rejects.toBeInstanceOf(RequestBodyTooLargeError)
	})
})
