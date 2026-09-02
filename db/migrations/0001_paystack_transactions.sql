ALTER TABLE `transactions` RENAME TO `peach_transactions_legacy`;
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_request_id` text NOT NULL,
	`provider_reference` text NOT NULL,
	`donor_email` text NOT NULL,
	`amount_in_cents` integer NOT NULL,
	`currency` text DEFAULT 'ZAR' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`failure_reason` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`public_request_id`) REFERENCES `requests`(`public_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_provider_reference_unique` ON `transactions` (`provider_reference`);
--> statement-breakpoint
CREATE UNIQUE INDEX `donations_transaction_request_id_unique` ON `donations` (`transaction_request_id`);
