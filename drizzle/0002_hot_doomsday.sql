ALTER TABLE `teachers` ADD `sort_order` int DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `teachers_sort_order_idx` ON `teachers` (`sort_order`);