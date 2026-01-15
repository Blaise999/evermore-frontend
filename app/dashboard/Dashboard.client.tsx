// app/dashboard/Dashboard.client.tsx
"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";

import type { HospitalRecord, Invoice, PatientProfile, RecordType } from "./_model";
import { cn, fmtDate, fmtMoney, fmtTime, pillForRecord, toneForStatus } from "./_model";

// ✅ canonical API wrapper (from /libs/api.ts)
import { request } from "../libs/Api";

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */

// ✅ robust body scroll lock (supports stacked modals)
let __bodyLockCount = 0;
let __prevOverflow = "";
let __prevPaddingRight = "";

function useLockBodyScroll(locked: boolean) {
  React.useEffect(() => {
    if (!locked) return;

    const body = document.body;

    if (__bodyLockCount === 0) {
      __prevOverflow = body.style.overflow;
      __prevPaddingRight = body.style.paddingRight;

      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      body.style.overflow = "hidden";
      if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    }

    __bodyLockCount += 1;

    return () => {
      __bodyLockCount = Math.max(0, __bodyLockCount - 1);
      if (__bodyLockCount === 0) {
        body.style.overflow = __prevOverflow;
        body.style.paddingRight = __prevPaddingRight;
      }
    };
  }, [locked]);
}

// ✅ proper async clipboard
async function safeCopy(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    return true;
  } catch {}

  return false;
}

// ✅ safest ISO coercion (prevents invalid dates from breaking sort)
function safeISO(v: any): string | null {
  try {
    if (!v) return null;
    if (typeof v === "object") {
      if (typeof (v as any).toISOString === "function") return (v as any).toISOString();
      if ((v as any).$date) v = (v as any).$date;
      if ((v as any).value) v = (v as any).value;
    }
    const ms = Date.parse(String(v));
    return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
  } catch {
    return null;
  }
}

