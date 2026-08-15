import { CalendarClock, Download, History } from "lucide-react";

type DraftValues = Record<string, string | boolean>;

interface SamRenewalToolsPanelProps {
  expirationDate?: string | Date | null;
  values: DraftValues;
  reviewedSectionTitles: string[];
}

const CHECKPOINT_DAYS = [90, 60, 30, 14, 7];

const RESTRICTED_KEYS = new Set([
  "tinLastFour",
  "taxpayerName",
  "taxpayerAddress",
  "consentSigner",
  "bankName",
  "accountType",
  "routingLastFour",
  "accountLastFour",
  "paymentAddress",
  "bankVerifiedAt",
]);

function asDate(value?: string | Date | null) {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value: Date) {
  return value.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function checkpointDate(expiration: Date, daysBefore: number) {
  const value = new Date(expiration);
  value.setDate(value.getDate() - daysBefore);
  return value;
}

export default function SamRenewalToolsPanel({
  expirationDate,
  values,
  reviewedSectionTitles,
}: SamRenewalToolsPanelProps) {
  const expiration = asDate(expirationDate);
  const today = new Date();

  const downloadWorksheet = () => {
    const lines = [
      "# SAM.gov Renewal Worksheet",
      "",
      `Generated: ${formatDate(today)}`,
      `Expiration: ${expiration ? formatDate(expiration) : "Not entered"}`,
      "",
      "Restricted values are intentionally excluded. Verify them directly against authoritative records before submission.",
      "",
      "## Profile fields",
      "",
    ];

    Object.keys(values)
      .sort()
      .forEach((key) => {
        const rawValue = values[key];
        const value = RESTRICTED_KEYS.has(key)
          ? "[RESTRICTED - verify separately]"
          : typeof rawValue === "boolean"
            ? rawValue
              ? "Yes"
              : "No"
            : String(rawValue || "Not entered");
        lines.push(`- ${key}: ${value}`);
      });

    lines.push("", "## Review status", "");
    if (reviewedSectionTitles.length === 0) {
      lines.push("- No sections marked reviewed.");
    } else {
      reviewedSectionTitles.forEach((title) => lines.push(`- Reviewed: ${title}`));
    }

    const blob = new Blob([lines.join("\n")], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sam-renewal-worksheet.md";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <article className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-blue-600" aria-hidden="true" />
          <h3 className="font-semibold text-slate-900">Renewal checkpoints</h3>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Planning dates are calculated locally from the current expiration date.
        </p>
        <div className="mt-4 space-y-2">
          {!expiration ? (
            <p className="text-sm text-amber-700">Enter the SAM expiration date to generate checkpoints.</p>
          ) : (
            CHECKPOINT_DAYS.map((days) => {
              const date = checkpointDate(expiration, days);
              const passed = date.getTime() < today.getTime();
              return (
                <div
                  key={days}
                  className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-slate-700">{days} days before</span>
                  <span className={passed ? "text-amber-700" : "text-slate-600"}>
                    {formatDate(date)}{passed ? " · passed" : ""}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </article>

      <article className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-600" aria-hidden="true" />
          <h3 className="font-semibold text-slate-900">Local review history</h3>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          This preview history resets when the page is refreshed.
        </p>
        <ol className="mt-4 space-y-2 text-sm">
          <li className="rounded-md bg-slate-50 px-3 py-2 text-slate-700">
            Profile review opened · {formatDate(today)}
          </li>
          {reviewedSectionTitles.length === 0 ? (
            <li className="px-3 py-2 text-slate-500">No sections marked reviewed yet.</li>
          ) : (
            reviewedSectionTitles.map((title) => (
              <li key={title} className="rounded-md bg-green-50 px-3 py-2 text-green-800">
                {title} marked reviewed
              </li>
            ))
          )}
        </ol>
      </article>

      <article className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-blue-600" aria-hidden="true" />
          <h3 className="font-semibold text-slate-900">Masked renewal worksheet</h3>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Download a working copy that excludes taxpayer and banking values.
        </p>
        <button
          type="button"
          onClick={downloadWorksheet}
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Download masked worksheet
        </button>
        <p className="mt-3 text-xs text-slate-500">
          No data is sent or permanently saved by this preview.
        </p>
      </article>
    </section>
  );
}
