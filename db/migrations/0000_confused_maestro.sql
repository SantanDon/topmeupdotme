CREATE TABLE `donations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_request_id` text NOT NULL,
	`transaction_request_id` text NOT NULL,
	`transaction_reference` text,
	`transaction_receipt` text NOT NULL,
	`token` text NOT NULL,
	`tax` integer NOT NULL,
	`donation_amount` integer NOT NULL,
	`sub_tax_donation_amount` integer NOT NULL,
	`electricity_quantity` integer NOT NULL,
	`energy_unit` text DEFAULT 'kWh' NOT NULL,
	`donor_name` text NOT NULL,
	`donor_email` text NOT NULL,
	`receipient_first_name` text NOT NULL,
	`receipient_last_name` text NOT NULL,
	`receipient_meter_number` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`public_request_id`) REFERENCES `requests`(`public_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`status` text DEFAULT 'activated' NOT NULL,
	`generated_link` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`minimum_vend_amount` integer DEFAULT 100 NOT NULL,
	`maximum_vend_amount` integer,
	`meter_number` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `requests_public_id_unique` ON `requests` (`public_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `requests_generated_link_unique` ON `requests` (`generated_link`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`checkout_id` text NOT NULL,
	`payment_id` text NOT NULL,
	`merchant_transaction_id` text NOT NULL,
	`amount` text NOT NULL,
	`currency` text NOT NULL,
	`payment_brand` text NOT NULL,
	`payment_type` text NOT NULL,
	`card_last_four` text NOT NULL,
	`card_holder` text NOT NULL,
	`status` text NOT NULL,
	`result_code` text,
	`result_description` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_checkout_id_unique` ON `transactions` (`checkout_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_payment_id_unique` ON `transactions` (`payment_id`);