// ✅ parse numbers from unknown backend shapes (strings, Decimal128, etc.)
function numFromAny(v: any): number {
  if (v == null) return NaN;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[^0-9.+-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }
  if (typeof v === "object") {
    if (typeof (v as any).$numberDecimal === "string") {
      const n = Number((v as any).$numberDecimal);
      return Number.isFinite(n) ? n : NaN;
    }
    if (typeof (v as any).value === "string" || typeof (v as any).value === "number") {
      return numFromAny((v as any).value);
    }
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

// Guard against "undefined" / "null" / empty ids getting into routes.
function isValidId(v: any): v is string {
  if (typeof v !== "string") return false;
  const s = v.trim();
  if (!s) return false;
  const bad = new Set(["undefined", "null", "nan", "[object object]"]);
  return !bad.has(s.toLowerCase());
}

function unwrap<T>(v: any): T {
  return (v && typeof v === "object" && "data" in v ? v.data : v) as T;
}

async function apiGET<T>(path: string): Promise<T> {
  const res = await request(path, { method: "GET" } as any);
  return unwrap<T>(res);
}

async function apiPOST<T>(path: string, body?: any): Promise<T> {
  // NOTE: libs/api.request() JSON-stringifies opts.body automatically if Content-Type is JSON
  const res = await request(path, { method: "POST", body } as any);
  return unwrap<T>(res);
}

/* --------------------------- */
/* CareFlex (Option A) helpers */
/* --------------------------- */

const OK_PAYMENT_STATUSES = new Set([
  "paid",
  "successful",
  "success",
  "completed",
  "approved",
  "succeeded",
  "settled",
  "processed",
]);

function isOkPaymentStatus(status: any): boolean {
  return OK_PAYMENT_STATUSES.has(String(status ?? "").toLowerCase());
}

function asAmount(v: any): number {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/[^0-9.+-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

type PaymentRow = {
  id: string;
  reference?: string | null;
  invoiceId?: string | null;
  currency?: string | null;
  amount: number;
  status: string;
  method?: string | null;
  createdISO: string;
  title?: string | null;
};

function isCareflexRepayment(p: PaymentRow): boolean {
  if (!isOkPaymentStatus(p?.status)) return false;
  if (isValidId(p?.invoiceId as any)) return false; // repayments are not tied to a single invoice
  const m = String(p?.method ?? "").toLowerCase();
  const t = String(p?.title ?? "").toLowerCase();
  return m.includes("careflex") || m.includes("repay") || t.includes("careflex") || t.includes("repay");
}

function deriveCareflexInvoices(invoices: Invoice[], payments: PaymentRow[]) {
  const now = Date.now();
  const totalsById = new Map<string, number>();
  const createdMsById = new Map<string, number>();
  const dueMsById = new Map<string, number>();

  for (const inv of invoices) {
    totalsById.set(inv.id, inv.status === "Waived" ? 0 : asAmount((inv as any).amount));
    const cm = new Date((inv as any).createdISO).getTime();
    const dm = new Date((inv as any).dueISO).getTime();
    createdMsById.set(inv.id, Number.isFinite(cm) ? cm : 0);
    dueMsById.set(inv.id, Number.isFinite(dm) ? dm : 0);
  }

  // 1) Apply any successful invoice-linked payments first (if your backend produces them).
  const coveredById = new Map<string, number>();
  for (const p of payments || []) {
    if (!isOkPaymentStatus(p?.status)) continue;
    if (!isValidId(p?.invoiceId as any)) continue;
    const id = String(p.invoiceId);
    const total = totalsById.get(id) ?? 0;
    const cur = coveredById.get(id) ?? 0;
    const next = Math.min(total, cur + asAmount((p as any)?.amount));
    coveredById.set(id, next);
  }

  // 2) Allocate successful CareFlex repayments oldest-first behind the scenes.
  let pool = 0;
  for (const p of payments || []) {
    if (isCareflexRepayment(p)) pool += asAmount((p as any)?.amount);
  }

  const ordered = invoices
    .slice()
    .sort((a, b) => (createdMsById.get(a.id) ?? 0) - (createdMsById.get(b.id) ?? 0));

  for (const inv of ordered) {
    const total = totalsById.get(inv.id) ?? 0;
    const cur = coveredById.get(inv.id) ?? 0;
    const remaining = Math.max(0, total - cur);
    if (remaining <= 0) continue;
    if (pool <= 0) break;
    const applied = Math.min(remaining, pool);
    coveredById.set(inv.id, cur + applied);
    pool -= applied;
  }

  const derived = invoices.map((inv) => {
    const total = totalsById.get(inv.id) ?? 0;
    const covered = Math.min(total, coveredById.get(inv.id) ?? 0);
    const balanceDue = Math.max(0, total - covered);
    const dueMs = dueMsById.get(inv.id) ?? 0;

    let status: Invoice["status"] = (inv as any).status;
    if ((inv as any).status !== "Waived") {
      status = balanceDue <= 0 ? "Paid" : dueMs && dueMs < now ? "Overdue" : "Unpaid";
    }

    return {
      ...inv,
      currency: "GBP",
      covered,
      balanceDue,
      status,
    } as any as Invoice;
  });

  const owed = (derived as any[])
    .filter((x) => x.status === "Unpaid" || x.status === "Overdue")
    .reduce((s, x) => s + asAmount(x.balanceDue), 0);

  return { derivedInvoices: derived, owed };
}

/* ---------------------------------- */
/* Types                              */
/* ---------------------------------- */

/** Local appointment types (keeps TS happy without changing ./_model) */
type AppointmentStatus = "Pending approval" | "Confirmed" | "Completed" | "Cancelled";
type PaymentMethodLabel = "Linked account" | "Pay later";

type PatientAppointment = {
  id: string;
  dept: string;
  clinician: string;
  facility: string;
  startISO: string;
  status: AppointmentStatus;
  paymentMethod?: PaymentMethodLabel;
  estimatedCostGBP?: number;
  requestRef?: string | null;
};

type ApprovalSubject = {
  kind: "invoice_payment" | "appointment_booking" | "careflex_repayment";
  id: string;
  title: string;
  amount: number;
  currency?: string;
  subtitle?: string;
};

type Toast = { type: "success" | "error" | "info"; message: string } | null;

type AppointmentDraft = {
  dept: string;
  clinician: string;
  facility: string;
  startISO: string;
  notes?: string;
  estimatedCostGBP: number;
  paymentMethod: PaymentMethodLabel;
};

type InvoiceDetailsUI = {
  id: string;
  invoiceNo: string;
  status: Invoice["status"];
  currency: string;
  issuedAt: string;
  dueDate: string;
  paidAt?: string | null;

  patientName?: string | null;
  facility?: string | null;

  items: Array<{
    code?: string;
    description: string;
    qty: number;
    unitPrice: number;
    amount: number;
  }>;

  subtotal: number;
  tax: number;
  total: number;

  coveredAmount?: number;
  balanceDue?: number;
};

/* ---------------------------------- */
/* Normalizers                        */
/* ---------------------------------- */

function mapInvoiceStatusAny(s: any): Invoice["status"] {
  const v = String(s ?? "").toLowerCase();
  if (v === "paid") return "Paid";
  if (v === "void" || v === "waived") return "Waived";
  if (v === "overdue") return "Overdue";
  if (v === "pending" || v === "pending approval" || v === "pending_approval") return "Pending approval";
  return "Unpaid";
}

function normalizeInvoiceAny(inv: any): Invoice {
  const id = String(inv?._id ?? inv?.id ?? (crypto as any)?.randomUUID?.() ?? Math.random());

  // amount candidates
  const candidates = [
    inv?.total,
    inv?.grandTotal,
    inv?.grand_total,
    inv?.amountTotal,
    inv?.amount_total,
    inv?.totalAmount,
    inv?.total_amount,
    inv?.amount,
    inv?.subtotal,
    inv?.subTotal,
    inv?.sub_total,
    inv?.subtotalAmount,
    inv?.subtotal_amount,
  ];

  let amount = NaN as number;
  for (const c of candidates) {
    const n = numFromAny(c);
    if (Number.isFinite(n) && n > 0) {
      amount = n;
      break;
    }
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    const items: any[] | null = Array.isArray(inv?.items)
      ? inv.items
      : Array.isArray(inv?.lineItems)
        ? inv.lineItems
        : Array.isArray(inv?.lines)
          ? inv.lines
          : null;

    if (items && items.length) {
      const itemsTotal = items.reduce((s, it) => {
        const qtyRaw = numFromAny(it?.qty ?? it?.quantity ?? it?.count ?? 1);
        const qty = Number.isFinite(qtyRaw) && qtyRaw > 0 ? qtyRaw : 1;

        const lineRaw = numFromAny(it?.amount ?? it?.total ?? it?.lineTotal ?? it?.line_total);
        if (Number.isFinite(lineRaw) && lineRaw > 0) return s + lineRaw;

        const unitRaw = numFromAny(it?.unitPrice ?? it?.unit_price ?? it?.price ?? it?.rate);
        if (Number.isFinite(unitRaw) && unitRaw > 0) return s + unitRaw * qty;

        return s;
      }, 0);

      const taxRaw = numFromAny(inv?.tax ?? inv?.vat ?? 0);
      const tax = Number.isFinite(taxRaw) && taxRaw > 0 ? taxRaw : 0;

      const computed = itemsTotal + tax;
      if (computed > 0) amount = computed;
    }
  }

  if (!Number.isFinite(amount)) amount = 0;

  const createdISO = String(
    safeISO(inv?.createdISO ?? inv?.issuedAt ?? inv?.issued_at ?? inv?.createdAt ?? inv?.created_at) ??
      new Date().toISOString()
  );

  const dueISO = String(safeISO(inv?.dueDate ?? inv?.due_date ?? inv?.dueISO ?? inv?.dueAt ?? inv?.due_at) ?? createdISO);

  const paidMark = inv?.paid === true || !!(inv?.paidAt || inv?.paid_at || inv?.paidISO || inv?.paid_iso);
  let status = mapInvoiceStatusAny(inv?.status);
  if (paidMark) status = "Paid";

  try {
    const dueMs = new Date(dueISO).getTime();
    if ((status === "Unpaid" || status === "Pending approval") && Number.isFinite(dueMs) && dueMs < Date.now()) {
      status = "Overdue";
    }
  } catch {}

  return {
    id,
    title: String(inv?.title ?? inv?.invoiceNo ?? inv?.invoice_no ?? inv?.number ?? "Hospital invoice"),
    amount,
    status,
    createdISO,
    dueISO,
  };
}

function normalizeApptAny(a: any): PatientAppointment {
  const v = String(a?.status ?? "").toLowerCase();
  const status: PatientAppointment["status"] =
    v === "pending" || v === "pending approval" || v === "pending_approval"
      ? "Pending approval"
      : v === "completed"
        ? "Completed"
        : v === "cancelled" || v === "canceled"
          ? "Cancelled"
          : "Confirmed";

  const start = safeISO(a?.scheduledAt ?? a?.startISO ?? a?.startIso ?? a?.date) ?? new Date().toISOString();
  const estN = numFromAny(a?.estimatedCostGBP ?? a?.estimatedCost ?? a?.estimatedCostNGN);
  const estimatedCostGBP = Number.isFinite(estN) ? estN : undefined;

  return {
    id: String(a?._id ?? a?.id ?? (crypto as any)?.randomUUID?.() ?? Math.random()),
    dept: String(a?.department ?? a?.dept ?? "General"),
    clinician: String(a?.doctorName ?? a?.clinician ?? "TBD"),
    facility: String(a?.facility ?? "Evermore Hospitals"),
    startISO: start,
    status,
    paymentMethod: a?.paymentMethod,
    estimatedCostGBP,
    requestRef: a?.requestRef ?? a?.paymentRef ?? a?.reference ?? null,
  };
}

function normalizeInvoiceDetailsAny(raw: any): InvoiceDetailsUI {
  const inv = raw?.invoice ?? raw?.data?.invoice ?? raw?.data ?? raw ?? {};
  const id = String(inv?._id ?? inv?.id ?? inv?.invoiceId ?? inv?.invoice_id ?? "");

  const invoiceNo = String(inv?.invoiceNo ?? inv?.invoice_no ?? inv?.number ?? inv?.title ?? "Invoice");
  const currency = String(inv?.currency ?? inv?.curr ?? "GBP").toUpperCase();

  const issuedAt =
    safeISO(inv?.issuedAt ?? inv?.issued_at ?? inv?.createdAt ?? inv?.created_at ?? inv?.createdISO) ??
    new Date().toISOString();

  const dueDate =
    safeISO(inv?.dueDate ?? inv?.due_date ?? inv?.dueAt ?? inv?.due_at ?? inv?.dueISO) ?? issuedAt;

  const paidAt = safeISO(inv?.paidAt ?? inv?.paid_at ?? inv?.paidISO ?? inv?.paid_iso) ?? null;

  let status = mapInvoiceStatusAny(inv?.status);
  const paidMark = inv?.paid === true || !!paidAt;
  if (paidMark) status = "Paid";

  try {
    const dueMs = new Date(dueDate).getTime();
    if ((status === "Unpaid" || status === "Pending approval") && Number.isFinite(dueMs) && dueMs < Date.now()) {
      status = "Overdue";
    }
  } catch {}

  const itemsRaw: any[] = Array.isArray(inv?.items)
    ? inv.items
    : Array.isArray(inv?.lineItems)
      ? inv.lineItems
      : Array.isArray(inv?.lines)
        ? inv.lines
        : [];

  const items = (itemsRaw || []).map((it: any) => {
    const qtyRaw = numFromAny(it?.qty ?? it?.quantity ?? it?.count ?? 1);
    const qty = Number.isFinite(qtyRaw) && qtyRaw > 0 ? qtyRaw : 1;

    const unitPriceRaw = numFromAny(it?.unitPrice ?? it?.unit_price ?? it?.price ?? it?.rate ?? 0);
    const unitPrice = Number.isFinite(unitPriceRaw) ? unitPriceRaw : 0;

    const amountRaw = numFromAny(it?.amount ?? it?.total ?? it?.lineTotal ?? it?.line_total);
    const amount =
      Number.isFinite(amountRaw) && amountRaw > 0 ? amountRaw : Number.isFinite(unitPrice) ? unitPrice * qty : 0;

    return {
      code: it?.code ? String(it.code) : undefined,
      description: String(it?.description ?? it?.name ?? it?.title ?? "Item"),
      qty,
      unitPrice,
      amount,
    };
  });

  const itemsSum = items.reduce((s, it) => s + (Number.isFinite(it.amount) ? it.amount : 0), 0);

  const subtotalCand = numFromAny(inv?.subtotal ?? inv?.subTotal ?? inv?.sub_total);
  const subtotal = Number.isFinite(subtotalCand) ? subtotalCand : itemsSum;

  const taxCand = numFromAny(inv?.tax ?? inv?.vat ?? 0);
  const tax = Number.isFinite(taxCand) ? taxCand : 0;

  const totalCand = numFromAny(inv?.total ?? inv?.grandTotal ?? inv?.grand_total ?? inv?.amount ?? subtotal + tax);
  const total = Number.isFinite(totalCand) ? totalCand : subtotal + tax;

  const coveredCand = numFromAny(inv?.coveredAmount ?? inv?.covered_amount);
  const coveredAmount = Number.isFinite(coveredCand) ? coveredCand : undefined;

  const balanceCand = numFromAny(inv?.balanceDue ?? inv?.balance_due);
  const balanceDue = Number.isFinite(balanceCand)
    ? balanceCand
    : typeof coveredAmount === "number"
      ? Math.max(0, total - coveredAmount)
      : undefined;

  const patientName = inv?.patientName || inv?.patient?.fullName || inv?.patient?.name || inv?.patient_full_name || null;
  const facility = inv?.facility || inv?.hospital || inv?.clinic || inv?.facilityName || null;

  return {
    id: id || String(inv?.invoiceNo ?? inv?.invoiceNo ?? "invoice"),
    invoiceNo,
    status,
    currency,
    issuedAt,
    dueDate,
    paidAt,
    patientName: patientName ? String(patientName) : null,
    facility: facility ? String(facility) : null,
    items,
    subtotal,
    tax,
    total,
    coveredAmount,
    balanceDue,
  };
}

function invoiceStatusTone(status: Invoice["status"]) {
  if (status === "Paid") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (status === "Overdue") return "bg-amber-50 text-amber-700 ring-amber-100";
  if (status === "Waived") return "bg-slate-50 text-slate-700 ring-slate-200";
  if (status === "Pending approval") return "bg-blue-50 text-blue-700 ring-blue-100";
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

/* --------------------------- */
/* Approval Flow (Password-only) */
/* --------------------------- */

const EP_VERIFY_PASSWORD = "/session/verify-password";

function ApprovalFlowModal({
  open,
  subject,
  onClose,
  onConfirm,
}: {
  open: boolean;
  subject: ApprovalSubject;
  onClose: () => void;
  onConfirm: () => Promise<{ requestRef: string }>;
}) {
  useLockBodyScroll(open);

  const [step, setStep] = React.useState<"password" | "confirm" | "pending">("password");
  const [busy, setBusy] = React.useState(false);
  const [pw, setPw] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [requestRef, setRequestRef] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setStep("password");
    setBusy(false);
    setPw("");
    setErr(null);
    setRequestRef(null);
  }, [open, subject.id]);

  async function verifyPassword() {
    setBusy(true);
    setErr(null);
    try {
      await apiPOST(EP_VERIFY_PASSWORD, { password: pw });
      setStep("confirm");
    } catch (e: any) {
      setErr(e?.message || "Password verification failed.");
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    setBusy(true);
    setErr(null);
    try {
      const res = await onConfirm();
      setRequestRef(res.requestRef);
      setStep("pending");
    } catch (e: any) {
      setErr(e?.message || "Failed to submit request.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4">
      <button className="absolute inset-0 bg-slate-950/45" onClick={onClose} aria-label="Close" />

      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[760px] max-h-[calc(100dvh-24px)] overflow-hidden rounded-[28px] bg-white ring-1 ring-slate-200 shadow-[0_40px_140px_rgba(2,8,23,.35)]"
      >
        <div className="flex max-h-[calc(100dvh-24px)] flex-col">
          <div className="shrink-0 border-b border-slate-100 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500">Secure confirmation</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {subject.kind === "appointment_booking"
                    ? "Confirm appointment booking"
                    : subject.kind === "careflex_repayment"
                      ? "Confirm CareFlex repayment"
                      : "Submit payment request"}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {subject.title} • {fmtMoney(subject.amount, subject.currency || "GBP")}
                </div>
                {subject.subtitle ? <div className="mt-1 text-xs text-slate-500">{subject.subtitle}</div> : null}
              </div>

              <button
                onClick={onClose}
                className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5">
            <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="text-xs font-semibold text-slate-500">Approval flow</div>
              <div className="mt-1 text-sm text-slate-700">Password → Confirm → Complete.</div>
            </div>

            <div className="mt-5 grid gap-3">
              {step === "password" ? (
                <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                  <div className="text-sm font-semibold text-slate-900">1) Enter your password</div>
                  <div className="mt-1 text-xs text-slate-600">Backend verifies your password before continuing.</div>

                  <input
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    type="password"
                    placeholder="Password"
                    className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />

                  {err ? <div className="mt-2 text-xs font-semibold text-rose-600">{err}</div> : null}

                  <button
                    onClick={verifyPassword}
                    disabled={busy}
                    className={cn(
                      "mt-4 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white",
                      busy ? "bg-blue-600/60" : "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    {busy ? "Verifying…" : "Confirm password"}
                  </button>
                </div>
              ) : null}

              {step === "confirm" ? (
                <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                  <div className="text-sm font-semibold text-slate-900">2) Confirm</div>
                  <div className="mt-1 text-xs text-slate-600">Proceed to submit. Payment processes instantly.</div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-500">Request</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{subject.title}</div>
                      <div className="mt-1 text-xs text-slate-600">
                        Amount: {fmtMoney(subject.amount, subject.currency || "GBP")}
                      </div>
                    </div>

                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                      Pending approval
                    </span>
                  </div>

                  {err ? <div className="mt-3 text-xs font-semibold text-rose-600">{err}</div> : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => setStep("password")}
                      className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      Back
                    </button>

                    <button
                      onClick={confirm}
                      disabled={busy}
                      className={cn(
                        "ml-auto rounded-2xl px-4 py-2.5 text-sm font-semibold text-white",
                        busy ? "bg-blue-600/60" : "bg-blue-600 hover:bg-blue-700"
                      )}
                    >
                      {busy ? "Submitting…" : "Confirm & submit"}
                    </button>
                  </div>
                </div>
              ) : null}

              {step === "pending" ? (
                <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                  <div className="text-sm font-semibold text-slate-900">Completed</div>
                  <div className="mt-1 text-xs text-slate-600">Status: Processed instantly</div>

                  <div className="mt-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-xs font-semibold text-slate-500">Reference</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">{requestRef ?? "—"}</div>
                  </div>

                  <button
                    onClick={onClose}
                    className="mt-4 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Lazy loads                         */
/* ---------------------------------- */

const RecordsTab = dynamic(() => import("./tabs/RecordsTab.client"), {
  ssr: false,
  loading: () => (
    <div className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-slate-200">
      <div className="text-sm font-semibold text-slate-900">Loading records…</div>
      <div className="mt-2 text-sm text-slate-600">Preparing filters and search.</div>
    </div>
  ),
});

const BillingTab = dynamic(() => import("./tabs/BillingTab.client"), {
  ssr: false,
  loading: () => (
    <div className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-slate-200">
      <div className="text-sm font-semibold text-slate-900">Loading billing…</div>
      <div className="mt-2 text-sm text-slate-600">Preparing invoices and CareFlex.</div>
    </div>
  ),
});

const RecordModal = dynamic(() => import("./RecordModal.client"), { ssr: false });

function EmptyCard({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-slate-600">{body}</div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/* ---------------------------------- */
/* Booking modal                      */
/* ---------------------------------- */

function AppointmentBookingModal({
  open,
  onClose,
  hasOverdue,
  linkedAccountLabel,
  onPayLater,
  onPayFromLinkedAccount,
}: {
  open: boolean;
  onClose: () => void;
  hasOverdue: boolean;
  linkedAccountLabel: string | null;
  onPayLater: (draft: AppointmentDraft) => void;
  onPayFromLinkedAccount: (draft: AppointmentDraft) => void;
}) {
  useLockBodyScroll(open);

  const DEPTS = [
    {
      dept: "Cardiology",
      clinicians: ["Dr. A. Sol", "Dr. S. Holden"],
      baseCost: 120,
      facilities: ["Evermore Central", "Evermore North"],
    },
    {
      dept: "Orthopaedics",
      clinicians: ["Dr. E. Wallace", "Dr. T. Wagner"],
      baseCost: 140,
      facilities: ["Evermore Central", "Evermore West"],
    },
    {
      dept: "Dermatology",
      clinicians: ["Dr. L. Chen", "Dr. I. McGuinn"],
      baseCost: 95,
      facilities: ["Evermore North", "Evermore Central"],
    },
    {
      dept: "General Practice",
      clinicians: ["Dr. M. Arthur", "Dr. J. Roth"],
      baseCost: 60,
      facilities: ["Evermore Central"],
    },
  ];

  const timeSlots = useMemo(() => {
    const now = new Date();
    const slots: string[] = [];
    for (let d = 1; d <= 10; d++) {
      const day = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
      for (const hh of [9, 11, 13, 15, 17]) {
        const dt = new Date(day);
        dt.setHours(hh, 0, 0, 0);
        slots.push(dt.toISOString());
      }
    }
    return slots;
  }, []);

  const [dept, setDept] = useState(DEPTS[0].dept);
  const deptObj = DEPTS.find((x) => x.dept === dept) ?? DEPTS[0];

  const [clinician, setClinician] = useState(deptObj.clinicians[0]);
  const [facility, setFacility] = useState(deptObj.facilities[0]);
  const [startISO, setStartISO] = useState(timeSlots[0]);

  const slotIdx = Math.max(0, timeSlots.indexOf(startISO));
  const canSlotUp = slotIdx > 0;
  const canSlotDown = slotIdx < timeSlots.length - 1;

  const [method, setMethod] = useState<PaymentMethodLabel>("Linked account");
  const [notes, setNotes] = useState("");

  React.useEffect(() => {
    setClinician(deptObj.clinicians[0]);
    setFacility(deptObj.facilities[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dept]);

  if (!open) return null;

  const payLaterDisabled = hasOverdue;
  const canUseLinked = !!linkedAccountLabel;

  return (
    <div className="fixed inset-0 z-[94] flex items-center justify-center p-3 sm:p-4">
      <button className="absolute inset-0 bg-slate-950/45" onClick={onClose} aria-label="Close" />

      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[860px] max-h-[calc(100dvh-24px)] overflow-hidden rounded-[28px] bg-white ring-1 ring-slate-200 shadow-[0_40px_140px_rgba(2,8,23,.35)]"
      >
        <div className="flex max-h-[calc(100dvh-24px)] flex-col">
          <div className="shrink-0 border-b border-slate-100 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500">Appointments</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">Book an appointment</div>
                <div className="mt-1 text-sm text-slate-600">
                  Choose a department, clinician, location, and time — then pick payment.
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                <div className="text-sm font-semibold text-slate-900">1) Appointment details</div>

                <label className="mt-4 block text-xs font-semibold text-slate-600">Department</label>
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {DEPTS.map((d) => (
                    <option key={d.dept} value={d.dept}>
                      {d.dept}
                    </option>
                  ))}
                </select>

                <label className="mt-4 block text-xs font-semibold text-slate-600">Clinician</label>
                <select
                  value={clinician}
                  onChange={(e) => setClinician(e.target.value)}
                  className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {deptObj.clinicians.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <label className="mt-4 block text-xs font-semibold text-slate-600">Facility</label>
                <select
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {deptObj.facilities.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>

                <label className="mt-4 block text-xs font-semibold text-slate-600">Time</label>
                <div className="mt-2 flex items-stretch gap-2">
                  <select
                    value={startISO}
                    onChange={(e) => setStartISO(e.target.value)}
                    className="w-full flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>
                        {fmtDate(t)} • {fmtTime(t)}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-rows-2 gap-2">
                    <button
                      type="button"
                      aria-label="Earlier time"
                      onClick={() => canSlotUp && setStartISO(timeSlots[slotIdx - 1])}
                      disabled={!canSlotUp}
                      className={cn(
                        "h-full w-12 rounded-2xl text-sm font-semibold ring-1 transition",
                        canSlotUp
                          ? "bg-white text-slate-900 ring-slate-200 hover:bg-slate-50"
                          : "bg-slate-50 text-slate-400 ring-slate-200 cursor-not-allowed"
                      )}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      aria-label="Later time"
                      onClick={() => canSlotDown && setStartISO(timeSlots[slotIdx + 1])}
                      disabled={!canSlotDown}
                      className={cn(
                        "h-full w-12 rounded-2xl text-sm font-semibold ring-1 transition",
                        canSlotDown
                          ? "bg-white text-slate-900 ring-slate-200 hover:bg-slate-50"
                          : "bg-slate-50 text-slate-400 ring-slate-200 cursor-not-allowed"
                      )}
                    >
                      ▼
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-[11px] font-semibold text-slate-500">
                  Slot {slotIdx + 1} of {timeSlots.length}
                </div>

                <label className="mt-4 block text-xs font-semibold text-slate-600">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for visit, symptoms, or message for the clinic…"
                  className="mt-2 min-h-[96px] w-full resize-none rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                <div className="text-sm font-semibold text-slate-900">2) Payment</div>

                <div className="mt-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold text-slate-500">Estimated consultation cost</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{fmtMoney(deptObj.baseCost, "GBP")}</div>
                </div>

                <div className="mt-4 grid gap-2">
                  <button
                    onClick={() => setMethod("Linked account")}
                    className={cn(
                      "flex items-start justify-between gap-4 rounded-3xl p-4 ring-1 transition text-left",
                      method === "Linked account" ? "bg-blue-50 ring-blue-200" : "bg-white ring-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Pay from linked account</div>
                      <div className="mt-1 text-xs text-slate-600">
                        {canUseLinked ? `Account: ${linkedAccountLabel}` : "No linked account found."}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold ring-1",
                        canUseLinked ? "bg-white text-blue-700 ring-blue-200" : "bg-slate-50 text-slate-400 ring-slate-200"
                      )}
                    >
                      Password
                    </span>
                  </button>

                  <button
                    onClick={() => setMethod("Pay later")}
                    disabled={payLaterDisabled}
                    className={cn(
                      "flex items-start justify-between gap-4 rounded-3xl p-4 ring-1 transition text-left",
                      payLaterDisabled
                        ? "bg-slate-50 ring-slate-200 opacity-70 cursor-not-allowed"
                        : method === "Pay later"
                          ? "bg-blue-50 ring-blue-200"
                          : "bg-white ring-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Pay later (invoice)</div>
                      <div className="mt-1 text-xs text-slate-600">Backend creates an invoice in Billing.</div>
                      {payLaterDisabled ? (
                        <div className="mt-2 text-xs font-semibold text-amber-700">
                          Pay later is disabled because you have an overdue balance.
                        </div>
                      ) : null}
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold ring-1",
                        payLaterDisabled ? "bg-white text-slate-400 ring-slate-200" : "bg-white text-blue-700 ring-blue-200"
                      )}
                    >
                      Invoice
                    </span>
                  </button>
                </div>

                <div className="mt-4 rounded-3xl bg-white p-4 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold text-slate-500">Summary</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {dept} • {clinician}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    {facility} • {fmtDate(startISO)} • {fmtTime(startISO)}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-600">Payment: {method}</div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={onClose}
                    className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      const draft: AppointmentDraft = {
                        dept,
                        clinician,
                        facility,
                        startISO,
                        notes: notes.trim() || undefined,
                        estimatedCostGBP: deptObj.baseCost,
                        paymentMethod: method,
                      };

                      if (method === "Pay later") {
                        if (payLaterDisabled) return;
                        onPayLater(draft);
                        return;
                      }

                      if (!canUseLinked) return;
                      onPayFromLinkedAccount(draft);
                    }}
                    disabled={(method === "Linked account" && !canUseLinked) || (method === "Pay later" && payLaterDisabled)}
                    className={cn(
                      "ml-auto rounded-2xl px-4 py-2.5 text-sm font-semibold text-white",
                      (method === "Linked account" && !canUseLinked) || (method === "Pay later" && payLaterDisabled)
                        ? "bg-blue-600/60"
                        : "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    {method === "Pay later" ? "Book & create invoice" : "Continue to payment"}
                  </button>
                </div>

                {method === "Linked account" && !canUseLinked ? (
                  <div className="mt-3 text-xs font-semibold text-amber-700">Link an account first to pay now.</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Backend paths used by Dashboard     */
/* ---------------------------------- */

const EP_DASHBOARD = "/portal/dashboard";
const EP_PROFILE = "/session/me";
const EP_RECORDS = "/portal/records";
const EP_INVOICES = "/portal/invoices";
const EP_APPOINTMENTS = "/portal/appointments";
const EP_LINKED_ACCOUNTS = "/portal/accounts";

const EP_SUBMIT_INVOICE_PAYMENT = (invoiceId: string) =>
  `/portal/invoices/${encodeURIComponent(invoiceId)}/submit-payment`;

// IMPORTANT: downloads must hit Next proxy (/api/*), not raw /portal/*
const EP_INVOICE_PDF = (invoiceId: string) => `/api/portal/invoices/${encodeURIComponent(invoiceId)}/pdf`;
const EP_RECORD_DOWNLOAD = (recordId: string) => `/api/portal/records/${encodeURIComponent(recordId)}/download`;

const EP_BOOK_APPT = "/portal/appointments/book";
const EP_CAREFLEX_USE = "/portal/careflex/use";
const EP_CAREFLEX_REPAYMENTS = "/portal/careflex/repayments";
const EP_INVOICE_DETAILS = (invoiceId: string) => `/portal/invoices/${encodeURIComponent(invoiceId)}`;
const EP_RECORD_SHARE = (recordId: string) => `/portal/records/${encodeURIComponent(recordId)}/share`;
const EP_MESSAGE_CARE_TEAM = "/portal/messages";

/* ---------------------------------- */
/* Dashboard Client                    */
/* ---------------------------------- */

export default function DashboardClient() {
  const [toast, setToast] = useState<Toast>(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [records, setRecords] = useState<HospitalRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [appts, setAppts] = useState<PatientAppointment[]>([]);
  const [linkedAccount, setLinkedAccount] = useState<{ label: string } | null>(null);
  const [apptCursor, setApptCursor] = useState(0);

  const [pendingRefByInvoiceId, setPendingRefByInvoiceId] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"overview" | "appointments" | "records" | "billing">("overview");
  const [openRecord, setOpenRecord] = useState<HospitalRecord | null>(null);

  // booking + approval
  const [bookOpen, setBookOpen] = useState(false);
  const [draftAppt, setDraftAppt] = useState<AppointmentDraft | null>(null);

  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalSubject, setApprovalSubject] = useState<ApprovalSubject | null>(null);

  // billing details
  const [openInvoiceId, setOpenInvoiceId] = useState<string | null>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);
  const [detailsBusy, setDetailsBusy] = useState(false);

  // Lock scroll for invoice details modal too
  useLockBodyScroll(!!openInvoiceId);

  async function refreshInvoicesCanonical() {
    try {
      const raw = await apiGET<any>(EP_INVOICES);
      const list: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.invoices) ? raw.invoices : [];
      const normalized = list.map((x) => normalizeInvoiceAny(x));
      setInvoices(normalized);
    } catch {
      // ok if invoices endpoint isn't implemented yet
    }
  }

  React.useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setToast(null);

      try {
        try {
          const dash = await apiGET<any>(EP_DASHBOARD);
          if (!alive) return;

          const rawUser = dash?.profile ?? dash?.me ?? dash?.user ?? null;
          const rawAccount = dash?.account ?? dash?.patientAccount ?? dash?.patient_account ?? null;

          if (rawUser) {
            if (rawUser.fullName) {
              setProfile(rawUser);
            } else {
              setProfile({
                fullName: rawUser.name ?? rawUser.full_name ?? "Patient",
                patientId: rawUser.hospitalId ?? rawUser.patientId ?? rawUser.patient_id ?? "—",
                email: rawUser.email ?? "",
                phone: rawUser.phone ?? null,
                eligibilityScore: Number(rawAccount?.creditScore ?? rawAccount?.credit_score ?? 720),
                careflexLimit: (() => {
                  const n = Number(rawAccount?.creditLimit ?? rawAccount?.credit_limit ?? rawUser.careflexLimit ?? 0);
                  return Number.isFinite(n) && n > 0 ? n : 5000;
                })(),
                careflexTermsDays: 30,
              } as any);
            }
          }

          // Records
          if (Array.isArray(dash?.records)) {
            const rr = dash.records;
            const normalized: HospitalRecord[] =
              rr.length && rr[0]?.id
                ? rr
                : rr.map((r: any) => ({
                    id: String(r._id ?? r.id ?? (crypto as any)?.randomUUID?.() ?? Math.random()),
                    type: (() => {
                      const vv = String(r.type ?? "").toLowerCase();
                      if (vv === "lab") return "lab";
                      if (vv === "radiology" || vv === "imaging") return "imaging";
                      if (vv === "prescription") return "prescription";
                      if (vv === "consultation" || vv === "visit" || vv === "diagnosis") return "visit";
                      return "document";
                    })(),
                    title: String(r.title ?? "Medical record"),
                    subtitle: r.summary ? String(r.summary).slice(0, 42) : undefined,
                    facility: String(r.facility ?? "Evermore Hospitals"),
                    clinician: String(r.clinician ?? r.doctorName ?? "—"),
                    dateISO: String(r.recordedAt ?? r.dateISO ?? r.createdAt ?? new Date().toISOString()),
                    status: r.status === "draft" ? "Processing" : "Synced",
                    summary: String(r.summary ?? ""),
                    notes: Array.isArray(r.notes) ? r.notes : undefined,
                    tags: Array.isArray(r.tags) ? r.tags : undefined,
                  }));
            setRecords(normalized);
          }

          // Invoices (normalized)
          const rawInvoices =
            dash?.invoices ??
            dash?.invoice ??
            dash?.billing?.invoices ??
            dash?.billing?.invoice ??
            dash?.billingInvoices ??
            null;

          if (Array.isArray(rawInvoices)) {
            setInvoices(rawInvoices.map((inv: any) => normalizeInvoiceAny(inv)));
          } else {
            setInvoices([]);
          }

          await refreshInvoicesCanonical();

          // Payments
          const pp = dash?.payments ?? dash?.paymentRequests ?? dash?.payment_requests;
          if (Array.isArray(pp)) {
            const normalized: PaymentRow[] = pp.map((p: any) => ({
              id: String(p._id ?? p.id ?? (crypto as any)?.randomUUID?.() ?? Math.random()),
              reference: (p.reference ?? p.requestRef ?? p.ref ?? null) ? String(p.reference ?? p.requestRef ?? p.ref) : null,
              invoiceId: (p.invoiceId ?? p.invoice_id ?? null) ? String(p.invoiceId ?? p.invoice_id) : null,
              currency: p.currency ? String(p.currency) : null,
              amount: Number(numFromAny(p.amount ?? p.amountTotal ?? p.total ?? 0) || 0),
              status: String(p.status ?? "unknown"),
              method: p.method ? String(p.method) : null,
              createdISO: String(p.createdAt ?? p.createdISO ?? new Date().toISOString()),
              title: p.adminNote ? String(p.adminNote).slice(0, 64) : null,
            }));

            setPayments(normalized);

            const localMap: Record<string, string> = {};
            for (const p of normalized) {
              const st = String(p.status ?? "").toLowerCase();
              if (p.invoiceId && p.reference && st === "pending") {
                localMap[p.invoiceId] = p.reference;
              }
            }
            if (Object.keys(localMap).length) setPendingRefByInvoiceId(localMap);
          } else {
            setPayments([]);
          }

          // Appointments
          if (Array.isArray(dash?.appointments)) {
            const aa = dash.appointments;
            const normalized: PatientAppointment[] = aa.length && aa[0]?.dept ? aa : aa.map((a: any) => normalizeApptAny(a));
            setAppts(normalized);
          }

          // linked accounts
          const accs = dash?.accounts ?? dash?.linkedAccounts ?? dash?.linked_accounts;
          if (Array.isArray(accs) && accs[0]?.label) setLinkedAccount({ label: accs[0].label });

          if (!Array.isArray(accs) && rawAccount?.currency && !dash?.accounts?.length) {
            setLinkedAccount({ label: `Evermore ${String(rawAccount.currency)} Account` });
          }

          if (dash?.pendingRefByInvoiceId && typeof dash.pendingRefByInvoiceId === "object") {
            setPendingRefByInvoiceId(dash.pendingRefByInvoiceId);
          }

          return;
        } catch {
          // fallback to individual calls
        }

        const [me, recs, invs, apps] = await Promise.all([
          apiGET<PatientProfile | null>(EP_PROFILE),
          apiGET<HospitalRecord[]>(EP_RECORDS),
          apiGET<Invoice[]>(EP_INVOICES),
          apiGET<PatientAppointment[]>(EP_APPOINTMENTS),
        ]);

        if (!alive) return;

        setProfile(me);
        setRecords(Array.isArray(recs) ? recs : []);
        setInvoices(Array.isArray(invs) ? invs.map((x: any) => normalizeInvoiceAny(x)) : []);
        setAppts(Array.isArray(apps) ? apps.map((x: any) => normalizeApptAny(x)) : []);

        await refreshInvoicesCanonical();

        try {
          const acctRes = await apiGET<any>(EP_LINKED_ACCOUNTS);
          if (!alive) return;
          const list = Array.isArray(acctRes) ? acctRes : acctRes?.accounts;
          if (Array.isArray(list) && list[0]?.label) setLinkedAccount({ label: list[0].label });
        } catch {}
      } catch (e: any) {
        if (!alive) return;
        setToast({ type: "error", message: e?.message || "Failed to load dashboard data." });
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const careflexView = useMemo(() => deriveCareflexInvoices(invoices, payments), [invoices, payments]);
  const invoicesView = careflexView.derivedInvoices;
  const careflexOwed = careflexView.owed;

  const hasOverdue = useMemo(() => invoicesView.some((x) => (x as any).status === "Overdue"), [invoicesView]);

  const nextAppt = useMemo(() => {
    const upcoming = appts
      .filter((x) => x.status === "Confirmed")
      .slice()
      .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());
    return upcoming[0] ?? null;
  }, [appts]);

  const outstandingInvoices = useMemo(() => invoicesView.filter((x) => (x as any).status === "Unpaid" || (x as any).status === "Overdue"), [invoicesView]);
  const totalOutstanding = useMemo(() => careflexOwed, [careflexOwed]);

  const careflexLimit = useMemo(() => {
    const n = Number((profile as any)?.careflexLimit ?? 0);
    return Number.isFinite(n) && n > 0 ? n : 5000;
  }, [profile]);

  const careflexAvailable = useMemo(() => {
    const used = Number.isFinite(totalOutstanding) ? totalOutstanding : 0;
    return Math.max(0, careflexLimit - used);
  }, [careflexLimit, totalOutstanding]);

  const overdueOutstanding = useMemo(() => {
    return outstandingInvoices
      .filter((x) => (x as any).status === "Overdue")
      .reduce((s, x) => s + (Number.isFinite((x as any).balanceDue) ? ((x as any).balanceDue as number) : 0), 0);
  }, [outstandingInvoices]);

  const dueInvoice = useMemo(() => {
    const unpaid = outstandingInvoices
      .slice()
      .sort((a, b) => new Date((a as any).dueISO).getTime() - new Date((b as any).dueISO).getTime());
    return unpaid[0] ?? null;
  }, [outstandingInvoices]);

  const lastPayment = useMemo(() => {
    const isPaid = (s: string) => OK_PAYMENT_STATUSES.has(String(s ?? "").toLowerCase());
    return (
      payments
        .filter((p) => isPaid(p.status))
        .slice()
        .sort((a, b) => new Date(b.createdISO).getTime() - new Date(a.createdISO).getTime())[0] ?? null
    );
  }, [payments]);

  const totalPaid = useMemo(() => {
    const ok = (s: any) => OK_PAYMENT_STATUSES.has(String(s ?? "").toLowerCase());
    const successful = (payments || []).filter((p) => ok((p as any)?.status));
    const paidFromPayments = successful.reduce((s, p) => s + (Number.isFinite((p as any)?.amount) ? (p as any).amount : 0), 0);

    if (successful.length > 0) return paidFromPayments;

    return (invoicesView || [])
      .filter((inv) => (inv as any)?.status === "Paid")
      .reduce((s, inv) => s + (Number.isFinite((inv as any)?.amount) ? (inv as any).amount : 0), 0);
  }, [payments, invoicesView]);

  // Appointments paging
  const sortedAppts = useMemo(() => appts.slice().sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime()), [appts]);

  const APPT_PAGE = 6;
  const apptMaxCursor = Math.max(0, sortedAppts.length - APPT_PAGE);
  const safeApptCursor = Math.min(apptCursor, apptMaxCursor);

  React.useEffect(() => {
    if (apptCursor !== safeApptCursor) setApptCursor(safeApptCursor);
  }, [apptCursor, safeApptCursor]);

  const apptsPage = sortedAppts.slice(safeApptCursor, safeApptCursor + APPT_PAGE);

  const careflexEligible = useMemo(() => {
    if (!profile) return false;
    return (profile as any).eligibilityScore >= 700 && !hasOverdue;
  }, [profile, hasOverdue]);

  const counts = useMemo(() => {
    const c: Record<RecordType, number> = { lab: 0, imaging: 0, visit: 0, prescription: 0, document: 0 };
    for (const r of records) c[r.type] += 1;
    return c;
  }, [records]);

  const recentRecords = useMemo(
    () =>
      records
        .slice()
        .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
        .slice(0, 4),
    [records]
  );

  function startCareflexRepayment(amountGBP: number) {
    const amt = Number(amountGBP);
    if (!Number.isFinite(amt) || amt <= 0) return;

    setApprovalSubject({
      kind: "careflex_repayment",
      id: `careflex_repay_${Date.now()}`,
      title: "CareFlex repayment",
      amount: amt,
      currency: "GBP",
      subtitle: "Pay any amount — we automatically apply it to your oldest unpaid invoices first.",
    });
    setApprovalOpen(true);
  }

  async function doSubmitInvoicePayment(invoiceId: string): Promise<{ requestRef: string }> {
    if (!isValidId(invoiceId)) throw new Error("Missing invoice id.");
    const res = await apiPOST<any>(EP_SUBMIT_INVOICE_PAYMENT(invoiceId), {});

    const paymentRef = res?.paymentRef || res?.requestRef || res?.ref || res?.request_reference || res?.txRef || "";
    const rawInv = res?.invoice;

    if (rawInv) {
      const inv = normalizeInvoiceAny(rawInv);
      setInvoices((prev) => prev.map((x) => (x.id === invoiceId ? { ...inv, status: "Paid" } : x)));

      setPayments((prev) => {
        const id = `pay_${paymentRef || invoiceId}`;
        const next: PaymentRow = {
          id,
          title: "Invoice payment",
          amount: (inv as any).amount,
          currency: "GBP",
          status: "paid",
          method: "bank",
          reference: paymentRef || (inv as any).title,
          invoiceId: (inv as any).id,
          createdISO: new Date().toISOString(),
        };
        return [next, ...prev.filter((p) => p.id !== id)];
      });
    } else {
      setInvoices((prev) => prev.map((x) => (x.id === invoiceId ? { ...(x as any), status: "Paid" } : x)));

      setPayments((prev) => {
        const id = `pay_${paymentRef || invoiceId}`;
        const next: PaymentRow = {
          id,
          title: "Invoice payment",
          amount: (invoices.find((x) => x.id === invoiceId)?.amount ?? 0) as number,
          currency: "GBP",
          status: "paid",
          method: "bank",
          reference: paymentRef || invoiceId,
          invoiceId,
          createdISO: new Date().toISOString(),
        };
        return [next, ...prev.filter((p) => p.id !== id)];
      });
    }

    setPendingRefByInvoiceId((m) => {
      if (!m || !Object.prototype.hasOwnProperty.call(m, invoiceId)) return m;
      const next = { ...m };
      delete next[invoiceId];
      return next;
    });

    await refreshInvoicesCanonical();
    setToast({ type: "success", message: "Payment successful." });
    setTab("billing");

    return { requestRef: paymentRef || "OK" };
  }

  async function doSubmitCareflexRepayment(amountGBP: number): Promise<{ requestRef: string }> {
    const amt = Number(amountGBP);
    if (!Number.isFinite(amt) || amt <= 0) throw new Error("Invalid amount.");

    const res = await apiPOST<any>(EP_CAREFLEX_REPAYMENTS, { amount: amt, currency: "GBP" });
    const paymentRef = res?.paymentRef || res?.requestRef || res?.ref || res?.request_reference || res?.txRef || "";

    setPayments((prev) => {
      const id = `careflex_${paymentRef || Date.now()}`;
      const next: PaymentRow = {
        id,
        title: "CareFlex repayment",
        amount: amt,
        currency: "GBP",
        status: "paid",
        method: "careflex",
        reference: paymentRef || "CareFlex repayment",
        invoiceId: null,
        createdISO: new Date().toISOString(),
      };
      return [next, ...prev.filter((p) => p.id !== id)];
    });

    await refreshInvoicesCanonical();
    setToast({ type: "success", message: "Repayment successful." });
    setTab("billing");

    return { requestRef: paymentRef || "OK" };
  }

  async function bookPayLater(d: AppointmentDraft) {
    try {
      const payload = {
        department: d.dept,
        clinician: d.clinician,
        facility: d.facility,
        scheduledAt: d.startISO,
        notes: d.notes,
        paymentMethod: "pay_later",
        estimatedCostGBP: d.estimatedCostGBP,
        currency: "GBP",

        // backward-compat keys
        dept: d.dept,
        startISO: d.startISO,
        estimatedCost: d.estimatedCostGBP,
      };

      const res = await apiPOST<any>(EP_BOOK_APPT, payload);

      const rawAppt = res?.appointment;
      const rawInv = res?.invoice;

      if (!rawAppt) throw new Error("Backend did not return an appointment.");

      const appt = normalizeApptAny(rawAppt);
      setAppts((prev) => [appt, ...prev.filter((x) => x.id !== appt.id)]);

      if (rawInv) {
        const inv = normalizeInvoiceAny(rawInv);
        setInvoices((prev) => [inv, ...prev.filter((x) => x.id !== inv.id)]);
      }

      setToast({ type: "success", message: "Appointment booked. Invoice created in Billing." });
      setBookOpen(false);
      setTab(rawInv ? "billing" : "appointments");
    } catch (e: any) {
      setToast({ type: "error", message: e?.message || "Failed to book appointment." });
    }
  }

  function bookFromLinkedAccount(d: AppointmentDraft) {
    setDraftAppt(d);
    setBookOpen(false);

    setApprovalSubject({
      kind: "appointment_booking",
      id: `appt_${d.startISO}`,
      title: `Appointment — ${d.dept} (${fmtDate(d.startISO)} • ${fmtTime(d.startISO)})`,
      amount: d.estimatedCostGBP,
      currency: "GBP",
      subtitle: "Password confirmation required. Payment processes instantly.",
    });
    setApprovalOpen(true);
  }

  async function doBookFromLinkedAccount(): Promise<{ requestRef: string }> {
    if (!draftAppt) throw new Error("Missing appointment draft.");

    const payload = {
      department: draftAppt.dept,
      clinician: draftAppt.clinician,
      facility: draftAppt.facility,
      scheduledAt: draftAppt.startISO,
      notes: draftAppt.notes,
      paymentMethod: "linked_account",
      estimatedCostGBP: draftAppt.estimatedCostGBP,
      currency: "GBP",

      // backward-compat keys
      dept: draftAppt.dept,
      startISO: draftAppt.startISO,
      estimatedCost: draftAppt.estimatedCostGBP,
    };

    const res = await apiPOST<any>(EP_BOOK_APPT, payload);

    const paymentRef = res?.paymentRef || res?.requestRef || res?.ref || res?.request_reference || res?.txRef || "";
    const rawAppt = res?.appointment;
    const rawInv = res?.invoice;
    const rawPay = res?.paymentRequest || res?.payment || res?.payment_request || res?.tx || res?.transaction || null;

    if (!rawAppt) throw new Error("Backend did not return an appointment.");

    const appt = normalizeApptAny(rawAppt);
    setAppts((prev) => [appt, ...prev.filter((x) => x.id !== appt.id)]);

    if (rawInv) {
      const inv = normalizeInvoiceAny(rawInv);

      if (paymentRef) setPendingRefByInvoiceId((m) => ({ ...m, [(inv as any).id]: paymentRef }));
      setInvoices((prev) => [inv, ...prev.filter((x) => x.id !== (inv as any).id)]);

      setPayments((prev) => {
        const id = `pay_${paymentRef || (inv as any).id}`;
        const next: PaymentRow = {
          id,
          title: "Linked account payment",
          amount: (inv as any).amount,
          currency: "GBP",
          status: "paid",
          method: "bank",
          reference: paymentRef || (inv as any).title,
          invoiceId: (inv as any).id,
          createdISO: new Date().toISOString(),
        };
        return [next, ...prev.filter((p) => p.id !== id)];
      });

      setTab("billing");
    } else if (rawPay) {
      const amountAny = Number(numFromAny((rawPay as any)?.amount ?? draftAppt?.estimatedCostGBP ?? 0) || 0);
      const currencyAny = String((rawPay as any)?.currency ?? "GBP");
      const statusAny = String((rawPay as any)?.status ?? "paid").toLowerCase();
      const methodAny = String((rawPay as any)?.method ?? "bank").toLowerCase();

      const referenceAny = String((rawPay as any)?.reference ?? paymentRef ?? "");
      const createdAny = String(
        (rawPay as any)?.createdISO ??
          (rawPay as any)?.createdAt ??
          (rawPay as any)?.created_at ??
          new Date().toISOString()
      );

      const invoiceIdAny = (rawPay as any)?.invoiceId ? String((rawPay as any).invoiceId) : undefined;

      setPayments((prev) => {
        const id = `pay_${referenceAny || paymentRef || appt.id}`;
        const next: PaymentRow = {
          id,
          title: "Linked account payment",
          amount: Number.isFinite(amountAny) ? amountAny : 0,
          currency: currencyAny || "GBP",
          status: statusAny,
          method: methodAny,
          reference: referenceAny || paymentRef || "Linked account",
          invoiceId: invoiceIdAny,
          createdISO: safeISO(createdAny) || new Date().toISOString(),
        };
        return [next, ...prev.filter((p) => p.id !== id)];
      });

      setTab("billing");
    } else {
      setTab("appointments");
    }

    setDraftAppt(null);
    setToast({ type: "success", message: "Appointment booked and paid. Invoice is in Billing." });

    await refreshInvoicesCanonical();
    return { requestRef: paymentRef || "OK" };
  }

  async function useCareFlex() {
    try {
      const res = await apiPOST<any>(EP_CAREFLEX_USE, {});
      const invAny = res?.invoice;
      if (invAny) {
        const inv = normalizeInvoiceAny(invAny);
        setInvoices((prev) => [inv, ...prev.filter((x) => x.id !== (inv as any).id)]);
      }
      setToast({ type: "success", message: "CareFlex used. Invoice created." });
      setTab("billing");
      await refreshInvoicesCanonical();
    } catch (e: any) {
      setToast({ type: "error", message: e?.message || "Failed to use CareFlex." });
    }
  }

  async function openInvoiceDetails(invoiceId: string) {
    if (!isValidId(invoiceId)) {
      setToast({ type: "error", message: "Invalid invoice id." });
      return;
    }
    setOpenInvoiceId(invoiceId);
    setInvoiceDetails(null);
    setDetailsBusy(true);
    try {
      const res = await apiGET<any>(EP_INVOICE_DETAILS(invoiceId));
      setInvoiceDetails(res);
    } catch (e: any) {
      setToast({ type: "error", message: e?.message || "Failed to load invoice details." });
    } finally {
      setDetailsBusy(false);
    }
  }

  async function shareRecord(recordId: string) {
    const res = await apiPOST<any>(EP_RECORD_SHARE(recordId), {});
    const url = res?.url || res?.shareUrl || res?.link;
    if (!url) throw new Error("Backend did not return a share link.");
    const ok = await safeCopy(String(url));
    if (!ok) throw new Error("Copy failed.");
    setToast({ type: "success", message: "Share link copied." });
  }

  async function downloadRecord(recordId: string) {
    const r = await fetch(EP_RECORD_DOWNLOAD(recordId), { method: "GET" });
    if (!r.ok) throw new Error("Download failed.");

    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `record-${recordId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setToast({ type: "success", message: "Record downloaded." });
  }

  async function downloadInvoicePdf(invoiceId: string, title?: string) {
    if (!isValidId(invoiceId)) {
      setToast({ type: "error", message: "Invoice ID missing — can't download." });
      return;
    }

    const r = await fetch(EP_INVOICE_PDF(invoiceId), { method: "GET" });
    if (!r.ok) {
      setToast({ type: "error", message: "Invoice download failed." });
      return;
    }

    const blob = await r.blob();
    const url = URL.createObjectURL(blob);

    const safeTitle = String(title || "invoice").replace(/[^\w\-]+/g, "_").slice(0, 60);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeTitle}-${invoiceId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setToast({ type: "success", message: "Invoice downloaded." });
  }

  async function messageCareTeam(recordId: string) {
    await apiPOST(EP_MESSAGE_CARE_TEAM, { recordId });
    setToast({ type: "success", message: "Message thread created." });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
          <div className="text-sm font-semibold text-slate-900">Loading dashboard…</div>
          <div className="mt-2 text-sm text-slate-600">Fetching profile, records, invoices, and appointments.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {toast ? (
        <div
          className={cn(
            "mb-4 rounded-3xl p-4 ring-1",
            toast.type === "error"
              ? "bg-rose-50 ring-rose-200"
              : toast.type === "success"
                ? "bg-emerald-50 ring-emerald-200"
                : "bg-blue-50 ring-blue-200"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className={cn("text-sm font-semibold", toast.type === "error" ? "text-rose-700" : "text-slate-900")}>
              {toast.message}
            </div>
            <button onClick={() => setToast(null)} className="text-xs font-semibold text-slate-700 hover:underline">
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { k: "overview", label: "Dashboard" },
          { k: "appointments", label: "Appointments" },
          { k: "records", label: "Hospital Records" },
          { k: "billing", label: "Billing & CareFlex" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as any)}
            className={cn(
              "rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition",
              tab === (t.k as any)
                ? "bg-blue-600 text-white ring-blue-600 shadow-[0_16px_40px_rgba(37,99,235,.25)]"
                : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          {/* Left */}
          <div className="grid gap-4">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_22px_70px_rgba(2,8,23,.10)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Evermore Patient ID</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight">
                    {(profile as any)?.patientId ?? (profile as any)?.hospitalId ?? "—"}
                  </div>
                  <div className="mt-2 text-sm text-slate-600">Your ID comes from the backend profile.</div>
                </div>

                <button
                  onClick={async () => {
                    const id = (profile as any)?.patientId ?? (profile as any)?.hospitalId;
                    if (!id) return;
                    const ok = await safeCopy(String(id));
                    setToast(ok ? { type: "success", message: "Copied." } : { type: "error", message: "Copy failed." });
                  }}
                  disabled={!((profile as any)?.patientId ?? (profile as any)?.hospitalId)}
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm font-semibold ring-1",
                    (profile as any)?.patientId || (profile as any)?.hospitalId
                      ? "bg-white text-blue-700 ring-blue-200 hover:bg-blue-50"
                      : "bg-slate-50 text-slate-400 ring-slate-200 cursor-not-allowed"
                  )}
                >
                  Copy ID
                </button>
              </div>

              <div className="mt-6 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Next appointment</div>
                    {nextAppt ? (
                      <>
                        <div className="mt-2 text-xl font-semibold">
                          {fmtDate(nextAppt.startISO)} • {fmtTime(nextAppt.startISO)}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {nextAppt.dept} — {nextAppt.clinician}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">{nextAppt.facility}</div>
                      </>
                    ) : (
                      <div className="mt-2 text-sm text-slate-600">No upcoming appointments.</div>
                    )}
                  </div>

                  {nextAppt ? (
                    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold ring-1", toneForStatus(nextAppt.status as any))}>
                      {nextAppt.status}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                      <button
                        type="button"
                        aria-label="Show earlier appointments"
                        onClick={() => setApptCursor((c) => Math.max(0, c - APPT_PAGE))}
                        disabled={safeApptCursor <= 0}
                        className={cn(
                          "h-10 w-11 rounded-2xl text-sm font-semibold ring-1 ring-transparent transition",
                          safeApptCursor <= 0 ? "text-slate-300 cursor-not-allowed" : "text-slate-900 hover:bg-white/70"
                        )}
                      >
                        ▲
                      </button>

                      <div className="px-3 text-xs font-semibold text-slate-600">
                        {sortedAppts.length
                          ? `${safeApptCursor + 1}-${Math.min(safeApptCursor + APPT_PAGE, sortedAppts.length)} of ${sortedAppts.length}`
                          : "0"}
                      </div>

                      <button
                        type="button"
                        aria-label="Show later appointments"
                        onClick={() => setApptCursor((c) => Math.min(apptMaxCursor, c + APPT_PAGE))}
                        disabled={safeApptCursor >= apptMaxCursor}
                        className={cn(
                          "h-10 w-11 rounded-2xl text-sm font-semibold ring-1 ring-transparent transition",
                          safeApptCursor >= apptMaxCursor ? "text-slate-300 cursor-not-allowed" : "text-slate-900 hover:bg-white/70"
                        )}
                      >
                        ▼
                      </button>
                    </div>

                    <button
                      onClick={() => setBookOpen(true)}
                      className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Book appointment
                    </button>
                  </div>

                  <button
                    onClick={() => setTab("appointments")}
                    className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
                  >
                    View appointments
                  </button>

                  {!linkedAccount ? (
                    <span className="self-center text-xs font-semibold text-amber-700">No linked account found (pay now disabled).</span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Recent records preview */}
            <div className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_22px_70px_rgba(2,8,23,.10)]">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                <div>
                  <div className="text-sm font-semibold">Recent hospital records</div>
                  <div className="mt-1 text-xs text-slate-600">Labs, imaging, visit summaries, prescriptions, documents.</div>
                </div>

                <button
                  onClick={() => setTab("records")}
                  className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
                >
                  View all
                </button>
              </div>

              <div className="px-6 py-5">
                {recentRecords.length ? (
                  <div className="grid gap-3">
                    {recentRecords.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setOpenRecord(r)}
                        className="text-left rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200 hover:bg-white transition"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                                {pillForRecord(r.type)}
                              </span>
                              <span className={cn("rounded-full px-3 py-1 text-xs font-semibold ring-1", toneForStatus(r.status as any))}>
                                {r.status}
                              </span>
                            </div>

                            <div className="mt-2 text-sm font-semibold text-slate-900">{r.title}</div>
                            <div className="mt-1 text-xs text-slate-600">
                              {fmtDate(r.dateISO)} • {r.facility}
                            </div>
                          </div>

                          <span className="text-xs font-semibold text-blue-700">Open</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <EmptyCard
                    title="No records yet"
                    body="Your results and documents will appear here after visits and tests."
                    action={
                      <button
                        onClick={() => setTab("records")}
                        className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
                      >
                        Go to Records
                      </button>
                    }
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="grid gap-4">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_22px_70px_rgba(2,8,23,.10)]">
              <div className="text-sm font-semibold">Billing snapshot</div>
              <div className="mt-1 text-xs text-slate-600">What you owe + recent payments.</div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Outstanding</div>
                      <div className="mt-2 text-xl font-semibold">{fmtMoney(totalOutstanding, "GBP")}</div>
                      <div className="mt-1 text-xs text-slate-600">
                        Paid to date: <span className="font-semibold">{fmtMoney(totalPaid, "GBP")}</span>
                      </div>

                      {overdueOutstanding > 0 ? (
                        <div className="mt-1 text-xs font-semibold text-amber-700">Overdue: {fmtMoney(overdueOutstanding, "GBP")}</div>
                      ) : (
                        <div className="mt-1 text-xs text-slate-600">No overdue invoices.</div>
                      )}

                      <div className="mt-4 text-xs font-semibold text-slate-500">Next due</div>
                      {dueInvoice ? (
                        <>
                          <div className="mt-2 text-sm font-semibold text-slate-900">{(dueInvoice as any).title}</div>
                          <div className="mt-1 text-xs text-slate-600">
                            Due {fmtDate((dueInvoice as any).dueISO)} • {fmtMoney((((dueInvoice as any).balanceDue ?? (dueInvoice as any).amount) as number) ?? 0, "GBP")}
                          </div>
                        </>
                      ) : (
                        <div className="mt-2 text-sm text-slate-600">Nothing due right now.</div>
                      )}

                      {lastPayment ? (
                        <div className="mt-4 text-xs text-slate-600">
                          Last payment:{" "}
                          <span className="font-semibold text-slate-900">{fmtMoney(lastPayment.amount, lastPayment.currency || "GBP")}</span>
                          {lastPayment.method ? <span className="text-slate-500"> • {String(lastPayment.method).replace(/_/g, " ")}</span> : null}
                        </div>
                      ) : null}
                    </div>

                    {overdueOutstanding > 0 ? (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">Overdue</span>
                    ) : totalOutstanding > 0 ? (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">Due</span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">Clear</span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {dueInvoice && ((dueInvoice as any).status === "Unpaid" || (dueInvoice as any).status === "Overdue") ? (
                      <button
                        onClick={() => startCareflexRepayment((((dueInvoice as any).balanceDue ?? (dueInvoice as any).amount) as number) || 0)}
                        className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Make a repayment
                      </button>
                    ) : null}

                    <button
                      onClick={() => setTab("billing")}
                      className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
                    >
                      View billing
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Available CareFlex</div>
                      <div className="mt-2 text-xl font-semibold">{fmtMoney(careflexAvailable, "GBP")}</div>
                      <div className="mt-1 text-xs text-slate-600">
                        Used: <span className="font-semibold">{fmtMoney(totalOutstanding, "GBP")}</span> • Limit:{" "}
                        <span className="font-semibold">{fmtMoney(careflexLimit, "GBP")}</span> • Paid to date:{" "}
                        <span className="font-semibold">{fmtMoney(totalPaid, "GBP")}</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        Score: <span className="font-semibold">{(profile as any)?.eligibilityScore ?? "—"}</span> • Settle within{" "}
                        <span className="font-semibold">{(profile as any)?.careflexTermsDays ?? "—"}</span> days
                      </div>
                    </div>

                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold ring-1",
                        careflexEligible ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-amber-100"
                      )}
                    >
                      {careflexEligible ? "Eligible" : "Limited"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={useCareFlex}
                      disabled={!profile || !careflexEligible}
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm font-semibold ring-1",
                        profile && careflexEligible
                          ? "bg-white text-blue-700 ring-blue-200 hover:bg-blue-50"
                          : "bg-slate-50 text-slate-400 ring-slate-200 cursor-not-allowed"
                      )}
                    >
                      Use CareFlex
                    </button>

                    <button
                      onClick={() => setTab("billing")}
                      className="rounded-2xl bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
                    >
                      Terms & limits
                    </button>
                  </div>

                  {hasOverdue ? (
                    <div className="mt-3 text-xs font-semibold text-amber-700">
                      Overdue balance detected: Pay later is restricted for new bookings until overdue is cleared.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_22px_70px_rgba(2,8,23,.10)]">
              <div className="text-sm font-semibold">Records overview</div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { k: "Labs", v: counts.lab },
                  { k: "Imaging", v: counts.imaging },
                  { k: "Visit notes", v: counts.visit },
                  { k: "Prescriptions", v: counts.prescription },
                ].map((x) => (
                  <div key={x.k} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-xs font-semibold text-slate-500">{x.k}</div>
                    <div className="mt-2 text-2xl font-semibold">{x.v}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setTab("records")}
                className="mt-4 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Open Hospital Records
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Appointments */}
      {tab === "appointments" ? (
        <div className="mt-6 rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_22px_70px_rgba(2,8,23,.10)]">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <div className="text-sm font-semibold">Appointments</div>
              <div className="mt-1 text-xs text-slate-600">Book new appointments and track approvals.</div>
            </div>

            <button
              onClick={() => setBookOpen(true)}
              className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Book appointment
            </button>
          </div>

          <div className="px-6 py-5">
            {appts.length ? (
              <div className="grid gap-3">
                {apptsPage.map((a) => (
                  <div key={a.id} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">
                          {a.dept} — {a.clinician}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          {a.facility} • {fmtDate(a.startISO)} • {fmtTime(a.startISO)}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold ring-1", toneForStatus(a.status as any))}>
                            {a.status}
                          </span>

                          {a.paymentMethod ? (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                              {a.paymentMethod}
                            </span>
                          ) : null}

                          {typeof a.estimatedCostGBP === "number" ? (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                              Est: {fmtMoney(a.estimatedCostGBP, "GBP")}
                            </span>
                          ) : null}

                          {a.requestRef ? (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                              Ref: {a.requestRef}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <button
                        onClick={() => setTab("billing")}
                        className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
                      >
                        Billing
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyCard
                title="No appointments yet"
                body="Book a visit and manage billing."
                action={
                  <button
                    onClick={() => setBookOpen(true)}
                    className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Book appointment
                  </button>
                }
              />
            )}
          </div>
        </div>
      ) : null}

      {/* Records + Billing */}
      {tab === "records" ? <RecordsTab records={records} counts={counts} onOpenRecord={setOpenRecord} /> : null}

      {tab === "billing" ? (
        <BillingTab
          profile={profile}
          invoices={invoicesView}
          payments={payments}
          careflexEligible={careflexEligible}
          onMakeRepayment={(amountGBP: number) => startCareflexRepayment(amountGBP)}
          onUseCareflex={() => useCareFlex()}
          onViewInvoice={(id: string) => openInvoiceDetails(id)}
          onDownloadInvoice={(id: string, title?: string) => downloadInvoicePdf(id, title)}
          onViewCareflexDetails={() => setToast({ type: "info", message: "CareFlex details are shown in this tab." })}
          pendingRefByInvoiceId={pendingRefByInvoiceId}
        />
      ) : null}

      {/* Book appointment modal */}
      <AppointmentBookingModal
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        hasOverdue={hasOverdue}
        linkedAccountLabel={linkedAccount?.label ?? null}
        onPayLater={bookPayLater}
        onPayFromLinkedAccount={bookFromLinkedAccount}
      />

      {/* Approval flow modal */}
      {approvalOpen && approvalSubject ? (
        <ApprovalFlowModal
          open={approvalOpen}
          subject={approvalSubject}
          onClose={() => {
            setApprovalOpen(false);
            setApprovalSubject(null);
            setDraftAppt(null);
          }}
          onConfirm={async () => {
            if (approvalSubject.kind === "invoice_payment") {
              return await doSubmitInvoicePayment(approvalSubject.id);
            }
            if (approvalSubject.kind === "careflex_repayment") {
              return await doSubmitCareflexRepayment(approvalSubject.amount);
            }
            return await doBookFromLinkedAccount();
          }}
        />
      ) : null}

      {/* Record modal */}
      {openRecord ? (
        <RecordModal
          record={openRecord}
          onClose={() => setOpenRecord(null)}
          onDownload={() => downloadRecord(openRecord.id)}
          onCopyShareLink={() => shareRecord(openRecord.id)}
          onMessageCareTeam={() => messageCareTeam(openRecord.id)}
        />
      ) : null}

      {/* Invoice details modal (scroll-safe) */}
      {openInvoiceId ? (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-3 sm:p-4">
          <button className="absolute inset-0 bg-slate-950/45" onClick={() => setOpenInvoiceId(null)} aria-label="Close" />

          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[860px] max-h-[calc(100dvh-24px)] overflow-hidden rounded-[28px] bg-white ring-1 ring-slate-200 shadow-[0_40px_140px_rgba(2,8,23,.35)]"
          >
            <div className="flex max-h-[calc(100dvh-24px)] flex-col">
              <div className="shrink-0 border-b border-slate-100 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-500">Invoice</div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">Details</div>
                    <div className="mt-1 text-xs text-slate-600">Invoice ID: {openInvoiceId}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const inv = invoicesView.find((x) => x.id === openInvoiceId);
                        downloadInvoicePdf(openInvoiceId, (inv as any)?.title || "invoice");
                      }}
                      className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
                    >
                      Download PDF
                    </button>

                    <button
                      onClick={() => setOpenInvoiceId(null)}
                      className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5">
                {detailsBusy ? (
                  <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                    <div className="text-sm font-semibold text-slate-900">Loading invoice…</div>
                    <div className="mt-2 text-sm text-slate-600">Fetching details from backend.</div>
                  </div>
                ) : (
                  (() => {
                    const raw = invoiceDetails?.invoice ?? invoiceDetails;
                    if (!raw) {
                      return (
                        <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                          <div className="text-sm font-semibold text-slate-900">No invoice details</div>
                          <div className="mt-2 text-sm text-slate-600">Backend returned nothing for this invoice.</div>
                        </div>
                      );
                    }

                    const det = normalizeInvoiceDetailsAny(raw);
                    const quick = invoicesView.find((x) => x.id === openInvoiceId) as any;

                    const balance =
                      typeof det.balanceDue === "number"
                        ? det.balanceDue
                        : typeof quick?.balanceDue === "number"
                          ? quick.balanceDue
                          : det.total;

                    const canPayNow = !!linkedAccount && (det.status === "Unpaid" || det.status === "Overdue");

                    return (
                      <div className="grid gap-4">
                        <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-base font-semibold text-slate-900">{det.invoiceNo}</div>
                                <span className={cn("rounded-full px-3 py-1 text-xs font-semibold ring-1", invoiceStatusTone(det.status))}>
                                  {det.status}
                                </span>
                              </div>

                              <div className="mt-2 grid gap-1 text-xs text-slate-600">
                                {det.patientName ? (
                                  <div>
                                    <span className="font-semibold text-slate-700">Patient:</span> {det.patientName}
                                  </div>
                                ) : null}

                                {det.facility ? (
                                  <div>
                                    <span className="font-semibold text-slate-700">Facility:</span> {det.facility}
                                  </div>
                                ) : null}

                                <div>
                                  <span className="font-semibold text-slate-700">Issued:</span> {fmtDate(det.issuedAt)} •{" "}
                                  <span className="font-semibold text-slate-700">Due:</span> {fmtDate(det.dueDate)}
                                </div>

                                {det.paidAt ? (
                                  <div>
                                    <span className="font-semibold text-slate-700">Paid:</span> {fmtDate(det.paidAt)}
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200 min-w-[260px]">
                              <div className="text-xs font-semibold text-slate-500">Amount due</div>
                              <div className="mt-2 text-2xl font-semibold text-slate-900">{fmtMoney(balance as number, det.currency)}</div>

                              {typeof det.coveredAmount === "number" ? (
                                <div className="mt-2 text-xs text-slate-600">
                                  Covered: <span className="font-semibold text-slate-900">{fmtMoney(det.coveredAmount, det.currency)}</span>
                                </div>
                              ) : null}

                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  onClick={() => downloadInvoicePdf(openInvoiceId, det.invoiceNo)}
                                  className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
                                >
                                  Download
                                </button>

                                <button
                                  onClick={async () => {
                                    const ok = await safeCopy(det.invoiceNo);
                                    setToast(ok ? { type: "success", message: "Invoice number copied." } : { type: "error", message: "Copy failed." });
                                  }}
                                  className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                                >
                                  Copy No
                                </button>

                                <button
                                  onClick={() => {
                                    if (!canPayNow) {
                                      setToast({
                                        type: "info",
                                        message: linkedAccount ? "This invoice can’t be paid right now." : "Link an account first to pay now.",
                                      });
                                      return;
                                    }

                                    setApprovalSubject({
                                      kind: "invoice_payment",
                                      id: openInvoiceId,
                                      title: `Invoice payment — ${det.invoiceNo}`,
                                      amount: Number(balance) || det.total,
                                      currency: det.currency,
                                      subtitle: "Password confirmation required. Payment processes instantly.",
                                    });
                                    setApprovalOpen(true);
                                  }}
                                  disabled={!canPayNow}
                                  className={cn(
                                    "ml-auto rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                                    canPayNow ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600/60"
                                  )}
                                >
                                  Pay now
                                </button>
                              </div>

                              {!linkedAccount ? (
                                <div className="mt-2 text-[11px] font-semibold text-amber-700">No linked account found (pay now disabled).</div>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-3xl bg-white ring-1 ring-slate-200 overflow-hidden">
                          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <div className="text-sm font-semibold text-slate-900">Line items</div>
                            <div className="text-xs font-semibold text-slate-500">{det.items.length} item(s)</div>
                          </div>

                          {det.items.length ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs text-slate-600">
                                  <tr>
                                    <th className="px-5 py-3">Description</th>
                                    <th className="px-5 py-3 text-right">Qty</th>
                                    <th className="px-5 py-3 text-right">Unit</th>
                                    <th className="px-5 py-3 text-right">Amount</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {det.items.map((it, idx) => (
                                    <tr key={idx} className="bg-white">
                                      <td className="px-5 py-3">
                                        <div className="font-semibold text-slate-900">{it.description}</div>
                                        {it.code ? <div className="mt-0.5 text-xs text-slate-500">{it.code}</div> : null}
                                      </td>
                                      <td className="px-5 py-3 text-right font-semibold text-slate-900">{it.qty}</td>
                                      <td className="px-5 py-3 text-right text-slate-700">{fmtMoney(it.unitPrice, det.currency)}</td>
                                      <td className="px-5 py-3 text-right font-semibold text-slate-900">{fmtMoney(it.amount, det.currency)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="px-5 py-5 text-sm text-slate-600">No item breakdown returned by backend.</div>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <div className="w-full max-w-md rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                            <div className="flex items-center justify-between py-1 text-sm">
                              <span className="text-slate-600">Subtotal</span>
                              <span className="font-semibold text-slate-900">{fmtMoney(det.subtotal, det.currency)}</span>
                            </div>
                            <div className="flex items-center justify-between py-1 text-sm">
                              <span className="text-slate-600">Tax</span>
                              <span className="font-semibold text-slate-900">{fmtMoney(det.tax, det.currency)}</span>
                            </div>
                            <div className="my-3 h-px bg-slate-100" />
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-slate-900">Total</span>
                              <span className="text-base font-semibold text-slate-900">{fmtMoney(det.total, det.currency)}</span>
                            </div>

                            {typeof det.coveredAmount === "number" ? (
                              <div className="mt-2 flex items-center justify-between text-sm">
                                <span className="text-slate-600">Covered</span>
                                <span className="font-semibold text-slate-900">{fmtMoney(det.coveredAmount, det.currency)}</span>
                              </div>
                            ) : null}

                            {typeof det.balanceDue === "number" ? (
                              <div className="mt-1 flex items-center justify-between text-sm">
                                <span className="text-slate-600">Balance due</span>
                                <span className="font-semibold text-slate-900">{fmtMoney(det.balanceDue, det.currency)}</span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
