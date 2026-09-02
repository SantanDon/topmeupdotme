import { describe, expect, it } from "bun:test"
import {
	buildConfirmMeterDetailsEnvelope,
	buildCreditVendEnvelope,
	parseConfirmMeterDetailsResponse,
	parseCreditVendResponse,
} from "./soap"

const credentials = {
	username: "operator<&",
	password: "secret<&",
	terminalId: "TOPMEUP",
} as const

describe("Desert Retail SOAP contract", () => {
	it("builds an escaped ConfirmMeterDetails request when given a meter", () => {
		// Given
		const input = {
			credentials,
			meterNumber: "01234567890",
			requestId: "req-123",
		} as const

		// When
		const envelope = buildConfirmMeterDetailsEnvelope(input)

		// Then
		expect(envelope).toContain("<terminalMsgID>req-123</terminalMsgID>")
		expect(envelope).toContain("<terminalID>TOPMEUP</terminalID>")
		expect(envelope).toContain("<opName>operator&lt;&amp;</opName>")
		expect(envelope).toContain("<password>secret&lt;&amp;</password>")
		expect(envelope).toContain("<msno>01234567890</msno>")
		expect(envelope).toContain("<receiptFormat>EN_UNFORMATED</receiptFormat>")
	})

	it("parses confirmed meter details when the provider accepts a meter", () => {
		// Given
		const response = `<?xml version="1.0" encoding="utf-8"?>
			<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
				<soap:Body>
					<ConfirmMeterDetailsResponse xmlns="http://ravasvend.co.za/">
						<ConfirmMeterDetailsResult>
							<respDateTime>2026-07-29T17:00:00Z</respDateTime>
							<hasFault>false</hasFault>
							<confirmCustResult>
								<meterIdentifier><msno>01234567890</msno></meterIdentifier>
								<custDetail>
									<name>Test Customer</name>
									<address>12 Main Road</address>
									<maxVendAmt>5000.00</maxVendAmt>
									<maxVendAmtSpecified>true</maxVendAmtSpecified>
									<minVendAmt>20.00</minVendAmt>
									<minVendAmtSpecified>true</minVendAmtSpecified>
								</custDetail>
								<utilityDetail><name>City Power</name></utilityDetail>
							</confirmCustResult>
							<receiptFormat>EN_UNFORMATED</receiptFormat>
						</ConfirmMeterDetailsResult>
					</ConfirmMeterDetailsResponse>
				</soap:Body>
			</soap:Envelope>`

		// When
		const result = parseConfirmMeterDetailsResponse(response)

		// Then
		expect(result).toEqual({
			ok: true,
			value: {
				meterNumber: "01234567890",
				customerName: "Test Customer",
				customerAddress: "12 Main Road",
				utilityName: "City Power",
				minimumVendAmountInCents: 2_000,
				maximumVendAmountInCents: 500_000,
			},
		})
	})

	it("returns a typed fault when meter confirmation is rejected", () => {
		// Given
		const response = `<?xml version="1.0" encoding="utf-8"?>
			<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
				<soap:Body>
					<ConfirmMeterDetailsResponse xmlns="http://ravasvend.co.za/">
						<ConfirmMeterDetailsResult>
							<respDateTime>2026-07-29T17:00:00Z</respDateTime>
							<hasFault>true</hasFault>
							<fault>
								<faultnumber>INVALID_METER</faultnumber>
								<desc>The meter could not be found</desc>
							</fault>
							<receiptFormat>NONE</receiptFormat>
						</ConfirmMeterDetailsResult>
					</ConfirmMeterDetailsResponse>
				</soap:Body>
			</soap:Envelope>`

		// When
		const result = parseConfirmMeterDetailsResponse(response)

		// Then
		expect(result).toEqual({
			ok: false,
			fault: {
				code: "INVALID_METER",
				message: "The meter could not be found",
			},
		})
	})

	it("builds a CreditVend request with the amount expressed in rands", () => {
		// Given
		const input = {
			amountInCents: 15_050,
			credentials,
			meterNumber: "01234567890",
			requestId: "vend-123",
		} as const

		// When
		const envelope = buildCreditVendEnvelope(input)

		// Then
		expect(envelope).toContain("<purchaseValue>150.50</purchaseValue>")
		expect(envelope).toContain("<tenderType>CREDITCARD</tenderType>")
		expect(envelope).toContain("<tenderRef>vend-123</tenderRef>")
		expect(envelope).toContain("<msno>01234567890</msno>")
	})

	it("parses a successful electricity token response", () => {
		// Given
		const response = `<?xml version="1.0" encoding="utf-8"?>
			<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
				<soap:Body>
					<CreditVendResponse xmlns="http://ravasvend.co.za/">
						<CreditVendResult>
							<respDateTime>2026-07-29T17:00:00Z</respDateTime>
							<hasFault>false</hasFault>
							<standardTokenTx>
								<StandardTokenTx>
									<units>42.5</units>
									<unitsISOUnit>kWh</unitsISOUnit>
									<amount>140.00</amount>
									<vat>10.50</vat>
									<receiptNumber>RCPT-123</receiptNumber>
									<token>1234 5678 9012 3456 7890</token>
								</StandardTokenTx>
							</standardTokenTx>
							<receiptFormat>EN_UNFORMATED</receiptFormat>
							<receipt>Electricity receipt</receipt>
							<TransactionCost>0</TransactionCost>
						</CreditVendResult>
					</CreditVendResponse>
				</soap:Body>
			</soap:Envelope>`

		// When
		const result = parseCreditVendResponse(response)

		// Then
		expect(result).toEqual({
			ok: true,
			value: {
				token: "1234 5678 9012 3456 7890",
				receiptNumber: "RCPT-123",
				units: 42.5,
				unitsIso: "kWh",
				amountInCents: 14_000,
				taxInCents: 1_050,
				receipt: "Electricity receipt",
			},
		})
	})
})
