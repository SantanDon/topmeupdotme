import { describe, expect, it } from "bun:test"
import { PDFDocument } from "pdf-lib"
import { createReceiptPdf } from "./receipt-pdf"

describe("createReceiptPdf", () => {
	it("creates a readable PDF receipt without putting data in a URL", async () => {
		const pdf = await createReceiptPdf({
			amount: "150.00",
			date: "10 Aug 2026, 12:00 UTC",
			meterNumber: "01234567890",
			quantity: "42.5",
			receipt: "RCPT-123",
			recipientName: "Test Customer",
			reference: "TMU-123456789012345678901234",
			token: "1234 5678",
			unit: "kWh",
		})

		expect(new TextDecoder().decode(pdf.slice(0, 8))).toBe("%PDF-1.7")
		const document = await PDFDocument.load(pdf)
		expect(document.getPageCount()).toBe(1)
	})
})
