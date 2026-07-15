CREATE TABLE `ubk_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tingkatan` varchar(50) NOT NULL,
	`label` varchar(200),
	`sheet_url` text NOT NULL,
	`last_imported_at` timestamp,
	`last_import_count` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ubk_links_id` PRIMARY KEY(`id`)
);
