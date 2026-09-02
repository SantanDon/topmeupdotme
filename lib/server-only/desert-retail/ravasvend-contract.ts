import { XMLParser } from "fast-xml-parser"
import { z } from "zod"

export type RavasVendCredentials = {
	readonly username: string
	readonly password: string
}

export type RavasVendFault = {
	readonly ok: false
	readonly fault: {
		readonly code: string
		readonly message: string
		readonly mustALR: boolean
	}
}

export type ConfirmCustomerInput = {
	readonly allSuppliers: boolean
	readonly amountInCents: number
	readonly credentials: RavasVendCredentials
	readonly meterNumber: string
	readonly msgId: string
	readonly terminalId: string
	readonly terminalMsgId: string
}

export type ConfirmCustomerResult =
	| {
			readonly ok: true
			readonly value: readonly MeterAccount[]
	  }
	| RavasVendFault

export type MeterAccount = {
	readonly voucherCode: string
	readonly meterNumber: string
	readonly customerName: string
	readonly customerAddress: string
	readonly utilityName: string
	readonly minimumVendAmountInCents: number
	readonly maximumVendAmountInCents: number
}

export type CreditVendInput = {
	readonly amountInCents: number
	readonly credentials: RavasVendCredentials
	readonly meterNumber: string
	readonly msgId: string
	readonly tenderRef: string
	readonly terminalId: string
	readonly terminalMsgId: string
	readonly voucherCode: string
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
	| RavasVendFault

export type AdviceInput = {
	readonly adviceReqMsgId: string
	readonly credentials: RavasVendCredentials
	readonly msgId: string
	readonly terminalId: string
	readonly terminalMsgId: string
}

type CreditVendSuccess = Extract<CreditVendResult, { readonly ok: true }>
export type AdviceResult = RavasVendFault | CreditVendSuccess

export class RavasVendResponseError extends Error {
	readonly name = "RavasVendResponseError"

	constructor(readonly operation: "ConfirmCustomer" | "CreditVend" | "Advice", options?: ErrorOptions) {
		super(`RAVASVend returned an invalid ${operation} response`, options)
	}
}

const parser = new XMLParser({
	ignoreAttributes: true,
	removeNSPrefix: true,
	parseTagValue: false,
	trimValues: true,
	isArray: (name) => name === "confirmCustResult" || name === "StandardTokenTx",
})

const faultSchema = z.object({
	mustALR: z.union([z.boolean(), z.literal("true"), z.literal("false")]).transform((value) => value === true || value === "true").default(false),
	faultnumber: z.coerce.string().default("UNKNOWN"),
	desc: z.coerce.string().default("The electricity provider rejected the request"),
})

const baseResultSchema = z.object({
	hasFault: z.union([z.boolean(), z.literal("true"), z.literal("false")]).transform((value) => value === true || value === "true"),
	fault: faultSchema.optional(),
})

const meterAccountSchema = z.object({
	voucherCode: z.coerce.string().min(1),
	meterIdentifier: z.object({ msno: z.coerce.string().min(1) }),
	custDetail: z.object({
		name: z.coerce.string().default(""),
		address: z.coerce.string().default(""),
		minVendAmt: z.coerce.number().default(20),
		maxVendAmt: z.coerce.number().default(1_000),
	}),
	utilityDetail: z.object({ name: z.coerce.string().default("") }),
})

const tokenSchema = z.object({
	units: z.coerce.number(),
	unitsISOUnit: z.coerce.string(),
	amount: z.coerce.number(),
	vat: z.coerce.number().default(0),
	receiptNumber: z.coerce.string(),
	token: z.coerce.string(),
})

const creditVendBodySchema = baseResultSchema.extend({
	standardTokenTx: z
		.object({
			StandardTokenTx: z.union([z.array(tokenSchema), tokenSchema]).transform((value) => (Array.isArray(value) ? value : [value])),
		})
		.optional(),
	receipt: z.coerce.string().default(""),
})

function escapeXml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;")
}

function baseRequest(input: { readonly credentials: RavasVendCredentials; readonly msgId: string; readonly terminalId: string; readonly terminalMsgId: string }): string {
	return `<terminalMsgID>${escapeXml(input.terminalMsgId)}</terminalMsgID><terminalID>${escapeXml(input.terminalId)}</terminalID><msgID>${escapeXml(input.msgId)}</msgID><authCred><opName>${escapeXml(input.credentials.username)}</opName><password>${escapeXml(input.credentials.password)}</password></authCred>`
}

function parseResult(xml: string, operation: "ConfirmCustomer" | "CreditVend" | "Advice"): unknown {
	const parsed: unknown = parser.parse(xml)
	const envelope = z.object({ Envelope: z.object({ Body: z.record(z.string(), z.unknown()) }) }).safeParse(parsed)
	if (!envelope.success) throw new RavasVendResponseError(operation, { cause: envelope.error })
	const responseName = `${operation}Response`
	const resultName = `${operation}Result`
	const response = z.record(z.string(), z.unknown()).safeParse(envelope.data.Envelope.Body[responseName])
	if (!response.success) throw new RavasVendResponseError(operation, { cause: response.error })
	return response.data[resultName]
}

