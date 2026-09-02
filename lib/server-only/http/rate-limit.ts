type RateLimitOptions = {
	readonly limit: number
	readonly maxKeys?: number
	readonly windowMs: number
	readonly now?: () => number
}

type RateLimitResult = {
	readonly allowed: boolean
	readonly retryAfterSeconds: number
}

type Bucket = {
	/** Mutable counter state; mutation is the purpose of this in-memory limiter. */
	count: number
	readonly resetAt: number
}

export function createRateLimiter(options: RateLimitOptions) {
	if (!Number.isSafeInteger(options.limit) || options.limit <= 0) {
		throw new RangeError("limit must be a positive safe integer")
	}
	const maxKeys = options.maxKeys ?? 10_000
	if (!Number.isSafeInteger(maxKeys) || maxKeys <= 0) {
		throw new RangeError("maxKeys must be a positive safe integer")
	}
	if (!Number.isSafeInteger(options.windowMs) || options.windowMs <= 0) {
		throw new RangeError("windowMs must be a positive safe integer")
	}

	const now = options.now ?? Date.now
	const buckets = new Map<string, Bucket>()

	return {
		check(key: string): RateLimitResult {
			const currentTime = now()
			for (const [bucketKey, bucket] of buckets) {
				if (bucket.resetAt <= currentTime) {
					buckets.delete(bucketKey)
				}
			}
			const existing = buckets.get(key)
			if (!existing) {
				if (buckets.size >= maxKeys) {
					let oldestKey: string | undefined
					let oldestResetAt = Number.POSITIVE_INFINITY
					for (const [bucketKey, bucket] of buckets) {
						if (bucket.resetAt < oldestResetAt) {
							oldestKey = bucketKey
							oldestResetAt = bucket.resetAt
						}
					}
					if (oldestKey !== undefined) {
						buckets.delete(oldestKey)
					}
				}
				buckets.set(key, { count: 1, resetAt: currentTime + options.windowMs })
				return { allowed: true, retryAfterSeconds: 0 }
			}
			if (existing.count >= options.limit) {
				return {
					allowed: false,
					retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - currentTime) / 1_000)),
				}
			}
			existing.count += 1
			return { allowed: true, retryAfterSeconds: 0 }
		},
	}
}
