CREATE TABLE `sam_registration_profiles` (
  `id` int AUTO_INCREMENT NOT NULL,
  `workspaceId` int NOT NULL,
  `status` enum('draft','submitted','processing','active','action_required','expired') NOT NULL DEFAULT 'draft',
  `uei` varchar(32),
  `cageCode` varchar(16),
  `entityIdentity` json,
  `taxpayerRestricted` json,
  `businessTypes` json,
  `entityRelationships` json,
  `paymentRestricted` json,
  `legalRepresentations` json,
  `goodsServicesSize` json,
  `businessOperations` json,
  `pointsOfContact` json,
  `federalAssistance` json,
  `submittedAt` timestamp NULL,
  `activatedAt` timestamp NULL,
  `expirationDate` timestamp NULL,
  `lastReviewedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `sam_registration_profiles_id` PRIMARY KEY(`id`),
  CONSTRAINT `sam_registration_profiles_workspace_unique` UNIQUE(`workspaceId`)
);

CREATE TABLE `sam_field_verifications` (
  `id` int AUTO_INCREMENT NOT NULL,
  `workspaceId` int NOT NULL,
  `profileId` int NOT NULL,
  `sectionKey` varchar(64) NOT NULL,
  `fieldKey` varchar(128) NOT NULL,
  `sensitivity` enum('standard','restricted','highly_restricted') NOT NULL DEFAULT 'standard',
  `isComplete` boolean NOT NULL DEFAULT false,
  `source` varchar(255),
  `verifiedBy` int,
  `verifiedAt` timestamp NULL,
  `expiresAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `sam_field_verifications_id` PRIMARY KEY(`id`),
  CONSTRAINT `sam_field_workspace_profile_field_unique` UNIQUE(`workspaceId`,`profileId`,`fieldKey`)
);

CREATE TABLE `sam_registration_history` (
  `id` int AUTO_INCREMENT NOT NULL,
  `workspaceId` int NOT NULL,
  `profileId` int NOT NULL,
  `status` enum('draft','submitted','processing','active','action_required','expired') NOT NULL,
  `confirmationReference` varchar(255),
  `notes` text,
  `recordedBy` int NOT NULL,
  `recordedAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `sam_registration_history_id` PRIMARY KEY(`id`)
);

-- Security contract:
-- taxpayerRestricted may contain TIN type/name/address and TIN last four only.
-- paymentRestricted may contain bank metadata and account/routing last four only.
-- Full TIN, routing, and account numbers require a separate approved vault reference.
-- Secret values must never be stored in these JSON documents.
