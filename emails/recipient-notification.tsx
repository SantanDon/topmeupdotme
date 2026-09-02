import {
	Body,
	Column,
	Container,
	Head,
	Heading,
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

export interface RecipientNotificationProps {
	recipientName: string
	recipientEmail: string
	donorName: string
	amount: number
	electricityToken: string
	electricityUnits: number
	meterNumber: string
	donationDate: string
	platformName: string
	platformWebsite: string
	receiptNumber: string | number
	transactionId: string
}

const baseUrl = process.env.NODE_ENV === "production" ? `https://topmeup.me` : ""

const RecipientNotificationEmail = ({
	recipientName = "Missing recipient information",
	recipientEmail = "Missing email information",
	donorName = "Anonymous Donor",
	amount = 0,
	electricityToken = "Missing electricity token",
	electricityUnits = 0,
	meterNumber = "Missing meter number",
	donationDate = new Date().toISOString(),
	platformName = "Top Me Up",
	platformWebsite = "www.topmeup.me",
	receiptNumber = "Missing receipt number",
	transactionId = "Missing transaction ID",
}: RecipientNotificationProps) => {
	const previewText = `You have received an electricity top-up of ${electricityUnits} kWh from a generous sender`

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
						</Section>
						<Text className="mb-4 text-base text-gray-600">Dear {recipientName},</Text>
						<Text className="mb-4 text-base text-gray-600">
							Great news! You have received an electricity top-up from {donorName}. Here are the details of your
							electricity token:
						</Text>
						<Section className="mb-6 rounded bg-gray-50 p-4">
							<Text className="mb-2 font-bold">Electricity Token Details:</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Receipt Number:</strong> #{receiptNumber}
							</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Transaction ID:</strong> {transactionId}
							</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Token:</strong> {electricityToken}
							</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Units (kWh):</strong> {electricityUnits}
							</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Meter Number:</strong> {meterNumber}
							</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Top-up Amount (ZAR):</strong> {amount.toFixed(2)}
							</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Date:</strong>{" "}
								{dayjs(donationDate).utc().tz("Africa/Johannesburg").format("DD MMM YYYY HH:mm")}
							</Text>
						</Section>
						<Text className="mb-4 text-base text-gray-600">To load this electricity token:</Text>
						<Text className="mb-4 text-sm text-gray-600">
							1. Go to your electricity meter
							<br />
							2. Enter the token number shown above
							<br />
							3. The units will be automatically loaded to your meter
						</Text>
						<Text className="mb-4 text-sm text-gray-600">
							If you need any assistance, please don't hesitate to contact us.
						</Text>
						<Text className="text-xs text-gray-500">{platformName} - Connecting Hearts, Changing Lives.</Text>
						<Text className="text-xs text-gray-500">
							Website:{" "}
							<Link className="text-green-500" href={`https://${platformWebsite}`}>
								{platformWebsite}
							</Link>
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

export default RecipientNotificationEmail
