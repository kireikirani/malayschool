ALTER TABLE `asrama_wardens` ADD `teacher_id` varchar(36);--> statement-breakpoint
ALTER TABLE `asrama_wardens` ADD CONSTRAINT `asrama_wardens_teacher_id_teachers_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `asrama_wardens_teacher_id_idx` ON `asrama_wardens` (`teacher_id`);