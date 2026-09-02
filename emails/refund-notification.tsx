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

export interface RefundNotificationProps {
	donorName: string
	donorEmail: string
	amount: number
	transactionId: string
	refundDate: string
	recipientName: string
	platformName: string
	platformWebsite: string
	refundReason: string
}

const baseUrl = process.env.NODE_ENV === "production" ? `https://topmeup.me` : ""

const RefundNotificationEmail = ({
	donorName = "Missing donor information",
	donorEmail = "Missing email information",
	amount = 50,
	transactionId = "TMU-??-??-??",
	refundDate = new Date().toISOString(),
	recipientName = "Missing recipient information",
	platformName = "Top Me Up",
	platformWebsite = "www.topmeup.me",
	refundReason = "Electricity vending failed",
}: RefundNotificationProps) => {
	const previewText = `Your top-up of ZAR ${amount} has been refunded`

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
								<Heading className="text-xl text-center font-bold text-gray-500">Donation Refund Notification</Heading>
							</Row>
						</Section>
						<Text className="mb-4 text-base capitalize text-gray-600">Dear {donorName},</Text>
						<Text className="mb-4 text-base text-gray-600">
							We regret to inform you that your recent top-up to provide electricity for {recipientName} could not be
							processed successfully. The full amount has been refunded to your payment method.
						</Text>
						<Section className="mb-6 rounded bg-gray-50 p-4">
							<Text className="mb-2 font-bold">Refund Details:</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Transaction ID:</strong> {transactionId}
							</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Amount Refunded (ZAR):</strong> {amount.toFixed(2)}
							</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Refund Date:</strong>{" "}
								{dayjs(refundDate).utc().tz("Africa/Johannesburg").format("DD MMM YYYY HH:mm")} (UTC{" "}
								{dayjs(refundDate).utc().tz("Africa/Johannesburg").format("Z")})
							</Text>
							<Text className="text-sm">
								<strong className="text-green-600">Reason:</strong> {refundReason}
							</Text>
						</Section>
						<Text className="mb-4 text-sm text-gray-600">
							The refund should appear in your account within 3-5 business days, depending on your bank's processing
							time.
						</Text>
						<Text className="mb-4 text-sm text-gray-600">
							We apologize for any inconvenience this may have caused. If you'd like to try again, please visit our
							website.
						</Text>
						<Hr className="my-6 border-gray-300" />
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

export default RefundNotificationEmail
