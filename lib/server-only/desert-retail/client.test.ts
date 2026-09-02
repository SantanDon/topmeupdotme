import { afterEach, describe, expect, it } from "bun:test"
import { DesertRetailClient } from "./client"

const servers: Bun.Server<unknown>[] = []

afterEach(() => {
	for (const server of servers) {
		server.stop(true)
	}
	servers.length = 0
})

describe("DesertRetailClient", () => {
	it("posts a signed SOAP meter confirmation request to the configured endpoint", async () => {
		// Given
		const requests: Request[] = []
		const bodies: string[] = []
		const server = Bun.serve({
			port: 0,
			async fetch(request) {
				requests.push(request)
				bodies.push(await request.text())
				return new Response(`<?xml version="1.0" encoding="utf-8"?>
					<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
						<soap:Body>
							<ConfirmMeterDetailsResponse xmlns="http://ravasvend.co.za/">
								<ConfirmMeterDetailsResult>
									<hasFault>false</hasFault>
									<confirmCustResult>
										<meterIdentifier><msno>01234567890</msno></meterIdentifier>
										<custDetail>
											<name>Test Customer</name><address>12 Main Road</address>
											<minVendAmt>20</minVendAmt><maxVendAmt>1000</maxVendAmt>
										</custDetail>
										<utilityDetail><name>City Power</name></utilityDetail>
									</confirmCustResult>
								</ConfirmMeterDetailsResult>
							</ConfirmMeterDetailsResponse>
						</soap:Body>
					</soap:Envelope>`)
			},
		})
		servers.push(server)
		const client = new DesertRetailClient({
			endpoint: `http://127.0.0.1:${server.port}/Service.asmx`,
			username: "operator",
			password: "secret",
			terminalId: "TOPMEUP",
			timeoutMs: 2_000,
		})

		// When
		const result = await client.confirmMeterDetails("01234567890", "confirm-123")

		// Then
		expect(result.ok).toBe(true)
		expect(requests).toHaveLength(1)
		expect(requests[0]?.headers.get("soapaction")).toBe('"http://ravasvend.co.za/ConfirmMeterDetails"')
		expect(requests[0]?.headers.get("authorization")).toBe(`Basic ${btoa("operator:secret")}`)
		expect(bodies[0]).toContain("<msno>01234567890</msno>")
	})

	it("does not retry CreditVend when the provider returns an error", async () => {
		// Given
		let requestCount = 0
		const server = Bun.serve({
			port: 0,
			fetch() {
				requestCount += 1
				return new Response("provider unavailable", { status: 503 })
			},
		})
		servers.push(server)
		const client = new DesertRetailClient({
			endpoint: `http://127.0.0.1:${server.port}/Service.asmx`,
			username: "operator",
			password: "secret",
			terminalId: "TOPMEUP",
			timeoutMs: 2_000,
		})

		// When
		const vendPromise = client.creditVend("01234567890", 10_000, "vend-123")

		// Then
		await expect(vendPromise).rejects.toThrow("CreditVend")
		expect(requestCount).toBe(1)
	})

	it("uses ConfirmCustomer for meter discovery and preserves the voucher code", async () => {
		const actions: Array<string | null> = []
		const server = Bun.serve({
			port: 0,
			async fetch(request) {
				actions.push(request.headers.get("soapaction"))
				await request.text()
				return new Response(`<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ConfirmCustomerResponse xmlns="http://ravasvend.co.za/"><ConfirmCustomerResult><hasFault>false</hasFault><confirmCustResult><voucherCode>ESKOM</voucherCode><meterIdentifier><msno>01234567890</msno></meterIdentifier><custDetail><name>Test Customer</name><address>12 Main Road</address><minVendAmt>20</minVendAmt><maxVendAmt>1000</maxVendAmt></custDetail><utilityDetail><name>City Power</name></utilityDetail></confirmCustResult></ConfirmCustomerResult></ConfirmCustomerResponse></soap:Body></soap:Envelope>`)
			},
		})
		servers.push(server)
		const client = new DesertRetailClient({
			endpoint: `http://127.0.0.1:${server.port}/Service.asmx`,
			username: "operator",
			password: "secret",
			terminalId: "TOPMEUP",
			timeoutMs: 2_000,
		})

		const result = await client.confirmCustomer("01234567890", "confirm-123")

		expect(result.ok).toBe(true)
		if (result.ok) {
			expect(result.value[0]?.voucherCode).toBe("ESKOM")
		}
		expect(actions[0]).toBe('"http://ravasvend.co.za/ConfirmCustomer"')
	})
})
