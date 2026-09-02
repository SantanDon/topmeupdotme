import { describe, expect, test } from "bun:test"
import { createRateLimiter } from "./rate-limit"

describe("createRateLimiter", () => {
	test("allows requests up to the limit and rejects the next request", () => {
		const limiter = createRateLimiter({ limit: 2, windowMs: 1_000, now: () => 10 })

		expect(limiter.check("client").allowed).toBe(true)
		expect(limiter.check("client").allowed).toBe(true)
		expect(limiter.check("client").allowed).toBe(false)
	})

	test("resets a client after the window expires", () => {
		let now = 10
		const limiter = createRateLimiter({ limit: 1, windowMs: 1_000, now: () => now })

		expect(limiter.check("client").allowed).toBe(true)
		expect(limiter.check("client").allowed).toBe(false)
		now = 1_010
		expect(limiter.check("client").allowed).toBe(true)
	})

	test("bounds memory when many client keys arrive in one window", () => {
		const limiter = createRateLimiter({ limit: 1, maxKeys: 2, windowMs: 1_000, now: () => 10 })

		expect(limiter.check("first").allowed).toBe(true)
		expect(limiter.check("second").allowed).toBe(true)
		expect(limiter.check("third").allowed).toBe(true)
		expect(limiter.check("first").allowed).toBe(true)
	})
})
