import { z } from "zod";
import { SAM_SECTION_KEYS } from "./samRegistration";

const nullableText = z.string().trim().max(500).nullable().optional();
const dateText = z.string().date().nullable().optional();

export const samStatusSchema = z.enum([
  "draft",
  "submitted",
  "processing",
  "active",
  "action_required",
  "expired",
]);

export const entityIdentitySchema = z.object({
  legalName: z.string().trim().min(1).max(255),
  dba: nullableText,
  website: z.string().url().nullable().optional(),
  divisionName: nullableText,
  divisionNumber: nullableText,
  physicalAddress: z.string().trim().min(1).max(1000),
  mailingAddress: z.string().trim().min(1).max(1000),
  mailingSameAsPhysical: z.boolean().default(false),
  formationDate: dateText,
  fiscalYearEndMonth: z.number().int().min(1).max(12).nullable().optional(),
  fiscalYearEndDay: z.number().int().min(1).max(31).nullable().optional(),
  countryOfIncorporation: nullableText,
  stateOfIncorporation: nullableText,
  entityStructure: nullableText,
  profitStructure: nullableText,
  organizationFactor: nullableText,
  institutionType: nullableText,
  manufacturerOfGoods: z.boolean().nullable().optional(),
});

export const taxpayerRestrictedSchema = z
  .object({
    tinType: z.enum(["ein", "ssn", "other"]).nullable().optional(),
    tinLastFour: z.string().regex(/^\d{4}$/).nullable().optional(),
    taxpayerName: nullableText,
    taxpayerAddress: z.string().trim().max(1000).nullable().optional(),
    mostRecentTaxReturnYear: z.number().int().min(1900).max(2200).nullable().optional(),
    hasCommonParent: z.boolean().nullable().optional(),
    commonParentName: nullableText,
    consentSignerName: nullableText,
    consentSignerTitle: nullableText,
    consentDate: dateText,
  })
  .strict();

export const paymentRestrictedSchema = z
  .object({
    bankName: nullableText,
    accountType: z.enum(["checking", "savings", "other"]).nullable().optional(),
    routingLastFour: z.string().regex(/^\d{4}$/).nullable().optional(),
    accountLastFour: z.string().regex(/^\d{4}$/).nullable().optional(),
    vaultReference: z.string().trim().max(255).nullable().optional(),
    bankContact: nullableText,
    paymentAddress: z.string().trim().max(1000).nullable().optional(),
    verifiedAt: dateText,
    verifiedBy: z.number().int().positive().nullable().optional(),
  })
  .strict();

export const samRegistrationUpdateSchema = z
  .object({
    status: samStatusSchema.optional(),
    uei: z.string().trim().max(32).nullable().optional(),
    cageCode: z.string().trim().max(16).nullable().optional(),
    entityIdentity: entityIdentitySchema.partial().optional(),
    taxpayerRestricted: taxpayerRestrictedSchema.partial().optional(),
    businessTypes: z.record(z.string(), z.unknown()).optional(),
    entityRelationships: z.record(z.string(), z.unknown()).optional(),
    paymentRestricted: paymentRestrictedSchema.partial().optional(),
    legalRepresentations: z.record(z.string(), z.unknown()).optional(),
    goodsServicesSize: z.record(z.string(), z.unknown()).optional(),
    businessOperations: z.record(z.string(), z.unknown()).optional(),
    pointsOfContact: z.array(z.record(z.string(), z.unknown())).optional(),
    federalAssistance: z.record(z.string(), z.unknown()).optional(),
    submittedAt: z.coerce.date().nullable().optional(),
    activatedAt: z.coerce.date().nullable().optional(),
    expirationDate: z.coerce.date().nullable().optional(),
  })
  .strict();

export const samFieldVerificationSchema = z
  .object({
    sectionKey: z.enum(SAM_SECTION_KEYS),
    fieldKey: z.string().trim().min(1).max(128),
    sensitivity: z
      .enum(["standard", "restricted", "highly_restricted"])
      .default("standard"),
    isComplete: z.boolean(),
    source: z.string().trim().max(255).nullable().optional(),
    verifiedAt: z.coerce.date().nullable().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
  })
  .strict();

export function assertNoFullIdentifiers(value: unknown): void {
  const serialized = JSON.stringify(value);
  const parsed = value as Record<string, unknown> | null;
  if (!parsed || typeof parsed !== "object") return;

  const forbiddenKeys = [
    "tin",
    "ein",
    "ssn",
    "routingNumber",
    "accountNumber",
    "taxpayerIdentificationNumber",
  ];

  const visit = (input: unknown, path: string[] = []) => {
    if (!input || typeof input !== "object") return;
    for (const [key, child] of Object.entries(input as Record<string, unknown>)) {
      if (
        forbiddenKeys.some(
          (forbidden) => forbidden.toLowerCase() === key.toLowerCase()
        )
      ) {
        throw new Error(
          `Full sensitive identifier is not permitted in SAM profile data: ${[
            ...path,
            key,
          ].join(".")}`
        );
      }
      visit(child, [...path, key]);
    }
  };

  visit(parsed);
  void serialized;
}
