// app/portal/_model.ts
export type RecordType = "lab" | "imaging" | "visit" | "prescription" | "document";
export type RecordStatus = "Ready" | "Processing" | "Flagged" | "Synced";

export type PatientProfile = {
  fullName: string;
  patientId: string;
  email: string;
  phone: string;

  eligibilityScore: number; // 0-999
  careflexLimit: number; // GBP
  careflexTermsDays: number;
};

export type HospitalRecord = {
  id: string;
  type: RecordType;
  title: string;
  subtitle?: string;
  facility: string;
  clinician: string;
  dateISO: string;
  status: RecordStatus;
  summary: string;
  notes?: string[];
  tags?: string[];
};

export type Appointment = {
  id: string;
  dept: string;
  clinician: string;
  facility: string;
  startISO: string;
  status: "Confirmed" | "Completed" | "Cancelled";
  prepChecklist: string[];
};

export type Invoice = {
  id: string;
  title: string;
  amount: number;
  status: "Unpaid" | "Pending approval" | "Paid" | "Overdue" | "Waived";
  createdISO: string;
  dueISO: string;

  // Optional clinical / billing context fields
  ailment?: string;
  diagnosis?: string;
  notes?: string;

  // CareFlex repayment fields
  currency?: string; // default: GBP
  covered?: number;
  balanceDue?: number;
};

export const LOCALE = "en-GB";
export const TIMEZONE = "Europe/London";

export function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// Pre-create formatters (faster than recreating each render)
const moneyFmt = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const moneyFmtGBP = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "short",
  day: "2-digit",
});

const timeFmt = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// fmtMoneyGBP is the primary formatter
export function fmtMoneyGBP(n: number) {
  return moneyFmt.format(Number.isFinite(n) ? n : 0);
}

export function fmtMoneyEUR(n: number) {
  return moneyFmtGBP.format(Number.isFinite(n) ? n : 0);
}

export function fmtMoney(n: number, currency: string) {
  const c = String(currency || "").toUpperCase();
  if (c === "GBP" || c === "EUR") return fmtMoneyEUR(n);
  // default to GBP for this project
  return fmtMoneyEUR(n);
}

export function fmtDate(iso: string) {
  return dateFmt.format(new Date(iso));
}

export function fmtTime(iso: string) {
  return timeFmt.format(new Date(iso));
}

export function daysBetween(aISO: string, bISO: string) {
  const a = new Date(aISO).getTime();
  const b = new Date(bISO).getTime();
  return Math.ceil((b - a) / (1000 * 60 * 60 * 24));
}

export function pillForRecord(type: RecordType) {
  if (type === "lab") return "Lab";
  if (type === "imaging") return "Imaging";
  if (type === "visit") return "Visit note";
  if (type === "prescription") return "Prescription";
  return "Document";
}

export function toneForStatus(
  status: RecordStatus | Invoice["status"] | Appointment["status"]
) {
  switch (status) {
    case "Ready":
    case "Paid":
    case "Completed":
    case "Synced":
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    case "Processing":
    case "Pending approval":
    case "Confirmed":
      return "bg-amber-50 text-amber-700 ring-amber-100";
    case "Flagged":
    case "Overdue":
    case "Cancelled":
      return "bg-rose-50 text-rose-700 ring-rose-100";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}
