import { describe, expect, it } from "vitest";
import { samRegistrationUpdateSchema } from "../shared/samRegistrationSchemas";

describe("SAM service input boundary", () => {
  it("does not accept workspaceId from client input", () => {
    expect(() =>
      samRegistrationUpdateSchema.parse({
        workspaceId: 999,
        status: "active",
      })
    ).toThrow();
  });

  it("does not accept actor IDs from client input", () => {
    expect(() =>
      samRegistrationUpdateSchema.parse({
        verifiedBy: 999,
        status: "active",
      })
    ).toThrow();
  });
});
