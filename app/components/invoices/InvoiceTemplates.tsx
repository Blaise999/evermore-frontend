"use client";

import React, { useMemo } from "react";

type InvoiceItem = {
  code?: string;
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
};

export type Invoice = {
  _id: string;
  invoiceNo: string;
  currency: string; // "EUR"
  status: "paid" | "issued" | "overdue";
  issuedAt: string; // ISO
  dueDate: string; // ISO
  paidAt?: string; // ISO
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  coveredAmount?: number;
};

export type InvoiceBranding = {
  brandName: string;
  logoUrl?: string;
  accentHex?: string;
  addressLines?: string[];
  supportEmail?: string;
  supportPhone?: string;
  footerNote?: string;

  // optional, if you have them
  patientName?: string;
  patientEmail?: string;
  billToLabel?: string; // "Bill To"
  facilityLabel?: string; // "Facility"
  facilityName?: string;
};

function safeDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function safeMoney(currency: string, n: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
      Number.isFinite(n) ? n : 0
    );
  } catch {
    return `${(Number.isFinite(n) ? n : 0).toFixed(2)} ${currency}`;
  }
}

function statusTone(status: Invoice["status"]) {
  if (status === "paid")
    return "bg-emerald-500/12 text-emerald-200 ring-1 ring-emerald-400/20";
  if (status === "overdue")
    return "bg-rose-500/12 text-rose-200 ring-1 ring-rose-400/20";
  return "bg-sky-500/12 text-sky-200 ring-1 ring-sky-400/20";
}

function statusDot(status: Invoice["status"]) {
  if (status === "paid") return "bg-emerald-400";
  if (status === "overdue") return "bg-rose-400";
  return "bg-sky-400";
}

function shortId(id: string) {
  const s = String(id || "");
  if (s.length <= 10) return s;
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}

