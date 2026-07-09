CREATE TABLE `unit_jk_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unit_slug` varchar(50) NOT NULL,
	`jk_code` varchar(100) NOT NULL,
	`label` varchar(200) NOT NULL,
	`file_url` text NOT NULL,
	`file_type` enum('pdf','image','doc','link') NOT NULL DEFAULT 'pdf',
	`tahun` varchar(10),
	`is_visible` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `unit_jk_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `asrama_wardens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nama` varchar(200) NOT NULL,
	`jawatan` varchar(200) NOT NULL,
	`telefon` varchar(50),
	`foto` varchar(2048),
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `asrama_wardens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `asrama_fasiliti` (
	`id` int AUTO_INCREMENT NOT NULL,
	`icon_name` varchar(100) NOT NULL,
	`label` varchar(200) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `asrama_fasiliti_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `role` enum('admin','teacher','visitor') NOT NULL DEFAULT 'visitor';--> statement-breakpoint
ALTER TABLE `user` ADD `is_approved` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `rejection_reason` text;--> statement-breakpoint
ALTER TABLE `user` ADD `teacher_phone` varchar(50);--> statement-breakpoint
ALTER TABLE `user` ADD `teacher_subject` varchar(255);--> statement-breakpoint
ALTER TABLE `user` ADD `teacher_notes` text;--> statement-breakpoint
ALTER TABLE `teachers` ADD `user_id` varchar(36);--> statement-breakpoint
ALTER TABLE `teachers` ADD `phone` varchar(50);--> statement-breakpoint
ALTER TABLE `teachers` ADD `subject` varchar(255);--> statement-breakpoint
ALTER TABLE `teachers` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `unit_documents` ADD `is_visible` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_user_id_idx` UNIQUE(`user_id`);--> statement-breakpoint
CREATE INDEX `unit_jk_docs_unit_slug_idx` ON `unit_jk_documents` (`unit_slug`);--> statement-breakpoint
CREATE INDEX `unit_jk_docs_jk_code_idx` ON `unit_jk_documents` (`jk_code`);--> statement-breakpoint
CREATE INDEX `unit_jk_docs_compound_idx` ON `unit_jk_documents` (`unit_slug`,`jk_code`);--> statement-breakpoint
CREATE INDEX `asrama_wardens_sort_order_idx` ON `asrama_wardens` (`sort_order`);--> statement-breakpoint
CREATE INDEX `asrama_fasiliti_sort_order_idx` ON `asrama_fasiliti` (`sort_order`);--> statement-breakpoint
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_role_idx` ON `user` (`role`);--> statement-breakpoint
CREATE INDEX `user_is_approved_idx` ON `user` (`is_approved`);