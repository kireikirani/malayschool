CREATE TABLE `public_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page_key` varchar(50) NOT NULL,
	`section_key` varchar(100) NOT NULL,
	`type` enum('hero','text_block','stats','poster','file_list','quick_links','simple_table','card_grid','gallery','jk_table') NOT NULL,
	`title` varchar(255),
	`subtitle` text,
	`body` text,
	`image_url` text,
	`link_label` varchar(255),
	`link_url` varchar(500),
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `public_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `public_content_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content_id` int NOT NULL,
	`label` varchar(255),
	`title` varchar(255),
	`value` varchar(255),
	`body` text,
	`url` varchar(500),
	`file_url` text,
	`image_url` text,
	`meta_json` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `public_content_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `unit_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unit_slug` varchar(50) NOT NULL,
	`section_key` varchar(100) NOT NULL,
	`type` enum('hero','text_block','stats','poster','file_list','quick_links','simple_table','card_grid','gallery','jk_table') NOT NULL,
	`title` varchar(255),
	`subtitle` text,
	`body` text,
	`image_url` text,
	`link_label` varchar(255),
	`link_url` varchar(500),
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `unit_sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `unit_section_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section_id` int NOT NULL,
	`label` varchar(255),
	`title` varchar(255),
	`value` varchar(255),
	`body` text,
	`url` varchar(500),
	`file_url` text,
	`image_url` text,
	`meta_json` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `unit_section_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `public_content_page_key_idx` ON `public_content` (`page_key`);
--> statement-breakpoint
CREATE INDEX `public_content_section_key_idx` ON `public_content` (`section_key`);
--> statement-breakpoint
CREATE INDEX `public_content_items_content_id_idx` ON `public_content_items` (`content_id`);
--> statement-breakpoint
CREATE INDEX `unit_sections_unit_slug_idx` ON `unit_sections` (`unit_slug`);
--> statement-breakpoint
CREATE INDEX `unit_sections_section_key_idx` ON `unit_sections` (`section_key`);
--> statement-breakpoint
CREATE INDEX `unit_section_items_section_id_idx` ON `unit_section_items` (`section_id`);
