import { createHmac, timingSafeEqual } from "node:crypto"

export function isValidPaystackSignature(rawBody: string, signature: string, secretKey: string): boolean {
	if (!/^[\da-f]{128}$/i.test(signature)) {
		return false
	}
	const expected = createHmac("sha512", secretKey).update(rawBody).digest()
	const provided = Buffer.from(signature, "hex")
	return provided.length === expected.length && timingSafeEqual(provided, expected)
}
