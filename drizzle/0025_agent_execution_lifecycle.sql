ALTER TABLE `agent_runs`
  ADD COLUMN `executionStatus` enum('not_started','preview_ready','authorized','executing','verified','failed') NOT NULL DEFAULT 'not_started' AFTER `approvalNotes`,
  ADD COLUMN `executionPreview` text NULL AFTER `executionStatus`,
  ADD COLUMN `executionAuthorizedBy` int NULL AFTER `executionPreview`,
  ADD COLUMN `executionAuthorizedAt` timestamp NULL AFTER `executionAuthorizedBy`,
  ADD COLUMN `executionResult` text NULL AFTER `executionAuthorizedAt`,
  ADD COLUMN `executionVerifiedAt` timestamp NULL AFTER `executionResult`,
  ADD COLUMN `executionError` text NULL AFTER `executionVerifiedAt`;
