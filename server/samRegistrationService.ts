import { and, desc, eq } from "drizzle-orm";
import { getDb } from "./db";
import {
  samFieldVerifications,
  samRegistrationHistory,
  samRegistrationProfiles,
  type InsertSamFieldVerification,
  type InsertSamRegistrationProfile,
} from "../drizzle/samRegistrationSchema";
import {
  assertNoFullIdentifiers,
  samFieldVerificationSchema,
  samRegistrationUpdateSchema,
} from "../shared/samRegistrationSchemas";

export async function getSamRegistrationProfile(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [profile] = await db
    .select()
    .from(samRegistrationProfiles)
    .where(eq(samRegistrationProfiles.workspaceId, workspaceId))
    .limit(1);

  if (!profile) return null;

  const verifications = await db
    .select()
    .from(samFieldVerifications)
    .where(
      and(
        eq(samFieldVerifications.workspaceId, workspaceId),
        eq(samFieldVerifications.profileId, profile.id)
      )
    );

  return { ...profile, verifications };
}

export async function upsertSamRegistrationProfile(
  workspaceId: number,
  input: unknown
) {
  const parsed = samRegistrationUpdateSchema.parse(input);
  assertNoFullIdentifiers(parsed);

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const values: InsertSamRegistrationProfile = {
    workspaceId,
    ...parsed,
    lastReviewedAt: new Date(),
  };

  await db
    .insert(samRegistrationProfiles)
    .values(values)
    .onDuplicateKeyUpdate({
      set: {
        ...parsed,
        lastReviewedAt: new Date(),
      },
    });

  const [profile] = await db
    .select()
    .from(samRegistrationProfiles)
    .where(eq(samRegistrationProfiles.workspaceId, workspaceId))
    .limit(1);

  if (!profile) throw new Error("SAM registration profile was not saved");
  return profile;
}

export async function verifySamRegistrationField(
  workspaceId: number,
  profileId: number,
  verifiedBy: number,
  input: unknown
) {
  const parsed = samFieldVerificationSchema.parse(input);
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [ownedProfile] = await db
    .select({ id: samRegistrationProfiles.id })
    .from(samRegistrationProfiles)
    .where(
      and(
        eq(samRegistrationProfiles.id, profileId),
        eq(samRegistrationProfiles.workspaceId, workspaceId)
      )
    )
    .limit(1);

  if (!ownedProfile) throw new Error("SAM registration profile not found");

  const values: InsertSamFieldVerification = {
    workspaceId,
    profileId,
    verifiedBy,
    ...parsed,
  };

  await db
    .insert(samFieldVerifications)
    .values(values)
    .onDuplicateKeyUpdate({
      set: {
        sensitivity: parsed.sensitivity,
        isComplete: parsed.isComplete,
        source: parsed.source,
        verifiedBy,
        verifiedAt: parsed.verifiedAt,
        expiresAt: parsed.expiresAt,
      },
    });
}

export async function recordSamRegistrationStatus(
  workspaceId: number,
  profileId: number,
  recordedBy: number,
  status: InsertSamRegistrationProfile["status"],
  details: { confirmationReference?: string; notes?: string } = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [ownedProfile] = await db
    .select({ id: samRegistrationProfiles.id })
    .from(samRegistrationProfiles)
    .where(
      and(
        eq(samRegistrationProfiles.id, profileId),
        eq(samRegistrationProfiles.workspaceId, workspaceId)
      )
    )
    .limit(1);

  if (!ownedProfile) throw new Error("SAM registration profile not found");

  await db.transaction(async (tx) => {
    await tx
      .update(samRegistrationProfiles)
      .set({ status })
      .where(
        and(
          eq(samRegistrationProfiles.id, profileId),
          eq(samRegistrationProfiles.workspaceId, workspaceId)
        )
      );

    await tx.insert(samRegistrationHistory).values({
      workspaceId,
      profileId,
      status: status ?? "draft",
      confirmationReference: details.confirmationReference,
      notes: details.notes,
      recordedBy,
    });
  });
}

export async function listSamRegistrationHistory(
  workspaceId: number,
  profileId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(samRegistrationHistory)
    .where(
      and(
        eq(samRegistrationHistory.workspaceId, workspaceId),
        eq(samRegistrationHistory.profileId, profileId)
      )
    )
    .orderBy(desc(samRegistrationHistory.recordedAt));
}
