import { describe, expect, it } from "vitest";
import { resolveLessonLinkState } from "./lessonsLinkState";

describe("resolveLessonLinkState", () => {
  const existing = {
    linkedRecordType: "contract" as const,
    linkedRecordId: 42,
  };

  it("keeps the existing link when link fields are omitted", () => {
    expect(resolveLessonLinkState(existing, {})).toEqual(existing);
  });

  it("relinks when a complete replacement is provided", () => {
    expect(
      resolveLessonLinkState(existing, {
        linkedRecordType: "proposal",
        linkedRecordId: 7,
      }),
    ).toEqual({ linkedRecordType: "proposal", linkedRecordId: 7 });
  });

  it("clears an existing link when both fields are explicitly null", () => {
    expect(
      resolveLessonLinkState(existing, {
        linkedRecordType: null,
        linkedRecordId: null,
      }),
    ).toEqual({ linkedRecordType: null, linkedRecordId: null });
  });

  it("rejects a partial clear that would leave a mismatched link", () => {
    expect(() =>
      resolveLessonLinkState(existing, { linkedRecordType: null }),
    ).toThrow(
      "Linked record type and linked record ID must be provided or cleared together.",
    );
  });
});
