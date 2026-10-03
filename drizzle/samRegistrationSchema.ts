import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

export const samRegistrationProfiles = mysqlTable(
  "sam_registration_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceId: int("workspaceId").notNull(),
    status: mysqlEnum("status", [
      "draft",
      "submitted",
      "processing",
      "active",
      "action_required",
      "expired",
    ])
      .default("draft")
      .notNull(),
    uei: varchar("uei", { length: 32 }),
    cageCode: varchar("cageCode", { length: 16 }),
    entityIdentity: json("entityIdentity"),
    taxpayerRestricted: json("taxpayerRestricted"),
    businessTypes: json("businessTypes"),
    entityRelationships: json("entityRelationships"),
    paymentRestricted: json("paymentRestricted"),
    legalRepresentations: json("legalRepresentations"),
    goodsServicesSize: json("goodsServicesSize"),
    businessOperations: json("businessOperations"),
    pointsOfContact: json("pointsOfContact"),
    federalAssistance: json("federalAssistance"),
    submittedAt: timestamp("submittedAt"),
    activatedAt: timestamp("activatedAt"),
    expirationDate: timestamp("expirationDate"),
    lastReviewedAt: timestamp("lastReviewedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    unique("sam_registration_profiles_workspace_unique").on(table.workspaceId),
  ]
);

export const samFieldVerifications = mysqlTable(
  "sam_field_verifications",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceId: int("workspaceId").notNull(),
    profileId: int("profileId").notNull(),
    sectionKey: varchar("sectionKey", { length: 64 }).notNull(),
    fieldKey: varchar("fieldKey", { length: 128 }).notNull(),
    sensitivity: mysqlEnum("sensitivity", [
      "standard",
      "restricted",
      "highly_restricted",
    ])
      .default("standard")
      .notNull(),
    isComplete: boolean("isComplete").default(false).notNull(),
    source: varchar("source", { length: 255 }),
    verifiedBy: int("verifiedBy"),
    verifiedAt: timestamp("verifiedAt"),
    expiresAt: timestamp("expiresAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    unique("sam_field_workspace_profile_field_unique").on(
      table.workspaceId,
      table.profileId,
      table.fieldKey
    ),
  ]
);

export const samRegistrationHistory = mysqlTable("sam_registration_history", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  profileId: int("profileId").notNull(),
  status: mysqlEnum("status", [
    "draft",
    "submitted",
    "processing",
    "active",
    "action_required",
    "expired",
  ]).notNull(),
  confirmationReference: varchar("confirmationReference", { length: 255 }),
  notes: text("notes"),
  recordedBy: int("recordedBy").notNull(),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export type SamRegistrationProfile =
  typeof samRegistrationProfiles.$inferSelect;
export type InsertSamRegistrationProfile =
  typeof samRegistrationProfiles.$inferInsert;
export type SamFieldVerification = typeof samFieldVerifications.$inferSelect;
export type InsertSamFieldVerification =
  typeof samFieldVerifications.$inferInsert;
export type SamRegistrationHistoryEntry =
  typeof samRegistrationHistory.$inferSelect;
