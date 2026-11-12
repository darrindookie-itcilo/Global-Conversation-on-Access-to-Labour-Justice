CREATE TABLE `login_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`room` text NOT NULL,
	`name` text NOT NULL,
	`country` text NOT NULL,
	`role` text NOT NULL,
	`group_no` integer DEFAULT 0 NOT NULL,
	`perspective` text DEFAULT '' NOT NULL,
	`experience` text DEFAULT '' NOT NULL,
	`challenge` text DEFAULT '' NOT NULL,
	`question` text DEFAULT '' NOT NULL,
	`published` integer DEFAULT 0 NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`body` text NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`size` integer NOT NULL,
	`stage` text NOT NULL,
	`spotlight` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
