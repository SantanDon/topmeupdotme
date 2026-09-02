export type VendValueBreakdown = {
	readonly paidAmountInCents: number
	readonly taxInCents: number
	readonly vendAmountInCents: number
}

export function isVendValueConsistent(input: VendValueBreakdown): boolean {
	return (
		Number.isSafeInteger(input.paidAmountInCents) &&
		input.paidAmountInCents > 0 &&
		Number.isSafeInteger(input.taxInCents) &&
		input.taxInCents >= 0 &&
		Number.isSafeInteger(input.vendAmountInCents) &&
		input.vendAmountInCents > 0 &&
		input.vendAmountInCents + input.taxInCents === input.paidAmountInCents
	)
}
