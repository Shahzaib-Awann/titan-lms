CREATE TABLE `users` (
	`id` varchar(21) NOT NULL,
	`cnic` varchar(13) NOT NULL,
	`password` varchar(30) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`role` enum('admin','teacher','student') NOT NULL,
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`avatar_asset_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_cnic_unique` UNIQUE(`cnic`)
);
