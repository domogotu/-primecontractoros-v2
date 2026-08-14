import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { enforcePermission } from "./rbacMiddleware";
import { logAudit } from "./featureRouter";
import {
  getSamRegistrationProfile,
  listSamRegistrationHistory,
  recordSamRegistrationStatus,
  upsertSamRegistrationProfile,
  verifySamRegistrationField,
} from "./samRegistrationService";
import {
  samFieldVerificationSchema,
  samRegistrationUpdateSchema,
  samStatusSchema,
} from "../shared/samRegistrationSchemas";
import {
  calculateSamReadiness,
  type SamRegistrationSnapshot,
} from "../shared/samRegistration";

function toSnapshot(
  profile: NonNullable<Awaited<ReturnType<typeof getSamRegistrationProfile>>>
): SamRegistrationSnapshot {
  return {
    status: profile.status,
    expirationDate: profile.expirationDate,
    submittedAt: profile.submittedAt,
    activatedAt: profile.activatedAt,
    fields: profile.verifications.map((field) => ({
      fieldKey: field.fieldKey,
      sectionKey: field.sectionKey as SamRegistrationSnapshot["fields"][number]["sectionKey"],
      verifiedAt: field.verifiedAt,
      expiresAt: field.expiresAt,
      sensitivity: field.sensitivity,
      required: true,
      complete: field.isComplete,
      source: field.source,
    })),
  };
}

export const samRegistrationRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const profile = await getSamRegistrationProfile(workspaceId);

    if (!profile) {
      return { profile: null, readiness: null };
    }

    return {
      profile,
      readiness: calculateSamReadiness(toSnapshot(profile)),
    };
  }),

  upsert: protectedProcedure
    .input(samRegistrationUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { wsId: workspaceId } = await enforcePermission(
        ctx.user.id,
        "write"
      );
      const profile = await upsertSamRegistrationProfile(workspaceId, input);

      await logAudit(
        workspaceId,
        ctx.user.id,
        "update",
        "sam_registration_profile",
        profile.id,
        {
          status: input.status,
          sections: Object.keys(input).filter(
            (key) =>
              !["taxpayerRestricted", "paymentRestricted"].includes(key)
          ),
          restrictedSectionsUpdated: {
            taxpayer: Boolean(input.taxpayerRestricted),
            payment: Boolean(input.paymentRestricted),
          },
        }
      );

      return { success: true, profileId: profile.id };
    }),

  verifyField: protectedProcedure
    .input(
      z.object({
        profileId: z.number().int().positive(),
        verification: samFieldVerificationSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { wsId: workspaceId } = await enforcePermission(
        ctx.user.id,
        "write"
      );
      await verifySamRegistrationField(
        workspaceId,
        input.profileId,
        ctx.user.id,
        input.verification
      );

      await logAudit(
        workspaceId,
        ctx.user.id,
        "update",
        "sam_field_verification",
        input.profileId,
        {
          sectionKey: input.verification.sectionKey,
          fieldKey: input.verification.fieldKey,
          isComplete: input.verification.isComplete,
          sensitivity: input.verification.sensitivity,
        }
      );

      return { success: true };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        profileId: z.number().int().positive(),
        status: samStatusSchema,
        confirmationReference: z.string().trim().max(255).optional(),
        notes: z.string().trim().max(2000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { wsId: workspaceId } = await enforcePermission(
        ctx.user.id,
        "write"
      );
      await recordSamRegistrationStatus(
        workspaceId,
        input.profileId,
        ctx.user.id,
        input.status,
        {
          confirmationReference: input.confirmationReference,
          notes: input.notes,
        }
      );

      await logAudit(
        workspaceId,
        ctx.user.id,
        "update",
        "sam_registration_status",
        input.profileId,
        { status: input.status }
      );

      return { success: true };
    }),

  history: protectedProcedure
    .input(z.object({ profileId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      return listSamRegistrationHistory(workspaceId, input.profileId);
    }),
});