function faultResult(result: z.infer<typeof baseResultSchema>): RavasVendFault {
	return {
		ok: false,
		fault: {
			code: result.fault?.faultnumber ?? "UNKNOWN",
			message: result.fault?.desc ?? "The electricity provider rejected the request",
			mustALR: result.fault?.mustALR ?? false,
		},
	}
}

function parseCreditVendBody(value: unknown, operation: "CreditVend" | "Advice"): CreditVendResult {
	const parsed = creditVendBodySchema.safeParse(value)
	if (!parsed.success) throw new RavasVendResponseError(operation, { cause: parsed.error })
	if (parsed.data.hasFault) return faultResult(parsed.data)
	const token = parsed.data.standardTokenTx?.StandardTokenTx[0]
	if (!token) throw new RavasVendResponseError(operation)
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

export function buildConfirmCustomerEnvelope(input: ConfirmCustomerInput): string {
	return `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ConfirmCustomer xmlns="http://ravasvend.co.za/"><req>${baseRequest(input)}<amount>${(input.amountInCents / 100).toFixed(2)}</amount><voucherCode>UNKNOWN</voucherCode><meterIdentifier><msno>${escapeXml(input.meterNumber)}</msno></meterIdentifier><allSuppliers>${input.allSuppliers}</allSuppliers></req></ConfirmCustomer></soap:Body></soap:Envelope>`
}

export function parseConfirmCustomerResponse(xml: string): ConfirmCustomerResult {
	const schema = baseResultSchema.extend({ confirmCustResult: z.union([z.array(meterAccountSchema), meterAccountSchema]).transform((value) => (Array.isArray(value) ? value : [value])).optional() })
	const parsed = schema.safeParse(parseResult(xml, "ConfirmCustomer"))
	if (!parsed.success) throw new RavasVendResponseError("ConfirmCustomer", { cause: parsed.error })
	if (parsed.data.hasFault) return faultResult(parsed.data)
	if (!parsed.data.confirmCustResult?.length) throw new RavasVendResponseError("ConfirmCustomer")
	return {
		ok: true,
		value: parsed.data.confirmCustResult.map((account) => ({
			voucherCode: account.voucherCode,
			meterNumber: account.meterIdentifier.msno,
			customerName: account.custDetail.name,
			customerAddress: account.custDetail.address,
			utilityName: account.utilityDetail.name,
			minimumVendAmountInCents: Math.round(account.custDetail.minVendAmt * 100),
			maximumVendAmountInCents: Math.round(account.custDetail.maxVendAmt * 100),
		})),
	}
}

export function buildCreditVendEnvelope(input: CreditVendInput): string {
	return `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><CreditVend xmlns="http://ravasvend.co.za/"><req>${baseRequest(input)}<voucherCode>${escapeXml(input.voucherCode)}</voucherCode><meterIdentifier><msno>${escapeXml(input.meterNumber)}</msno></meterIdentifier><purchaseValue>${(input.amountInCents / 100).toFixed(2)}</purchaseValue><tender><tenderType>CREDITCARD</tenderType><fromAccount>NONE</fromAccount><tenderRef>${escapeXml(input.tenderRef)}</tenderRef></tender><receiptFormat>EN_UNFORMATED</receiptFormat><terminalChannel>WEB</terminalChannel><terminalCompanyName>Top Me Up</terminalCompanyName><terminalOperator>${escapeXml(input.credentials.username)}</terminalOperator></req></CreditVend></soap:Body></soap:Envelope>`
}

export function parseCreditVendResponse(xml: string): CreditVendResult {
	return parseCreditVendBody(parseResult(xml, "CreditVend"), "CreditVend")
}

export function buildAdviceEnvelope(input: AdviceInput): string {
	return `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><Advice xmlns="http://ravasvend.co.za/"><req>${baseRequest(input)}<adviceReqMsgID>${escapeXml(input.adviceReqMsgId)}</adviceReqMsgID></req></Advice></soap:Body></soap:Envelope>`
}

export function parseAdviceResponse(xml: string): AdviceResult {
	const schema = baseResultSchema.extend({ lastResponse: z.unknown().optional() })
	const parsed = schema.safeParse(parseResult(xml, "Advice"))
	if (!parsed.success) throw new RavasVendResponseError("Advice", { cause: parsed.error })
	if (parsed.data.hasFault) return faultResult(parsed.data)
	if (!parsed.data.lastResponse) throw new RavasVendResponseError("Advice")
	return parseCreditVendBody(parsed.data.lastResponse, "Advice")
}
