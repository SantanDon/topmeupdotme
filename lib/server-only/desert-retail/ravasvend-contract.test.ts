import { describe, expect, it } from "bun:test"
import {
	buildAdviceEnvelope,
	buildConfirmCustomerEnvelope,
	buildCreditVendEnvelope,
	parseAdviceResponse,
	parseConfirmCustomerResponse,
	parseCreditVendResponse,
} from "./ravasvend-contract"

const credentials = { username: "operator<&", password: "secret<&" } as const

describe("RAVASVend electricity contract", () => {
	it("builds a ConfirmCustomer request with a unique message id", () => {
		const envelope = buildConfirmCustomerEnvelope({
			allSuppliers: false,
			amountInCents: 0,
			credentials,
			meterNumber: "01234567890",
			msgId: "20260810120000000001",
			terminalId: "TOPMEUP-01234567890",
			terminalMsgId: "TMU-METER-123",
		})

		expect(envelope).toContain("<ConfirmCustomer")
		expect(envelope).toContain("<terminalID>TOPMEUP-01234567890</terminalID>")
		expect(envelope).toContain("<msgID>20260810120000000001</msgID>")
		expect(envelope).toContain("<allSuppliers>false</allSuppliers>")
		expect(envelope).toContain("<msno>01234567890</msno>")
		expect(envelope).not.toContain("<password>secret<&</password>")
		expect(envelope).toContain("<password>secret&lt;&amp;</password>")
	})

	it("preserves all matching suppliers from ConfirmCustomer", () => {
		const result = parseConfirmCustomerResponse(`<?xml version="1.0"?>
			<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>
			<ConfirmCustomerResponse xmlns="http://ravasvend.co.za/"><ConfirmCustomerResult>
			<hasFault>false</hasFault><confirmCustResult>
			<voucherCode>ESKOM</voucherCode><meterIdentifier><msno>01234567890</msno></meterIdentifier>
			<custDetail><name>Test Customer</name><address>12 Main Road</address><minVendAmt>20</minVendAmt><maxVendAmt>1000</maxVendAmt></custDetail>
			<utilityDetail><name>City Power</name></utilityDetail></confirmCustResult>
			<confirmCustResult><voucherCode>MUNI</voucherCode><meterIdentifier><msno>01234567890</msno></meterIdentifier>
			<custDetail><name>Test Customer</name><address>12 Main Road</address><minVendAmt>20</minVendAmt><maxVendAmt>500</maxVendAmt></custDetail>
			<utilityDetail><name>Municipality</name></utilityDetail></confirmCustResult>
			</ConfirmCustomerResult></ConfirmCustomerResponse></soap:Body></soap:Envelope>`)

		expect(result).toEqual({
			ok: true,
			value: [
				{
					voucherCode: "ESKOM",
					meterNumber: "01234567890",
					customerName: "Test Customer",
					customerAddress: "12 Main Road",
					utilityName: "City Power",
					minimumVendAmountInCents: 2_000,
					maximumVendAmountInCents: 100_000,
				},
				{
					voucherCode: "MUNI",
					meterNumber: "01234567890",
					customerName: "Test Customer",
					customerAddress: "12 Main Road",
					utilityName: "Municipality",
					minimumVendAmountInCents: 2_000,
					maximumVendAmountInCents: 50_000,
				},
			],
		})
	})

	it("includes the selected voucher code and stable terminal id in CreditVend", () => {
		const envelope = buildCreditVendEnvelope({
			amountInCents: 15_050,
			credentials,
			meterNumber: "01234567890",
			msgId: "20260810120000000002",
			tenderRef: "TMU-PAYMENT-123",
			terminalId: "TOPMEUP-01234567890",
			terminalMsgId: "TMU-PAYMENT-123",
			voucherCode: "ESKOM",
		})

		expect(envelope).toContain("<voucherCode>ESKOM</voucherCode>")
		expect(envelope).toContain("<purchaseValue>150.50</purchaseValue>")
		expect(envelope).toContain("<terminalID>TOPMEUP-01234567890</terminalID>")
		expect(envelope).toContain("<msgID>20260810120000000002</msgID>")
	})

	it("parses a successful CreditVend token", () => {
		const result = parseCreditVendResponse(`<?xml version="1.0"?>
			<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>
			<CreditVendResponse xmlns="http://ravasvend.co.za/"><CreditVendResult><hasFault>false</hasFault>
			<standardTokenTx><StandardTokenTx><units>42.5</units><unitsISOUnit>kWh</unitsISOUnit><amount>140.00</amount><vat>10.50</vat><receiptNumber>RCPT-123</receiptNumber><token>1234 5678</token></StandardTokenTx></standardTokenTx><receipt>Receipt text</receipt></CreditVendResult></CreditVendResponse></soap:Body></soap:Envelope>`)

		expect(result).toEqual({
			ok: true,
			value: {
				token: "1234 5678",
				receiptNumber: "RCPT-123",
				units: 42.5,
				unitsIso: "kWh",
				amountInCents: 14_000,
				taxInCents: 1_050,
				receipt: "Receipt text",
			},
		})
	})

	it("builds Advice against the original CreditVend message id", () => {
		const envelope = buildAdviceEnvelope({
			adviceReqMsgId: "20260810120000000002",
			credentials,
			msgId: "20260810120000000003",
			terminalId: "TOPMEUP-01234567890",
			terminalMsgId: "TMU-PAYMENT-123",
		})

		expect(envelope).toContain("<Advice")
		expect(envelope).toContain("<adviceReqMsgID>20260810120000000002</adviceReqMsgID>")
		expect(envelope).toContain("<msgID>20260810120000000003</msgID>")
	})

	it("exposes mustALR faults so callers can continue with Advice", () => {
		const result = parseAdviceResponse(`<?xml version="1.0"?>
			<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>
			<AdviceResponse xmlns="http://ravasvend.co.za/"><AdviceResult><hasFault>true</hasFault><fault><mustALR>true</mustALR><faultnumber>8</faultnumber><desc>Incomplete Transaction Fault</desc></fault></AdviceResult></AdviceResponse></soap:Body></soap:Envelope>`)

		expect(result).toEqual({ ok: false, fault: { code: "8", message: "Incomplete Transaction Fault", mustALR: true } })
	})

	it("returns the original token when Advice completes a pending vend", () => {
		const result = parseAdviceResponse(`<?xml version="1.0"?>
			<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>
			<AdviceResponse xmlns="http://ravasvend.co.za/"><AdviceResult><hasFault>false</hasFault><lastResponse><hasFault>false</hasFault><standardTokenTx><StandardTokenTx><units>10</units><unitsISOUnit>kWh</unitsISOUnit><amount>50</amount><vat>7.5</vat><receiptNumber>RCPT-ADVICE</receiptNumber><token>9988 7766</token></StandardTokenTx></standardTokenTx><receipt>Advice receipt</receipt></lastResponse></AdviceResult></AdviceResponse></soap:Body></soap:Envelope>`)

		expect(result).toEqual({
			ok: true,
			value: {
				token: "9988 7766",
				receiptNumber: "RCPT-ADVICE",
				units: 10,
				unitsIso: "kWh",
				amountInCents: 5_000,
				taxInCents: 750,
				receipt: "Advice receipt",
			},
		})
	})
})
