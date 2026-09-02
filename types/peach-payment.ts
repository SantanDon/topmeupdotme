/**
 * Represents a card used in a payment transaction
 */
export interface PaymentCard {
  /** First 6 digits of the card number */
  bin: string;
  /** Card expiry month (2 digits) */
  expiryMonth: string;
  /** Card expiry year (4 digits) */
  expiryYear: string;
  /** Name of the card holder */
  holder: string;
  /** Last 4 digits of the card number */
  last4Digits: string;
}

/**
 * Represents merchant information in a payment transaction
 */
export interface Merchant {
  /** Name of the merchant */
  name: string;
}

/**
 * Represents reconciliation information for a payment transaction
 */
export interface ReconciliationInfo {
  /** Authorization code from the payment processor */
  authCode: string;
  /** Result code from the payment processor */
  resultCode: string;
  /** Retrieval Reference Number */
  rrn: string;
  /** System Trace Audit Number */
  stan: string;
}

/**
 * Represents the result of a payment transaction
 */
export interface TransactionResult {
  /** Result code indicating the status of the transaction */
  code: string;
  /** Human-readable description of the transaction result */
  description: string;
}

/**
 * Represents additional details about the transaction result
 */
export interface ResultDetails {
  /** Response code from the acquirer */
  AcquirerResponse: string;
  /** Detailed description of the transaction result */
  ExtendedDescription: string;
}

/**
 * Represents a completed checkout event from Peach Payments
 */
export interface CompletedCheckoutEvent {
  /** Transaction amount as a string with decimal places */
  amount: string;
  /** Card information used in the transaction */
  card: PaymentCard;
  /** Unique identifier for the checkout session */
  checkoutId: string;
  /** Currency code (e.g., "ZAR") */
  currency: string;
  /** Unique identifier for the transaction */
  id: string;
  /** Merchant information */
  merchant: Merchant;
  /** Merchant's internal transaction reference */
  merchantTransactionId: string;
  /** Brand of the payment card (e.g., "VISA") */
  paymentBrand: string;
  /** Type of payment (e.g., "DB" for debit) */
  paymentType: string;
  /** Reconciliation information */
  recon: ReconciliationInfo;
  /** Transaction result information */
  result: TransactionResult;
  /** Additional details about the transaction result */
  resultDetails: ResultDetails;
  /** Digital signature for transaction verification */
  signature: string;
  /** ISO 8601 timestamp of the transaction */
  timestamp: string;
}

// {
//     "amount": "160.00",
//     "card": {
//         "bin": "420000",
//         "expiryMonth": "03",
//         "expiryYear": "2029",
//         "holder": "TEST A",
//         "last4Digits": "0091"
//     },
//     "checkoutId": "cd8425e30ee849f487caea36a114adb2",
//     "currency": "ZAR",
//     "id": "8ac7a4a19498a04701949e80bfcd2616",
//     "merchant": {
//         "name": "SB Top Me Up"
//     },
//     "merchantTransactionId": "INV-0000001",
//     "paymentBrand": "VISA",
//     "paymentType": "DB",
//     "recon": {
//         "authCode": "006887",
//         "resultCode": "000",
//         "rrn": "962659338253",
//         "stan": "860002"
//     },
//     "result": {
//         "code": "000.100.110",
//         "description": "Request successfully processed in 'Merchant in Integrator Test Mode'"
//     },
//     "resultDetails": {
//         "AcquirerResponse": "E0000",
//         "ExtendedDescription": "Transaction Successful"
//     },
//     "signature": "19ed0e4db54737f6670618c3eb2d91ebde46198e26b7f49548a0b0f3aa2d70e3",
//     "timestamp": "2025-01-25T17:27:17Z"
// }