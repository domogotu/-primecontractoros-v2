import { SAM_REMINDER_DAYS } from "./samRegistration";

export interface RenewalTaskCandidate {
  key: string;
  title: string;
  dueDate: Date;
  reminderDay: number;
}

const DAY_MS = 86_400_000;

export function buildSamRenewalTaskCandidates(
  expirationDate: Date,
  now = new Date()
): RenewalTaskCandidate[] {
  return SAM_REMINDER_DAYS.map((reminderDay) => {
    const dueDate = new Date(expirationDate.getTime() - reminderDay * DAY_MS);
    return {
      key: `sam-renewal-${expirationDate.toISOString().slice(0, 10)}-${reminderDay}`,
      title:
        reminderDay === 60
          ? "Start SAM.gov entity renewal"
          : `SAM.gov renewal checkpoint — ${reminderDay} days remaining`,
      dueDate,
      reminderDay,
    };
  }).filter((task) => task.dueDate.getTime() >= now.getTime());
}

export function selectNewSamRenewalTasks(
  candidates: RenewalTaskCandidate[],
  existingKeys: Iterable<string>
): RenewalTaskCandidate[] {
  const existing = new Set(existingKeys);
  return candidates.filter((candidate) => !existing.has(candidate.key));
}
