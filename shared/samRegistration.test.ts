import { describe, expect, it } from "vitest";
import {
  calculateSamReadiness,
  maskLastFour,
  redactSamAuditPayload,
} from "./samRegistration";

describe("SAM registration safety helpers", () => {
  it("masks identifiers to their last four digits", () => {
    expect(maskLastFour("12-3456789")).toBe("••••6789");
    expect(maskLastFour("")).toBe("");
  });

  it("redacts tax and banking values from audit payloads", () => {
    expect(
      redactSamAuditPayload({
        legalName: "Example LLC",
        tin: "12-3456789",
        routingNumber: "021000021",
        accountNumber: "123456789",
      })
    ).toEqual({
      legalName: "Example LLC",
      tin: "[REDACTED]",
      routingNumber: "[REDACTED]",
      accountNumber: "[REDACTED]",
    });
  });
});

describe("SAM renewal readiness", () => {
  it("flags missing, stale, expired, and protected-unverified fields", () => {
    const readiness = calculateSamReadiness(
      {
        status: "active",
        expirationDate: "2026-09-01T00:00:00.000Z",
        fields: [
          {
            fieldKey: "legalName",
            sectionKey: "entity_identity",
            required: true,
            complete: true,
            verifiedAt: "2026-08-01T00:00:00.000Z",
          },
          {
            fieldKey: "tinLastFour",
            sectionKey: "taxpayer",
            required: true,
            complete: true,
            sensitivity: "restricted",
          },
          {
            fieldKey: "bankVerification",
            sectionKey: "payment",
            required: true,
            complete: false,
            sensitivity: "highly_restricted",
          },
          {
            fieldKey: "certification",
            sectionKey: "business_types",
            required: true,
            complete: true,
            verifiedAt: "2024-01-01T00:00:00.000Z",
            expiresAt: "2026-07-01T00:00:00.000Z",
          },
        ],
      },
      { now: new Date("2026-08-13T00:00:00.000Z") }
    );

    expect(readiness.daysUntilExpiration).toBe(19);
    expect(readiness.startRenewal).toBe(true);
    expect(readiness.missing.map((item) => item.fieldKey)).toContain(
      "bankVerification"
    );
    expect(readiness.stale.map((item) => item.fieldKey)).toContain(
      "certification"
    );
    expect(readiness.expired.map((item) => item.fieldKey)).toContain(
      "certification"
    );
    expect(
      readiness.protectedUnverified.map((item) => item.fieldKey)
    ).toEqual(expect.arrayContaining(["tinLastFour", "bankVerification"]));
    expect(readiness.score).toBe(25);
  });
});
