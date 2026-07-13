ALTER TABLE `asrama_wardens` DROP FOREIGN KEY `asrama_wardens_teacher_id_teachers_id_fk`;
--> statement-breakpoint
ALTER TABLE `asrama_wardens` MODIFY COLUMN `teacher_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `asrama_wardens` ADD CONSTRAINT `asrama_wardens_teacher_id_teachers_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `asrama_wardens` DROP COLUMN `nama`;--> statement-breakpoint
ALTER TABLE `asrama_wardens` DROP COLUMN `telefon`;--> statement-breakpoint
ALTER TABLE `asrama_wardens` DROP COLUMN `foto`;