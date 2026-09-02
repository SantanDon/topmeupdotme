import { customAlphabet } from "nanoid"
export function customNanoid(size: number = 12) {
	const allowedCharacters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
	return customAlphabet(allowedCharacters, size)()
}
