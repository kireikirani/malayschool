CREATE TABLE `asrama_permohonan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pelajar_id` int NOT NULL,
	`nama_pelajar` varchar(200) NOT NULL,
	`tingkatan` varchar(10) NOT NULL,
	`dorm` varchar(100) NOT NULL,
	`jenis` enum('pulang_bermalam','outing','mc_sakit') NOT NULL,
	`tarikh_keluar` date NOT NULL,
	`tarikh_pulang` date,
	`sebab` text NOT NULL,
	`status` enum('menunggu','diluluskan','ditolak','mc') NOT NULL DEFAULT 'menunggu',
	`no_waris_pengirim` varchar(20) NOT NULL,
	`diluluskan_oleh` varchar(200),
	`approver_user_id` varchar(36),
	`tarikh_kelulusan` timestamp,
	`catatan` text,
	`pengambil` varchar(200),
	`no_pendaftaran` varchar(20),
	`guard_user_id` varchar(36),
	`guard_nama` varchar(200),
	`tarikh_diambil` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `asrama_permohonan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `asrama_permohonan` ADD CONSTRAINT `asrama_permohonan_pelajar_id_asrama_pelajar_id_fk` FOREIGN KEY (`pelajar_id`) REFERENCES `asrama_pelajar`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `asrama_permohonan` ADD CONSTRAINT `asrama_permohonan_approver_user_id_user_id_fk` FOREIGN KEY (`approver_user_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `asrama_permohonan` ADD CONSTRAINT `asrama_permohonan_guard_user_id_user_id_fk` FOREIGN KEY (`guard_user_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `asrama_permohonan_status_idx` ON `asrama_permohonan` (`status`);--> statement-breakpoint
CREATE INDEX `asrama_permohonan_jenis_idx` ON `asrama_permohonan` (`jenis`);--> statement-breakpoint
CREATE INDEX `asrama_permohonan_pelajar_id_idx` ON `asrama_permohonan` (`pelajar_id`);--> statement-breakpoint
CREATE INDEX `asrama_permohonan_tarikh_keluar_idx` ON `asrama_permohonan` (`tarikh_keluar`);