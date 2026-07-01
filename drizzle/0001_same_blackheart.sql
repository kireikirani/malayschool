CREATE TABLE `site_settings` (
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `asrama_pelajar` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jantina` enum('lelaki','perempuan') NOT NULL,
	`nama` varchar(200) NOT NULL,
	`tingkatan` varchar(10) NOT NULL,
	`dorm` varchar(100) NOT NULL,
	`nama_waris` varchar(200),
	`no_waris` varchar(20),
	`foto` text,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `asrama_pelajar_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `unit_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unit_slug` varchar(50) NOT NULL,
	`type` enum('carta-org','dokumen') NOT NULL DEFAULT 'dokumen',
	`label` varchar(200) NOT NULL,
	`file_url` text NOT NULL,
	`file_type` enum('pdf','image','doc') NOT NULL DEFAULT 'pdf',
	`tahun` varchar(10),
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `unit_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pengumuman` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tajuk` varchar(200) NOT NULL,
	`deskripsi` text,
	`image_url` text NOT NULL,
	`link_url` varchar(500),
	`aktif` boolean NOT NULL DEFAULT true,
	`tamat_pada` timestamp,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pengumuman_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `unit_jk_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unit_slug` varchar(50) NOT NULL,
	`jk_code` varchar(20) NOT NULL,
	`jk_title` varchar(200) NOT NULL,
	`nama` varchar(200) NOT NULL,
	`jawatan` varchar(200) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `unit_jk_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE INDEX `asrama_pelajar_jantina_idx` ON `asrama_pelajar` (`jantina`);--> statement-breakpoint
CREATE INDEX `asrama_pelajar_status_idx` ON `asrama_pelajar` (`status`);--> statement-breakpoint
CREATE INDEX `asrama_pelajar_tingkatan_idx` ON `asrama_pelajar` (`tingkatan`);--> statement-breakpoint
CREATE INDEX `unit_documents_unit_slug_idx` ON `unit_documents` (`unit_slug`);--> statement-breakpoint
CREATE INDEX `unit_documents_type_idx` ON `unit_documents` (`type`);--> statement-breakpoint
CREATE INDEX `pengumuman_aktif_idx` ON `pengumuman` (`aktif`);--> statement-breakpoint
CREATE INDEX `pengumuman_sort_order_idx` ON `pengumuman` (`sort_order`);--> statement-breakpoint
CREATE INDEX `unit_jk_members_unit_slug_idx` ON `unit_jk_members` (`unit_slug`);--> statement-breakpoint
CREATE INDEX `unit_jk_members_jk_code_idx` ON `unit_jk_members` (`jk_code`);--> statement-breakpoint
CREATE INDEX `public_content_page_key_idx` ON `public_content` (`page_key`);--> statement-breakpoint
CREATE INDEX `public_content_section_key_idx` ON `public_content` (`section_key`);--> statement-breakpoint
CREATE INDEX `public_content_items_content_id_idx` ON `public_content_items` (`content_id`);--> statement-breakpoint
CREATE INDEX `unit_section_items_section_id_idx` ON `unit_section_items` (`section_id`);--> statement-breakpoint
CREATE INDEX `unit_sections_unit_slug_idx` ON `unit_sections` (`unit_slug`);--> statement-breakpoint
CREATE INDEX `unit_sections_section_key_idx` ON `unit_sections` (`section_key`);