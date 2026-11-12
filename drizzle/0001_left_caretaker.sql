CREATE TABLE `notebook_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`name` text NOT NULL,
	`salt` text NOT NULL,
	`password_hash` text NOT NULL,
	`must_change` integer DEFAULT 1 NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notebook_accounts_username_unique` ON `notebook_accounts` (`username`);--> statement-breakpoint
CREATE TABLE `notebook_sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`expires` integer NOT NULL
);
