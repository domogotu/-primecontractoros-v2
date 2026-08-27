import { AlertTriangle, CalendarClock, CheckCircle2, Shield } from "lucide-react";
import {
  calculateSamReadiness,
  type SamRegistrationSnapshot,
} from "@shared/samRegistration";

interface SamRenewalReadinessCardProps {
  snapshot: SamRegistrationSnapshot;
  now?: Date;
  onReview?: () => void;
}

export default function SamRenewalReadinessCard({
  snapshot,
  now,
  onReview,
}: SamRenewalReadinessCardProps) {
  const readiness = calculateSamReadiness(snapshot, { now });
  const issueCount =
    readiness.missing.length +
    readiness.stale.length +
    readiness.expired.length +
    readiness.protectedUnverified.length;
  const healthy = issueCount === 0 && !readiness.startRenewal;

  return (
    <section
      aria-labelledby="sam-renewal-readiness-title"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" aria-hidden="true" />
            <h2
              id="sam-renewal-readiness-title"
              className="font-semibold text-slate-900"
            >
              SAM Renewal Readiness
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Keep registration information verified throughout the year.
          </p>
        </div>
        <div
          className="rounded-lg bg-slate-50 px-4 py-2 text-center"
          aria-label={`${readiness.score} percent ready`}
        >
          <div className="text-2xl font-bold text-slate-900">
            {readiness.score}%
          </div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Ready
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <StatusItem
          icon={CalendarClock}
          label="Expiration"
          value={
            readiness.daysUntilExpiration === null
              ? "Date needed"
              : readiness.daysUntilExpiration < 0
                ? "Expired"
                : `${readiness.daysUntilExpiration} days`
          }
          warning={
            readiness.daysUntilExpiration === null ||
            readiness.daysUntilExpiration <= 60
          }
        />
        <StatusItem
          icon={AlertTriangle}
          label="Items to review"
          value={String(issueCount)}
          warning={issueCount > 0}
        />
        <StatusItem
          icon={healthy ? CheckCircle2 : AlertTriangle}
          label="Renewal action"
          value={readiness.startRenewal ? "Start or continue" : "Maintain"}
          warning={readiness.startRenewal}
        />
      </div>

      {issueCount > 0 && (
        <div
          className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          role="status"
        >
          {readiness.missing.length} missing, {readiness.stale.length} stale,{" "}
          {readiness.expired.length} expired, and{" "}
          {readiness.protectedUnverified.length} protected fields need review.
        </div>
      )}

      {onReview && (
        <button
          type="button"
          onClick={onReview}
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Review SAM profile
        </button>
      )}
    </section>
  );
}

function StatusItem({
  icon: Icon,
  label,
  value,
  warning,
}: {
  icon: typeof Shield;
  label: string;
  value: string;
  warning: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-100 p-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        <Icon
          className={warning ? "h-4 w-4 text-amber-600" : "h-4 w-4 text-green-600"}
          aria-hidden="true"
        />
        {label}
      </div>
      <div className="mt-1 font-semibold text-slate-900">{value}</div>
    </div>
  );
}
