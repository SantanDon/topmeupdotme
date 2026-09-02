import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

export type ReceiptPdfInput = {
	readonly amount: string
	readonly date: string
	readonly meterNumber: string
	readonly quantity: string
	readonly receipt: string
	readonly recipientName: string
	readonly reference: string
	readonly token: string
	readonly unit: string
}

export async function createReceiptPdf(input: ReceiptPdfInput): Promise<Uint8Array> {
	const document = await PDFDocument.create()
	const page = document.addPage([595, 842])
	const regular = await document.embedFont(StandardFonts.Helvetica)
	const bold = await document.embedFont(StandardFonts.HelveticaBold)
	const ink = rgb(0.02, 0.18, 0.14)
	const muted = rgb(0.28, 0.35, 0.33)
	const lime = rgb(0.74, 0.95, 0.4)
	const safe = (value: string): string => value.slice(0, 160)

	page.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: rgb(0.96, 0.98, 0.95) })
	page.drawRectangle({ x: 0, y: 650, width: 595, height: 192, color: ink })
	page.drawText("TOP ME UP", { x: 48, y: 775, size: 14, font: bold, color: lime })
	page.drawText("Electricity top-up receipt", { x: 48, y: 715, size: 28, font: bold, color: rgb(1, 1, 1) })
	page.drawText("A clear record of the electricity delivered.", {
		x: 50,
		y: 684,
		size: 11,
		font: regular,
		color: rgb(0.82, 0.92, 0.86),
	})

	page.drawRectangle({ x: 48, y: 526, width: 499, height: 92, color: lime, borderColor: ink, borderWidth: 1 })
	page.drawText("ELECTRICITY TOKEN", { x: 68, y: 590, size: 10, font: bold, color: ink })
	page.drawText(safe(input.token), { x: 68, y: 552, size: 21, font: bold, color: ink, maxWidth: 455 })

	const rows: readonly [string, string][] = [
		["Recipient", input.recipientName],
		["Meter", input.meterNumber],
		["Amount", `R${input.amount}`],
		["Electricity", `${input.quantity} ${input.unit}`],
		["Receipt", input.receipt],
		["Reference", input.reference],
		["Completed", input.date],
	]
	let y = 476
	for (const [label, value] of rows) {
		page.drawText(label.toUpperCase(), { x: 58, y, size: 8, font: bold, color: muted })
		page.drawText(safe(value), { x: 190, y, size: 11, font: regular, color: ink, maxWidth: 325 })
		page.drawLine({
			start: { x: 58, y: y - 10 },
			end: { x: 537, y: y - 10 },
			thickness: 0.5,
			color: rgb(0.82, 0.87, 0.84),
		})
		y -= 42
	}

	page.drawText("Keep this receipt with the token until it has been loaded successfully.", {
		x: 58,
		y: 154,
		size: 10,
		font: regular,
		color: muted,
	})
	page.drawText("Top Me Up · community-powered prepaid electricity", { x: 58, y: 72, size: 9, font: bold, color: ink })
	return document.save()
}
