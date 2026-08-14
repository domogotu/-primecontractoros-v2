import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  Landmark,
  ListChecks,
  MapPinned,
  ShieldCheck,
  Users,
} from "lucide-react";
import SamRenewalReadinessCard from "./SamRenewalReadinessCard";
import type {
  SamRegistrationSnapshot,
  SamSectionKey,
} from "@shared/samRegistration";

type DraftValues = Record<string, string | boolean>;

interface SamRegistrationWorkspaceProps {
  initialStatus?: SamRegistrationSnapshot["status"];
  expirationDate?: string | Date | null;
  initialValues?: DraftValues;
}

interface Field {
  key: string;
  label: string;
  type?: "text" | "date" | "number" | "boolean" | "select";
  options?: string[];
  required?: boolean;
  restricted?: boolean;
  help?: string;
}

interface Section {
  key: SamSectionKey;
  title: string;
  description: string;
  icon: typeof Building2;
  fields: Field[];
}

const SECTIONS: Section[] = [
  {
    key: "entity_identity",
    title: "Entity identity and formation",
    description: "Legal identity, addresses, formation, and fiscal year information.",
    icon: Building2,
    fields: [
      { key: "legalName", label: "Legal business name", required: true },
      { key: "dba", label: "Doing business as" },
      { key: "website", label: "Website" },
      { key: "divisionName", label: "Division name" },
      { key: "divisionNumber", label: "Division number" },
      { key: "physicalAddress", label: "Physical address", required: true },
      { key: "mailingSameAsPhysical", label: "Mailing address is the same", type: "boolean" },
      { key: "mailingAddress", label: "Mailing address" },
      { key: "formationDate", label: "Formation/start date", type: "date", required: true },
      { key: "fiscalYearEnd", label: "Fiscal year end", required: true, help: "Enter month and day, such as December 31." },
      { key: "entityStructure", label: "Entity structure", type: "select", options: ["Corporate Entity, Not Tax Exempt", "Corporate Entity, Tax Exempt", "Partnership or LLP", "Sole Proprietorship", "Other"], required: true },
      { key: "profitStructure", label: "Profit structure", type: "select", options: ["For Profit Organization", "Non-Profit Organization", "Other Not For Profit"], required: true },
      { key: "organizationFactor", label: "Organization factor", type: "select", options: ["Limited Liability Company", "Subchapter S Corporation", "Foreign Owned", "Small Agricultural Cooperative", "Not Applicable"], required: true },
      { key: "manufacturer", label: "Manufacturer of goods", type: "boolean" },
    ],
  },
  {
    key: "taxpayer",
    title: "Taxpayer information",
    description: "Restricted IRS matching information. Only the last four TIN digits are entered here.",
    icon: ShieldCheck,
    fields: [
      { key: "tinType", label: "TIN type", type: "select", options: ["EIN", "SSN", "Other"], required: true, restricted: true },
      { key: "tinLastFour", label: "TIN last four", required: true, restricted: true, help: "Never enter the full EIN, SSN, or TIN." },
      { key: "taxpayerName", label: "Taxpayer name", required: true, restricted: true },
      { key: "taxpayerAddress", label: "Taxpayer address", required: true, restricted: true },
      { key: "taxReturnYear", label: "Most recent tax return year", type: "number", required: true },
      { key: "hasCommonParent", label: "Owned by a common parent", type: "boolean" },
      { key: "consentSigner", label: "IRS consent signer", required: true, restricted: true },
      { key: "consentSignerTitle", label: "Consent signer title", required: true },
      { key: "consentDate", label: "Consent date", type: "date" },
    ],
  },
  {
    key: "business_types",
    title: "Business and socioeconomic types",
    description: "Legal classifications, ownership representations, and certifications.",
    icon: FileCheck2,
    fields: [
      { key: "minorityOwned", label: "Minority-owned business", type: "boolean" },
      { key: "blackAmericanOwned", label: "Black American-owned", type: "boolean" },
      { key: "womanOwned", label: "Woman-owned business", type: "boolean" },
      { key: "veteranOwned", label: "Veteran-owned business", type: "boolean" },
      { key: "hubZone", label: "HUBZone", type: "boolean" },
      { key: "smallBusinessJointVenture", label: "Small-business joint venture", type: "boolean", help: "Select only when the registered entity is actually a joint venture." },
      { key: "disadvantagedBusinessEnterprise", label: "DOT Disadvantaged Business Enterprise", type: "boolean" },
      { key: "smallDisadvantagedBusiness", label: "Small Disadvantaged Business representation", type: "boolean", help: "This is an attestation with ownership, control, citizenship, and economic-disadvantage requirements." },
      { key: "sdbAttestationDate", label: "SDB attestation date", type: "date" },
    ],
  },
  {
    key: "entity_relationships",
    title: "Ownership and relationships",
    description: "Immediate owners, highest-level owners, predecessors, and corporate relationships.",
    icon: Landmark,
    fields: [
      { key: "ownedByAnotherEntity", label: "Another entity owns or controls this entity", type: "boolean", required: true },
      { key: "immediateOwner", label: "Immediate owner" },
      { key: "highestLevelOwner", label: "Highest-level owner" },
      { key: "hasPredecessor", label: "Successor to a predecessor federal award holder", type: "boolean", required: true },
      { key: "predecessorDetails", label: "Predecessor details" },
      { key: "invertedDomesticCorporation", label: "Inverted domestic corporation", type: "boolean", required: true },
    ],
  },
  {
    key: "payment",
    title: "Payment and EFT profile",
    description: "Highly restricted payment metadata. Full routing and account numbers are prohibited.",
    icon: CircleDollarSign,
    fields: [
      { key: "bankName", label: "Financial institution", restricted: true },
      { key: "accountType", label: "Account type", type: "select", options: ["Checking", "Savings", "Other"], restricted: true },
      { key: "routingLastFour", label: "Routing number last four", restricted: true, help: "Do not enter the complete routing number." },
      { key: "accountLastFour", label: "Account number last four", restricted: true, help: "Do not enter the complete account number." },
      { key: "paymentAddress", label: "Payment address", restricted: true },
      { key: "bankVerifiedAt", label: "Verified against bank document", type: "date", restricted: true },
      { key: "acceptsCreditCards", label: "Accepts credit cards", type: "boolean" },
    ],
  },
  {
    key: "legal",
    title: "Legal representations",
    description: "Proceedings, tax liability, exclusions, and termination representations.",
    icon: ListChecks,
    fields: [
      { key: "awardProceedings", label: "Reportable award-related proceedings", type: "boolean", required: true },
      { key: "otherProceedings", label: "Other reportable proceedings", type: "boolean", required: true },
      { key: "taxLiability", label: "Federal tax liability or delinquency", type: "boolean", required: true },
      { key: "exclusions", label: "Suspension, debarment, or ineligibility", type: "boolean", required: true },
      { key: "terminations", label: "Recent termination for cause/default", type: "boolean", required: true },
      { key: "legalExplanation", label: "Explanation or evidence reference", help: "Complete when any answer above is Yes." },
    ],
  },
  {
    key: "goods_services_size",
    title: "Goods, services, and business size",
    description: "NAICS, PSC, employees, receipts, and size-calculation support.",
    icon: FileCheck2,
    fields: [
      { key: "primaryNaics", label: "Primary NAICS", required: true },
      { key: "additionalNaics", label: "Additional NAICS codes", help: "Separate codes with commas." },
      { key: "naicsExceptions", label: "Applicable NAICS exceptions" },
      { key: "pscCodes", label: "Product Service Codes", help: "Separate codes with commas." },
      { key: "employeesWorldwide", label: "Employees worldwide", type: "number", required: true },
      { key: "employeesLocation", label: "Employees at this location", type: "number" },
      { key: "annualReceiptsWorldwide", label: "Average annual receipts worldwide", type: "number", required: true },
      { key: "annualReceiptsLocation", label: "Annual receipts at this location", type: "number" },
      { key: "sizeCalculationPeriod", label: "Calculation period and source", required: true },
    ],
  },
  {
    key: "business_operations",
    title: "Business operations",
    description: "Clearances, EDI, disaster response, bonding, and service geography.",
    icon: MapPinned,
    fields: [
      { key: "facilityClearance", label: "Facility security clearance", type: "select", options: ["None", "Confidential", "Secret", "Top Secret"] },
      { key: "employeeClearance", label: "Highest employee clearance", type: "select", options: ["None", "Confidential", "Secret", "Top Secret"] },
      { key: "usesEdi", label: "Uses Electronic Data Interchange", type: "boolean" },
      { key: "disasterRegistry", label: "Disaster Response Registry", type: "boolean" },
      { key: "requiresBonding", label: "Requires bonding to bid", type: "boolean" },
      { key: "bondingCapacity", label: "Verified bonding capacity" },
      { key: "geographicScope", label: "Geographic scope", type: "select", options: ["All United States", "One State", "Multiple States"], required: true },
      { key: "statesServed", label: "States served", required: true },
      { key: "countiesMsas", label: "Counties or MSAs" },
    ],
  },
  {
    key: "points_of_contact",
    title: "Points of contact",
    description: "Government, electronic business, accounts receivable, and optional alternates.",
    icon: Users,
    fields: [
      { key: "governmentBusinessPoc", label: "Government Business POC", required: true },
      { key: "electronicBusinessPoc", label: "Electronic Business POC", required: true },
      { key: "accountsReceivablePoc", label: "Accounts Receivable POC", required: true },
      { key: "pastPerformancePoc", label: "Past Performance POC" },
      { key: "governmentBusinessAlternate", label: "Government Business alternate" },
      { key: "electronicBusinessAlternate", label: "Electronic Business alternate" },
      { key: "pastPerformanceAlternate", label: "Past Performance alternate" },
      { key: "pocVerifiedAt", label: "POCs last verified", type: "date", required: true },
    ],
  },
  {
    key: "federal_assistance",
    title: "Federal assistance and lifecycle",
    description: "Financial-assistance intent and SAM registration dates/status.",
    icon: ShieldCheck,
    fields: [
      { key: "federalAssistance", label: "Applying for or receiving federal financial assistance", type: "boolean", required: true },
      { key: "uei", label: "Unique Entity ID", required: true },
      { key: "cageCode", label: "CAGE code", required: true },
      { key: "samStatus", label: "SAM registration status", type: "select", options: ["Draft", "Submitted", "Processing", "Active", "Action Required", "Expired"], required: true },
      { key: "samSubmittedAt", label: "Submitted date", type: "date" },
      { key: "samActivatedAt", label: "Activation date", type: "date" },
      { key: "samExpirationDate", label: "Expiration date", type: "date", required: true },
      { key: "confirmationReference", label: "Confirmation reference" },
    ],
  },
];

