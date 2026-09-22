ALTER TABLE `agent_runs`
  ADD COLUMN `recordContext` text NULL AFTER `relatedRecordId`,
  ADD COLUMN `proposedAction` text NULL AFTER `errorMessage`,
  ADD COLUMN `approvalStatus` enum('not_required','pending','approved','rejected') NOT NULL DEFAULT 'not_required' AFTER `proposedAction`,
  ADD COLUMN `approvedBy` int NULL AFTER `approvalStatus`,
  ADD COLUMN `approvedAt` timestamp NULL AFTER `approvedBy`,
  ADD COLUMN `approvalNotes` text NULL AFTER `approvedAt`;
