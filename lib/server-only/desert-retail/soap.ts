import { XMLParser } from "fast-xml-parser"
import { z } from "zod"

export type DesertRetailCredentials = {
	readonly username: string
	readonly password: string
	readonly terminalId: string
}

export type ConfirmMeterDetailsInput = {
	readonly credentials: DesertRetailCredentials
	readonly meterNumber: string
	readonly requestId: string
}

export type DesertRetailFault = {
	readonly ok: false
	readonly fault: {
		readonly code: string
		readonly message: string
	}
}

export type MeterDetailsResult =
	| {
			readonly ok: true
			readonly value: {
				readonly meterNumber: string
				readonly customerName: string
				readonly customerAddress: string
				readonly utilityName: string
				readonly minimumVendAmountInCents: number
				readonly maximumVendAmountInCents: number
			}
	  }
	| DesertRetailFault

export type CreditVendInput = {
	readonly amountInCents: number
	readonly credentials: DesertRetailCredentials
	readonly meterNumber: string
	readonly requestId: string
}

export type CreditVendResult =
	| {
			readonly ok: true
			readonly value: {
				readonly token: string
				readonly receiptNumber: string
				readonly units: number
				readonly unitsIso: string
				readonly amountInCents: number
				readonly taxInCents: number
				readonly receipt: string
			}
	  }
	| DesertRetailFault

export class DesertRetailResponseError extends Error {
	readonly name = "DesertRetailResponseError"

	constructor(readonly operation: "ConfirmMeterDetails" | "CreditVend", options?: ErrorOptions) {
		super(`Desert Retail returned an invalid ${operation} response`, options)
	}
}

const faultSchema = z.object({
	faultnumber: z.coerce.string().default("UNKNOWN"),
	desc: z.coerce.string().default("The electricity provider rejected the request"),
})

const baseResultSchema = z.object({
	hasFault: z.union([z.boolean(), z.literal("true"), z.literal("false")]).transform((value) => value === true || value === "true"),
	fault: faultSchema.optional(),
})

const meterDetailsSchema = baseResultSchema.extend({
	confirmCustResult: z
		.object({
			meterIdentifier: z.object({
				msno: z.coerce.string(),
			}),
			custDetail: z.object({
				name: z.coerce.string().default(""),
				address: z.coerce.string().default(""),
				minVendAmt: z.coerce.number().default(20),
				maxVendAmt: z.coerce.number().default(1_000),
			}),
			utilityDetail: z.object({
				name: z.coerce.string().default(""),
			}),
		})
		.optional(),
})

const creditVendSchema = baseResultSchema.extend({
	standardTokenTx: z
		.object({
			StandardTokenTx: z.array(
				z.object({
					units: z.coerce.number(),
					unitsISOUnit: z.coerce.string(),
					amount: z.coerce.number(),
					vat: z.coerce.number().default(0),
					receiptNumber: z.coerce.string(),
					token: z.coerce.string(),
				})
			),
		})
		.optional(),
	receipt: z.coerce.string().default(""),
})

const parser = new XMLParser({
	ignoreAttributes: true,
	removeNSPrefix: true,
	parseTagValue: true,
	trimValues: true,
	numberParseOptions: {
		hex: false,
		leadingZeros: false,
	},
	isArray: (name) => name === "StandardTokenTx",
})

function escapeXml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;")
}

function buildBaseRequest(credentials: DesertRetailCredentials, requestId: string, messageId: string): string {
	return `<terminalMsgID>${escapeXml(requestId)}</terminalMsgID>
				<terminalID>${escapeXml(credentials.terminalId)}</terminalID>
				<msgID>${messageId}</msgID>
				<authCred>
					<opName>${escapeXml(credentials.username)}</opName>
					<password>${escapeXml(credentials.password)}</password>
				</authCred>`
}

function parseSoapResult(xml: string, operation: "ConfirmMeterDetails" | "CreditVend"): unknown {
	const parsed: unknown = parser.parse(xml)
	const envelopeSchema = z.object({
		Envelope: z.object({
			Body: z.record(z.string(), z.unknown()),
		}),
	})
	const envelope = envelopeSchema.safeParse(parsed)
	if (!envelope.success) {
		throw new DesertRetailResponseError(operation, { cause: envelope.error })
	}
	const responseName = `${operation}Response`
	const resultName = `${operation}Result`
	const response = z.record(z.string(), z.unknown()).safeParse(envelope.data.Envelope.Body[responseName])
	if (!response.success) {
		throw new DesertRetailResponseError(operation, { cause: response.error })
	}
	return response.data[resultName]
}

