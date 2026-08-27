import { describe, expect, it } from "vitest";
import {
  assertNoFullIdentifiers,
  paymentRestrictedSchema,
  taxpayerRestrictedSchema,
} from "./samRegistrationSchemas";

describe("SAM restricted data contracts", () => {
  it("accepts masked last-four tax and payment data", () => {
    expect(
      taxpayerRestrictedSchema.parse({
        tinType: "ein",
        tinLastFour: "2655",
      })
    ).toMatchObject({ tinLastFour: "2655" });

    expect(
      paymentRestrictedSchema.parse({
        accountType: "checking",
        routingLastFour: "0050",
        accountLastFour: "0081",
      })
    ).toMatchObject({ accountLastFour: "0081" });
  });

  it("rejects full identifiers and unknown sensitive keys", () => {
    expect(() =>
      taxpayerRestrictedSchema.parse({
        tinLastFour: "123456789",
      })
    ).toThrow();

    expect(() =>
      paymentRestrictedSchema.parse({
        accountNumber: "123456789",
      })
    ).toThrow();

    expect(() =>
      assertNoFullIdentifiers({
        payment: { routingNumber: "021000021" },
      })
    ).toThrow(/not permitted/);
  });
});