function clampHex(hex?: string) {
  const s = String(hex || "").trim();
  if (/^#([0-9a-fA-F]{3}){1,2}$/.test(s)) return s;
  return "#22c55e";
}

function sum(items: InvoiceItem[]) {
  return items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
}

export function InvoiceTemplate({
  invoice,
  branding,
}: {
  invoice: Invoice;
  branding: InvoiceBranding;
}) {
  const accent = clampHex(branding.accentHex);

  const computed = useMemo(() => {
    const lineSum = sum(invoice.items || []);
    const subtotal = Number.isFinite(invoice.subtotal) ? invoice.subtotal : lineSum;
    const tax = Number.isFinite(invoice.tax) ? invoice.tax : 0;
    const total = Number.isFinite(invoice.total) ? invoice.total : subtotal + tax;

    return {
      subtotal,
      tax,
      total,
      lineSum,
    };
  }, [invoice]);

  const dueBadge =
    invoice.status !== "paid"
      ? `${invoice.status === "overdue" ? "Overdue" : "Due"}: ${safeDate(
          invoice.dueDate
        )}`
      : `Paid: ${safeDate(invoice.paidAt)}`;

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Outer paper */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f14] text-white shadow-[0_16px_50px_rgba(0,0,0,.55)] print:rounded-none print:border-none print:bg-white print:text-black print:shadow-none">
        {/* subtle accent glow */}
        <div
          className="pointer-events-none absolute -top-24 right-[-140px] h-[320px] w-[320px] rounded-full opacity-30 blur-3xl print:hidden"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${accent}, transparent 60%)`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,.06),transparent_35%)] print:hidden" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] print:hidden" />

        {/* Header */}
        <div className="relative border-b border-white/10 px-6 py-6 print:border-black/10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            {/* Brand */}
            <div className="flex items-center gap-4">
              {branding.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={branding.logoUrl}
                  alt={branding.brandName}
                  className="h-12 w-12 rounded-2xl object-cover ring-1 ring-white/10 print:ring-black/10"
                />
              ) : (
                <div
                  className="h-12 w-12 rounded-2xl ring-1 ring-white/10 print:ring-black/10"
                  style={{ background: accent }}
                />
              )}

              <div>
                <div className="flex items-center gap-2">
                  <div className="text-xl font-semibold tracking-tight print:text-black">
                    {branding.brandName}
                  </div>

                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${statusTone(
                      invoice.status
                    )} print:border print:border-black/20 print:bg-white`}
                  >
                    <span className={`h-2 w-2 rounded-full ${statusDot(invoice.status)}`} />
                    {invoice.status.toUpperCase()}
                  </span>
                </div>

                <div className="mt-1 text-xs text-white/60 print:text-black/60">
                  {branding.addressLines?.length
                    ? branding.addressLines.join(" • ")
                    : "Evermore Billing"}
                </div>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="sm:text-right">
              <div className="text-xs text-white/60 print:text-black/60">Invoice</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight print:text-black">
                {invoice.invoiceNo}
              </div>

              <div className="mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 print:border-black/20 print:bg-white print:text-black/70">
                {dueBadge}
              </div>

              <div className="mt-2 text-[11px] text-white/50 print:text-black/50">
                Reference: {shortId(invoice._id)}
              </div>
            </div>
          </div>

          {/* Accent bar */}
          <div className="mt-6 h-[2px] w-full overflow-hidden rounded-full bg-white/10 print:bg-black/10">
            <div
              className="h-full w-[42%] rounded-full"
              style={{
                background: `linear-gradient(90deg, ${accent}, transparent)`,
              }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="relative grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-3">
          {/* Left: Bill To */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 print:border-black/10 print:bg-white">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/60 print:text-black/60">
              {branding.billToLabel ?? "Bill To"}
            </div>

            <div className="mt-3 space-y-1">
              <div className="text-base font-semibold">
                {branding.patientName ?? "Patient"}
              </div>
              {branding.patientEmail ? (
                <div className="text-sm text-white/70 print:text-black/70">
                  {branding.patientEmail}
                </div>
              ) : null}
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/60 print:text-black/60">Issued</span>
                <span className="font-medium">{safeDate(invoice.issuedAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 print:text-black/60">Due</span>
                <span className="font-medium">{safeDate(invoice.dueDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 print:text-black/60">Currency</span>
                <span className="font-medium">{invoice.currency}</span>
              </div>
            </div>
          </div>

          {/* Middle: Facility/Support */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 print:border-black/10 print:bg-white">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/60 print:text-black/60">
              {branding.facilityLabel ?? "Facility"}
            </div>

            <div className="mt-3 space-y-1">
              <div className="text-base font-semibold">
                {branding.facilityName ?? branding.brandName}
              </div>
              <div className="text-sm text-white/70 print:text-black/70">
                {branding.addressLines?.[0] ?? "—"}
              </div>
            </div>

            <div className="mt-5 h-px bg-white/10 print:bg-black/10" />

            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/60 print:text-black/60">
                Support
              </div>
              <div className="mt-2 space-y-1 text-sm text-white/80 print:text-black/80">
                {branding.supportEmail ? <div>{branding.supportEmail}</div> : <div>—</div>}
                {branding.supportPhone ? <div>{branding.supportPhone}</div> : null}
              </div>
            </div>
          </div>

          {/* Right: Total Summary */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 print:border-black/10 print:bg-white">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/60 print:text-black/60">
              Amount Due
            </div>

            <div className="mt-2 flex items-end justify-between gap-3">
              <div className="text-3xl font-semibold tracking-tight">
                {safeMoney(invoice.currency, computed.total)}
              </div>
              <div
                className="h-10 w-10 rounded-2xl ring-1 ring-white/10 print:ring-black/10"
                style={{ background: accent }}
              />
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/60 print:text-black/60">Subtotal</span>
                <span className="font-medium">
                  {safeMoney(invoice.currency, computed.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 print:text-black/60">Tax</span>
                <span className="font-medium">
                  {safeMoney(invoice.currency, computed.tax)}
                </span>
              </div>
              <div className="h-px bg-white/10 print:bg-black/10" />
              <div className="flex items-center justify-between">
                <span className="text-white/60 print:text-black/60">Total</span>
                <span className="font-semibold">
                  {safeMoney(invoice.currency, computed.total)}
                </span>
              </div>

              {typeof invoice.coveredAmount === "number" ? (
                <div className="mt-2 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs print:border-black/10 print:bg-black/5">
                  <span className="text-white/60 print:text-black/60">Covered</span>
                  <span className="font-semibold">
                    {safeMoney(invoice.currency, invoice.coveredAmount)}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="relative px-6 pb-6">
          <div className="overflow-hidden rounded-2xl border border-white/10 print:border-black/10">
            <div className="flex items-center justify-between bg-white/5 px-4 py-3 print:bg-black/5">
              <div className="text-sm font-semibold">Line items</div>
              <div className="text-xs text-white/60 print:text-black/60">
                {invoice.items?.length ?? 0} item(s)
              </div>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs text-white/70 print:bg-black/5 print:text-black/70">
                <tr>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Unit</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 print:divide-black/10">
                {invoice.items.map((it, idx) => (
                  <tr key={idx} className="bg-[#0b0f14] print:bg-white">
                    <td className="px-4 py-3">
                      <div className="font-medium">{it.description}</div>
                      {it.code ? (
                        <div className="mt-0.5 text-xs text-white/50 print:text-black/50">
                          {it.code}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right">{it.qty}</td>
                    <td className="px-4 py-3 text-right">
                      {safeMoney(invoice.currency, it.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {safeMoney(invoice.currency, it.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl text-xs text-white/55 print:text-black/55">
              {branding.footerNote ??
                "If you have questions about this invoice, contact support. Keep this invoice for your records."}
            </div>

            <div className="text-xs text-white/50 print:hidden">
              Tip: hook your Download button to{" "}
              <code className="text-white/70">/api/portal/invoices/[id]/pdf</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
