ALTER TABLE `users` ADD COLUMN `passwordHash` varchar(255);
ALTER TABLE `users` ADD COLUMN `passwordChangedAt` timestamp NULL;
ALTER TABLE `users` ADD COLUMN `failedLoginAttempts` int NOT NULL DEFAULT 0;
ALTER TABLE `users` ADD COLUMN `lockedUntil` timestamp NULL;
