import { createSearchParamsCache, parseAsFloat, parseAsString } from "nuqs/server"
// Note: import from 'nuqs/server' to avoid the "use client" directive

export const thankYouPageSearchParamsCache = createSearchParamsCache({
	// List your search param keys and associated parsers here:
	transactionRef: parseAsString,
	donationAmount: parseAsFloat,
	token: parseAsString,
	receipt: parseAsString,
	quantity: parseAsFloat,
	meterNumber: parseAsString,
	unit: parseAsString,
})
