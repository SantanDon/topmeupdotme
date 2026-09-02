import {
	Body,
	Column,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Row,
	Section,
	Tailwind,
	Text,
} from "@react-email/components"
import dayjs from "dayjs"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)
dayjs.extend(timezone)

export interface DonorReceiptProps {
	donorName: string
	donorEmail: string
	amount: number
	transactionId: string
	donationDate: string
	recipientName: string
	platformName: string
	platformWebsite: string
	recipientMeterNumber: string
	electricityToken: string
	electricityUnits: number
	receiptNumber: string | number
}
const baseUrl = process.env.NODE_ENV === "production" ? `https://topmeup.me` : ""

const DonationReceiptEmail = ({
	donorName = "Missing donor information",
	donorEmail = "Missing email information",
	amount = 50,
	transactionId = "TMU-??-??-??",
	donationDate = new Date().toISOString(),
	recipientName = "Missing recipient information",
	platformName = "Top Me Up",
	platformWebsite = "www.topmeup.me",
	recipientMeterNumber = "Missing meter number",
	electricityToken = "Missing electricity token",
	electricityUnits = 0,
	receiptNumber = "Missing receipt number",
}: DonorReceiptProps) => {
	const previewText = `Thank you for your top-up of ZAR ${amount} to provide electricity for ${recipientName}`

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Tailwind>
				<Body className="bg-gray-100 font-sans">
					<Container className="mx-auto my-10 max-w-[600px] rounded bg-white p-8 shadow-lg">
						<Section>
							<Row className="w-fit">
								<Column className="w-fit">
									<Img src={`${baseUrl}/static/tmu-logo.png`} alt="Top Me Up" width={48} height={48} />
								</Column>
								<Column className="w-fit">
									<Heading className="mb-4 text-2xl font-bold text-green-500">Top Me Up</Heading>
								</Column>
							</Row>
							<Row>
								<Heading className="text-xl text-center font-bold text-gray-500">
									Official Top-up Receipt - #{receiptNumber}
								</Heading>
							</Row>
						</Section>
						<Text className="mb-4 text-base text-gray-600">Dear {donorName},</Text>
						<Text className="mb-4 text-base text-gray-600">
							Thank you for your generous top-up to provide electricity for {recipientName}. Your support makes a
							significant difference.
						</Text>
						<Section className="mb-6 rounded bg-gray-50 p-4">
							<Text className="mb-2 font-bold">Transaction Details:</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Transaction ID:</strong> {transactionId}
							</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Donor Name:</strong> {donorName}
							</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Donor Email:</strong> {donorEmail}
							</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Recipient:</strong> {recipientName}
							</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Recipient Meter Number:</strong> {recipientMeterNumber}
							</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Recipient Electricity Token:</strong> {electricityToken}
							</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Units Purchased (kWh):</strong> {electricityUnits}
							</Text>

							<Text className="text-sm">
								<strong className="text-green-600">Top-up Amount (ZAR):</strong> {amount.toFixed(2)}
							</Text>

							<Text className="text-sm">
								<strong className="text-green-600">Transaction Date:</strong>{" "}
								{dayjs(donationDate).utc().tz("Africa/Johannesburg").format("DD MMM YYYY HH:mm")} (UTC{" "}
								{dayjs(donationDate).utc().tz("Africa/Johannesburg").format("Z")})
							</Text>
						</Section>
						<Text className="mb-4 text-sm text-gray-600">
						This letter serves as an official receipt for your top-up. Please retain it for your records.
						</Text>
						<Hr className="my-6 border-gray-300" />
						<Text className="text-xs text-gray-500">{platformName} - Connecting Hearts, Changing Lives.</Text>
						<Text className="text-xs text-gray-500">
							Website:{" "}
							<Link className="text-green-500" href={`https://${platformWebsite}`}>
								{platformWebsite}
							</Link>
						</Text>
						<Text className="mt-4 text-xs text-gray-500">
							Note: {platformName} is a platform that facilitates peer-to-peer electricity top-ups. We do
							not claim any tax-exempt status for these top-ups. Please consult with a tax professional regarding the
							deductibility of your contribution.
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

export default DonationReceiptEmail