export default function SamRegistrationWorkspace({
  initialStatus = "draft",
  expirationDate,
  initialValues = {},
}: SamRegistrationWorkspaceProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [values, setValues] = useState<DraftValues>(initialValues);
  const [reviewedSections, setReviewedSections] = useState<Set<SamSectionKey>>(
    new Set()
  );
  const active = SECTIONS[activeIndex];

  const snapshot = useMemo<SamRegistrationSnapshot>(
    () => ({
      status: initialStatus,
      expirationDate,
      fields: SECTIONS.flatMap((section) =>
        section.fields.map((field) => ({
          fieldKey: field.key,
          sectionKey: section.key,
          required: Boolean(field.required),
          complete:
            typeof values[field.key] === "boolean"
              ? true
              : String(values[field.key] ?? "").trim().length > 0,
          sensitivity: field.restricted
            ? section.key === "payment"
              ? "highly_restricted"
              : "restricted"
            : "standard",
          verifiedAt: reviewedSections.has(section.key) ? new Date() : null,
        }))
      ),
    }),
    [expirationDate, initialStatus, reviewedSections, values]
  );

  const completedFor = (section: Section) =>
    section.fields.filter((field) => {
      const value = values[field.key];
      return typeof value === "boolean" || String(value ?? "").trim().length > 0;
    }).length;

  const markReviewed = () => {
    setReviewedSections((current) => new Set([...current, active.key]));
  };

  return (
    <div className="space-y-5">
      <SamRenewalReadinessCard
        snapshot={snapshot}
        onReview={() => setActiveIndex(0)}
      />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">SAM Registration Profile</h2>
          <p className="mt-1 text-sm text-slate-600">
            Interface preview. Entries remain in this page until the protected
            data connection is completed in the final integration step.
          </p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr]">
          <nav
            aria-label="SAM registration sections"
            className="border-b border-slate-200 bg-slate-50 p-3 lg:border-b-0 lg:border-r"
          >
            <ol className="space-y-1">
              {SECTIONS.map((section, index) => {
                const Icon = section.icon;
                const reviewed = reviewedSections.has(section.key);
                return (
                  <li key={section.key}>
                    <button
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        activeIndex === index
                          ? "bg-blue-600 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {index + 1}. {section.title}
                        </span>
                        <span
                          className={`block text-xs ${
                            activeIndex === index
                              ? "text-blue-100"
                              : "text-slate-500"
                          }`}
                        >
                          {completedFor(section)}/{section.fields.length} entered
                        </span>
                      </span>
                      {reviewed && (
                        <CheckCircle2 className="h-4 w-4 shrink-0" aria-label="Reviewed" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="p-5 md:p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Section {activeIndex + 1} of {SECTIONS.length}
              </p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">
                {active.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{active.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {active.fields.map((field) => (
                <SamDraftField
                  key={field.key}
                  field={field}
                  value={values[field.key]}
                  onChange={(value) =>
                    setValues((current) => ({ ...current, [field.key]: value }))
                  }
                />
              ))}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                disabled={activeIndex === 0}
                onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={markReviewed}
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark section reviewed
                </button>
                <button
                  type="button"
                  disabled={activeIndex === SECTIONS.length - 1}
                  onClick={() =>
                    setActiveIndex((index) =>
                      Math.min(SECTIONS.length - 1, index + 1)
                    )
                  }
                  className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SamDraftField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string | boolean | undefined;
  onChange: (value: string | boolean) => void;
}) {
  const id = `sam-${field.key}`;

  if (field.type === "boolean") {
    return (
      <label
        htmlFor={id}
        className="flex min-h-16 items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3"
      >
        <span>
          <span className="block text-sm font-medium text-slate-800">
            {field.label}
          </span>
          {field.help && (
            <span className="mt-1 block text-xs text-slate-500">{field.help}</span>
          )}
        </span>
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-blue-600"
        />
      </label>
    );
  }

  const common =
    "mt-1 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-800">
        {field.label}
        {field.required && <span className="ml-1 text-red-600">*</span>}
        {field.restricted && (
          <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
            Restricted
          </span>
        )}
      </label>

      {field.type === "select" ? (
        <select
          id={id}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          className={common}
        >
          <option value="">Select an option</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={field.type ?? "text"}
          value={String(value ?? "")}
          onChange={(event) => {
            let next = event.target.value;
            if (
              ["tinLastFour", "routingLastFour", "accountLastFour"].includes(
                field.key
              )
            ) {
              next = next.replace(/\D/g, "").slice(0, 4);
            }
            onChange(next);
          }}
          inputMode={
            ["tinLastFour", "routingLastFour", "accountLastFour"].includes(
              field.key
            )
              ? "numeric"
              : undefined
          }
          maxLength={
            ["tinLastFour", "routingLastFour", "accountLastFour"].includes(
              field.key
            )
              ? 4
              : undefined
          }
          className={common}
        />
      )}
      {field.help && <p className="mt-1 text-xs text-slate-500">{field.help}</p>}
    </div>
  );
}
