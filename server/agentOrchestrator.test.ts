import { describe, expect, it } from "vitest";
import { classifyAgent } from "./agentOrchestrator";

describe("Command Dock agent routing", () => {
  it("routes contract and clause intents to compliance support", () => {
    expect(classifyAgent("Review the contract clauses and flowdown requirements")).toBe("compliance-support");
  });

  it("routes finance intents to finance support", () => {
    expect(classifyAgent("Check invoice payment readiness and cash flow")).toBe("finance-quote-support");
  });

  it("routes opportunity intents to intake/classification", () => {
    expect(classifyAgent("Review this SAM.gov opportunity for proposal readiness")).toBe("intake-classification");
  });

  it("routes missing-information intents to the missing-information agent", () => {
    expect(classifyAgent("What information is missing from this workspace setup?")).toBe("missing-information");
  });

  it("defaults general requests to customer guidance", () => {
    expect(classifyAgent("Explain what I should do next")).toBe("customer-guidance");
  });
});
