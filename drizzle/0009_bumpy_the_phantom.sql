CREATE TABLE `asrama_guards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36),
	`nama` varchar(200) NOT NULL,
	`no_telefon` varchar(50),
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `asrama_guards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `role` enum('admin','teacher','visitor','guard') NOT NULL DEFAULT 'visitor';--> statement-breakpoint
ALTER TABLE `asrama_guards` ADD CONSTRAINT `asrama_guards_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `asrama_guards_user_id_idx` ON `asrama_guards` (`user_id`);