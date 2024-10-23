CREATE TABLE `stories` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`image_prompt` text NOT NULL,
	`image_url` text,
	`audio_url` text,
	`content` text
);
