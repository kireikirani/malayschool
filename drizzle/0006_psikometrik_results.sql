CREATE TABLE IF NOT EXISTS `psikometrik_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`no_pengenalan` varchar(20) NOT NULL,
	`nama_murid` varchar(200) NOT NULL,
	`kod_sekolah` varchar(20),
	`nama_sekolah` varchar(200),
	`nama_kelas` varchar(50),
	`tarikh` varchar(30),
	`scores_json` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `psikometrik_results_id` PRIMARY KEY(`id`),
	CONSTRAINT `psikometrik_results_no_pengenalan_unique` UNIQUE(`no_pengenalan`)
);
--> statement-breakpoint
CREATE INDEX `psikometrik_no_pengenalan_idx` ON `psikometrik_results` (`no_pengenalan`);
