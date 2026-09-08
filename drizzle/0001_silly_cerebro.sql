ALTER TABLE `surveys` ADD `linked_services` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `surveys` ADD `inconveniences` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `surveys` ADD `contract_type` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `surveys` ADD `cost_items` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `surveys` ADD `contract_terms` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `surveys` ADD `improvement_items` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `surveys` ADD `sales_rep` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `surveys` ADD `terminal_use_period` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `surveys` ADD `contract_end_date` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `surveys` ADD `monthly_cost` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `surveys` ADD `current_pms` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `surveys` ADD `current_van_dealer` text DEFAULT '' NOT NULL;