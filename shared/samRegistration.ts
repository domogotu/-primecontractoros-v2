export const SAM_REMINDER_DAYS = [120, 90, 60, 30, 14, 7] as const;

export const SAM_SECTION_KEYS = [
  "entity_identity",
  "taxpayer",
  "business_types",
  "entity_relationships",
  "payment",
  "legal",
  "goods_services_size",
  "business_operations",
  "points_of_contact",
  "federal_assistance",
] as const;

export type SamSectionKey = (typeof SAM_SECTION_KEYS)[number];
export type SamRegistrationStatus =
  | "draft"
  | "submitted"
  | "processing"
  | "active"
  | "action_required"
  | "expired";

export type SamFieldSensitivity = "standard" | "restricted" | "highly_restricted";

export interface SamFieldVerification {
  fieldKey: string;
  sectionKey: SamSectionKey;
  verifiedAt?: string | Date | null;
  expiresAt?: string | Date | null;
  source?: string | null;
  sensitivity?: SamFieldSensitivity;
  required?: boolean;
  complete?: boolean;
}

export interface SamRegistrationSnapshot {
  status: SamRegistrationStatus;
  expirationDate?: string | Date | null;
  submittedAt?: string | Date | null;
  activatedAt?: string | Date | null;
  fields: SamFieldVerification[];
}

export interface SamReadinessItem {
  fieldKey: string;
  sectionKey: SamSectionKey;
  reason: "missing" | "stale" | "expired" | "protected_unverified";
}

export interface SamReadiness {
  score: number;
  daysUntilExpiration: number | null;
  startRenewal: boolean;
  nextReminderDay: number | null;
  missing: SamReadinessItem[];
  stale: SamReadinessItem[];
  expired: SamReadinessItem[];
  protectedUnverified: SamReadinessItem[];
}

const MS_PER_DAY = 86_400_000;

function toDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function maskLastFour(value?: string | null): string {
  if (!value) return "";
  const normalized = value.replace(/\D/g, "");
  if (!normalized) return "";
  return `••••${normalized.slice(-4)}`;
}

export function redactSamAuditPayload(
  payload: Record<string, unknown>
): Record<string, unknown> {
  const forbidden = /(tin|ein|ssn|routing|account.?number|taxpayer.?id|banking.?info)/i;
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      forbidden.test(key) ? "[REDACTED]" : value,
    ])
  );
}

export function calculateSamReadiness(
  snapshot: SamRegistrationSnapshot,
  options: { now?: Date; staleAfterDays?: number } = {}
): SamReadiness {
  const now = options.now ?? new Date();
  const staleAfterDays = options.staleAfterDays ?? 365;
  const expiration = toDate(snapshot.expirationDate);
  const daysUntilExpiration = expiration ? daysBetween(now, expiration) : null;

  const missing: SamReadinessItem[] = [];
  const stale: SamReadinessItem[] = [];
  const expired: SamReadinessItem[] = [];
  const protectedUnverified: SamReadinessItem[] = [];

  for (const field of snapshot.fields) {
    const base = { fieldKey: field.fieldKey, sectionKey: field.sectionKey };
    const verifiedAt = toDate(field.verifiedAt);
    const expiresAt = toDate(field.expiresAt);
    const protectedField =
      field.sensitivity === "restricted" ||
      field.sensitivity === "highly_restricted";

    if (field.required && !field.complete) {
      missing.push({ ...base, reason: "missing" });
    }
    if (expiresAt && expiresAt.getTime() < now.getTime()) {
      expired.push({ ...base, reason: "expired" });
    }
    if (
      field.complete &&
      verifiedAt &&
      daysBetween(verifiedAt, now) > staleAfterDays
    ) {
      stale.push({ ...base, reason: "stale" });
    }
    if (protectedField && (!field.complete || !verifiedAt)) {
      protectedUnverified.push({ ...base, reason: "protected_unverified" });
    }
  }

  const required = snapshot.fields.filter((field) => field.required);
  const deductions = new Set([
    ...missing.map((item) => item.fieldKey),
    ...stale.map((item) => item.fieldKey),
    ...expired.map((item) => item.fieldKey),
    ...protectedUnverified.map((item) => item.fieldKey),
  ]);
  const score =
    required.length === 0
      ? 100
      : Math.max(
          0,
          Math.round(
            ((required.length -
              required.filter((field) => deductions.has(field.fieldKey)).length) /
              required.length) *
              100
          )
        );

  const nextReminderDay =
    daysUntilExpiration === null
      ? null
      : SAM_REMINDER_DAYS.find((day) => daysUntilExpiration >= day) ?? null;

  return {
    score,
    daysUntilExpiration,
    startRenewal:
      snapshot.status !== "active" ||
      daysUntilExpiration === null ||
      daysUntilExpiration <= 60,
    nextReminderDay,
    missing,
    stale,
    expired,
    protectedUnverified,
  };
}