function toFault(result: z.infer<typeof baseResultSchema>): DesertRetailFault {
	return {
		ok: false,
		fault: {
			code: result.fault?.faultnumber ?? "UNKNOWN",
			message: result.fault?.desc ?? "The electricity provider rejected the request",
		},
	}
}

export function buildConfirmMeterDetailsEnvelope(input: ConfirmMeterDetailsInput): string {
	return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
	<soap:Body>
		<ConfirmMeterDetails xmlns="http://ravasvend.co.za/">
			<req>
				${buildBaseRequest(input.credentials, input.requestId, "ConfirmMeterDetails")}
				<meterIdentifier>
					<msno>${escapeXml(input.meterNumber)}</msno>
				</meterIdentifier>
				<receiptFormat>EN_UNFORMATED</receiptFormat>
				<terminalChannel>WEB</terminalChannel>
				<terminalCompanyName>Top Me Up</terminalCompanyName>
				<terminalOperator>${escapeXml(input.credentials.username)}</terminalOperator>
			</req>
		</ConfirmMeterDetails>
	</soap:Body>
</soap:Envelope>`
}

export function parseConfirmMeterDetailsResponse(xml: string): MeterDetailsResult {
	const parsed = meterDetailsSchema.safeParse(parseSoapResult(xml, "ConfirmMeterDetails"))
	if (!parsed.success) {
		throw new DesertRetailResponseError("ConfirmMeterDetails", { cause: parsed.error })
	}
	if (parsed.data.hasFault) {
		return toFault(parsed.data)
	}
	const details = parsed.data.confirmCustResult
	if (!details) {
		throw new DesertRetailResponseError("ConfirmMeterDetails")
	}
	return {
		ok: true,
		value: {
			meterNumber: details.meterIdentifier.msno,
			customerName: details.custDetail.name,
			customerAddress: details.custDetail.address,
			utilityName: details.utilityDetail.name,
			minimumVendAmountInCents: Math.round(details.custDetail.minVendAmt * 100),
			maximumVendAmountInCents: Math.round(details.custDetail.maxVendAmt * 100),
		},
	}
}

export function buildCreditVendEnvelope(input: CreditVendInput): string {
	return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
	<soap:Body>
		<CreditVend xmlns="http://ravasvend.co.za/">
			<req>
				${buildBaseRequest(input.credentials, input.requestId, "CreditVend")}
				<meterIdentifier>
					<msno>${escapeXml(input.meterNumber)}</msno>
				</meterIdentifier>
				<purchaseValue>${(input.amountInCents / 100).toFixed(2)}</purchaseValue>
				<tender>
					<tenderType>CREDITCARD</tenderType>
					<fromAccount>NONE</fromAccount>
					<tenderRef>${escapeXml(input.requestId)}</tenderRef>
				</tender>
				<receiptFormat>EN_UNFORMATED</receiptFormat>
				<terminalChannel>WEB</terminalChannel>
				<terminalCompanyName>Top Me Up</terminalCompanyName>
				<terminalOperator>${escapeXml(input.credentials.username)}</terminalOperator>
			</req>
		</CreditVend>
	</soap:Body>
</soap:Envelope>`
}

export function parseCreditVendResponse(xml: string): CreditVendResult {
	const parsed = creditVendSchema.safeParse(parseSoapResult(xml, "CreditVend"))
	if (!parsed.success) {
		throw new DesertRetailResponseError("CreditVend", { cause: parsed.error })
	}
	if (parsed.data.hasFault) {
		return toFault(parsed.data)
	}
	const token = parsed.data.standardTokenTx?.StandardTokenTx[0]
	if (!token) {
		throw new DesertRetailResponseError("CreditVend")
	}
	return {
		ok: true,
		value: {
			token: token.token,
			receiptNumber: token.receiptNumber,
			units: token.units,
			unitsIso: token.unitsISOUnit,
			amountInCents: Math.round(token.amount * 100),
			taxInCents: Math.round(token.vat * 100),
			receipt: parsed.data.receipt,
		},
	}
}
