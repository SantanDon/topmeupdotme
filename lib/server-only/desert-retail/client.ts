import ky from "ky"
import {
	buildAdviceEnvelope,
	buildConfirmCustomerEnvelope,
	buildCreditVendEnvelope as buildRavasVendCreditEnvelope,
	parseAdviceResponse,
	parseConfirmCustomerResponse,
	parseCreditVendResponse as parseRavasVendCreditResponse,
	type AdviceResult,
	type ConfirmCustomerResult,
	type CreditVendResult as RavasVendCreditResult,
	type RavasVendCredentials,
} from "./ravasvend-contract"
import {
	buildConfirmMeterDetailsEnvelope,
	buildCreditVendEnvelope,
	parseConfirmMeterDetailsResponse,
	parseCreditVendResponse,
	type CreditVendResult,
	type MeterDetailsResult,
} from "./soap"

export type DesertRetailClientConfig = {
	readonly endpoint: string
	readonly password: string
	readonly terminalId: string
	readonly timeoutMs: number
	readonly username: string
}

export class DesertRetailRequestError extends Error {
	readonly name = "DesertRetailRequestError"

	constructor(readonly operation: "ConfirmMeterDetails" | "ConfirmCustomer" | "CreditVend" | "Advice", options?: ErrorOptions) {
		super(`Desert Retail ${operation} request failed`, options)
	}
}

export class DesertRetailClient {
	constructor(private readonly config: DesertRetailClientConfig) {}

	async confirmCustomer(meterNumber: string, requestId: string): Promise<ConfirmCustomerResult> {
		const body = buildConfirmCustomerEnvelope({
			allSuppliers: false,
			amountInCents: 0,
			credentials: this.ravasVendCredentials(),
			meterNumber,
			msgId: requestId,
			terminalId: this.terminalIdForMeter(meterNumber),
			terminalMsgId: requestId,
		})
		const response = await this.postSoap("ConfirmCustomer", body)
		return parseConfirmCustomerResponse(response)
	}

	async creditVendForAccount(
		meterNumber: string,
		amountInCents: number,
		requestId: string,
		voucherCode: string,
	): Promise<RavasVendCreditResult> {
		const body = buildRavasVendCreditEnvelope({
			amountInCents,
			credentials: this.ravasVendCredentials(),
			meterNumber,
			msgId: requestId,
			tenderRef: requestId,
			terminalId: this.terminalIdForMeter(meterNumber),
			terminalMsgId: requestId,
			voucherCode,
		})
		const response = await this.postSoap("CreditVend", body)
		return parseRavasVendCreditResponse(response)
	}

	async advice(
		meterNumber: string,
		adviceReqMsgId: string,
		adviceMsgId: string,
		terminalMsgId: string,
	): Promise<AdviceResult> {
		const body = buildAdviceEnvelope({
			adviceReqMsgId,
			credentials: this.ravasVendCredentials(),
			msgId: adviceMsgId,
			terminalId: this.terminalIdForMeter(meterNumber),
			terminalMsgId,
		})
		const response = await this.postSoap("Advice", body)
		return parseAdviceResponse(response)
	}

	async confirmMeterDetails(meterNumber: string, requestId: string): Promise<MeterDetailsResult> {
		const body = buildConfirmMeterDetailsEnvelope({
			credentials: this.config,
			meterNumber,
			requestId,
		})
		const response = await this.postSoap("ConfirmMeterDetails", body)
		return parseConfirmMeterDetailsResponse(response)
	}

	async creditVend(meterNumber: string, amountInCents: number, requestId: string): Promise<CreditVendResult> {
		const body = buildCreditVendEnvelope({
			amountInCents,
			credentials: this.config,
			meterNumber,
			requestId,
		})
		const response = await this.postSoap("CreditVend", body)
		return parseCreditVendResponse(response)
	}

	private async postSoap(operation: "ConfirmMeterDetails" | "ConfirmCustomer" | "CreditVend" | "Advice", body: string): Promise<string> {
		try {
			return await ky
				.post(this.config.endpoint, {
					body,
					headers: {
						Authorization: `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString("base64")}`,
						"Content-Type": "text/xml; charset=utf-8",
						SOAPAction: `"http://ravasvend.co.za/${operation}"`,
					},
					retry: {
						limit: 0,
					},
					timeout: this.config.timeoutMs,
				})
				.text()
		} catch (error) {
			if (error instanceof Error) {
				throw new DesertRetailRequestError(operation, { cause: error })
			}
			throw error
		}
	}

	private ravasVendCredentials(): RavasVendCredentials {
		return { password: this.config.password, username: this.config.username }
	}

	private terminalIdForMeter(meterNumber: string): string {
		return `${this.config.terminalId}-${meterNumber}`.slice(0, 40)
	}
}
