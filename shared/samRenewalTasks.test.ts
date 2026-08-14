import { describe, expect, it } from "vitest";
import {
  buildSamRenewalTaskCandidates,
  selectNewSamRenewalTasks,
} from "./samRenewalTasks";

describe("SAM renewal task generation", () => {
  it("creates future checkpoints with stable idempotency keys", () => {
    const tasks = buildSamRenewalTaskCandidates(
      new Date("2027-09-01T00:00:00.000Z"),
      new Date("2027-04-01T00:00:00.000Z")
    );

    expect(tasks.map((task) => task.reminderDay)).toEqual([
      120, 90, 60, 30, 14, 7,
    ]);
    expect(tasks.find((task) => task.reminderDay === 60)?.title).toBe(
      "Start SAM.gov entity renewal"
    );
    expect(tasks[0].key).toBe("sam-renewal-2027-09-01-120");
  });

  it("does not recreate tasks that already exist", () => {
    const tasks = buildSamRenewalTaskCandidates(
      new Date("2027-09-01T00:00:00.000Z"),
      new Date("2027-04-01T00:00:00.000Z")
    );
    const pending = selectNewSamRenewalTasks(tasks, [
      "sam-renewal-2027-09-01-120",
      "sam-renewal-2027-09-01-60",
    ]);

    expect(pending.map((task) => task.reminderDay)).toEqual([90, 30, 14, 7]);
  });
});
