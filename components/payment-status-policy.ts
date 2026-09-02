export const PAYMENT_STATUS_POLL_INTERVAL_MS = 2_000

export function nextPaymentStatusPollDelay(now: number, deadline: number, retryAfterMs = 0): number | null {
	const remainingMs = deadline - now
	if (remainingMs <= 0) return null
	const requestedDelayMs = Math.max(PAYMENT_STATUS_POLL_INTERVAL_MS, retryAfterMs)
	return Math.min(remainingMs, requestedDelayMs)
}
