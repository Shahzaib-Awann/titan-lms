CREATE TABLE `assets` (
	`id` varchar(21) NOT NULL,
	`public_id` varchar(255),
	`url` text NOT NULL,
	`original_name` varchar(255),
	`file_name` varchar(255),
	`extension` enum('pdf','mp4','png','jpg','jpeg','md') NOT NULL,
	`size_bytes` bigint,
	`uploaded_by` varchar(21) NOT NULL,
	`uploaded_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_profiles` (
	`id` varchar(21) NOT NULL,
	`user_id` varchar(21) NOT NULL,
	`roll_number` varchar(50) NOT NULL,
	`date_of_birth` date,
	`guardian_name` varchar(255),
	`guardian_phone` varchar(20),
	`address` text,
	`admission_date` date,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `student_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_profiles_user_id_unique` UNIQUE(`user_id`),
	CONSTRAINT `student_profiles_roll_number_unique` UNIQUE(`roll_number`)
);
--> statement-breakpoint
CREATE TABLE `teacher_profiles` (
	`id` varchar(21) NOT NULL,
	`user_id` varchar(21) NOT NULL,
	`employee_code` varchar(50) NOT NULL,
	`specialization` varchar(255),
	`bio` text,
	`hourly_rate` int,
	`joined_at` date,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `teacher_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `teacher_profiles_employee_code_unique` UNIQUE(`employee_code`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `avatar_asset_id` varchar(21);--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `assets_uploaded_by_users_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD CONSTRAINT `student_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teacher_profiles` ADD CONSTRAINT `teacher_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;