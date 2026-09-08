CREATE TABLE `surveys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clinic_name` text NOT NULL,
	`region` text NOT NULL,
	`district` text NOT NULL,
	`respondent_role` text DEFAULT '' NOT NULL,
	`devices` text NOT NULL,
	`terminal_count` integer DEFAULT 0 NOT NULL,
	`van_company` text DEFAULT '' NOT NULL,
	`pms_integrated` text NOT NULL,
	`monthly_fee` text NOT NULL,
	`free_supplies` text NOT NULL,
	`satisfaction` integer NOT NULL,
	`replacement_intent` text NOT NULL,
	`long_contract` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
