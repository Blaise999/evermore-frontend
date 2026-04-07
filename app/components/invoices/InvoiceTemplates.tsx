"use client";

import React from "react";

type InvoiceItem = {
  code?: string;
  description: string;
  ailment?: string;
  qty: number;
  unitPrice: number;
  amount: number;
};

export type Invoice = {
  _id: string;
  invoiceNo: string;
  currency: string;
  status: "paid" | "issued" | "overdue" | "partial" | "void";
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  ailment?: string;
  diagnosis?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  coveredAmount?: number;
  careflexApplied?: number;
};

export type InvoiceBranding = {
  brandName: string;
  logoUrl?: string;
  accentHex?: string;
  addressLines?: string[];
  supportEmail?: string;
  supportPhone?: string;
  footerNote?: string;
  patientName?: string;
  patientEmail?: string;
  patientId?: string;
  billToLabel?: string;
  facilityLabel?: string;
  facilityName?: string;
};

function safeDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "2-digit" });
}

function safeMoney(currency: string, n: number) {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(
      Number.isFinite(n) ? n : 0
    );
  } catch {
    return `£${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
  }
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  paid: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Paid" },
  issued: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Unpaid" },
  overdue: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "Overdue" },
  partial: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Partial" },
  void: { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400", label: "Void" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.issued;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function InvoiceTemplate({
  invoice,
  branding,
}: {
  invoice: Invoice;
  branding: InvoiceBranding;
}) {
  const cur = invoice.currency || "GBP";
  const coveredAmount = Number(invoice.coveredAmount) || 0;
  const balanceDue = Math.max(0, (invoice.total || 0) - coveredAmount);
  const brandColor = branding.accentHex || "#1E3A8A";

  return (
    <div className="receipt max-w-[680px] mx-auto" id="invoice-printable">
      {/* ===== Header ===== */}
      <div className="receipt-header relative" style={{ background: brandColor }}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
              {branding.brandName || "Evermore Hospitals"}
            </h1>
            <div className="mt-1 text-white/60 text-xs space-y-0.5">
              {(branding.addressLines || ["145 Harley Street", "London, W1G 6BJ"]).map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
          <div className="text-right">
            <StatusBadge status={invoice.status} />
            <div className="mt-3 text-white/80 text-xs">
              <div className="text-white/50 text-[10px] uppercase tracking-widest mb-0.5">Invoice No.</div>
              <div className="font-mono font-semibold text-sm">{invoice.invoiceNo || "—"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Body ===== */}
      <div className="receipt-body space-y-6">
        {/* Two-column info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Bill To</div>
            <div className="text-sm font-semibold text-gray-900">{branding.patientName || "Patient"}</div>
            {branding.patientEmail && <div className="text-xs text-gray-500 mt-0.5">{branding.patientEmail}</div>}
            {branding.patientId && <div className="text-xs text-gray-400 mt-0.5 font-mono">ID: {branding.patientId}</div>}
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Details</div>
            <div className="space-y-1 text-xs">
              <div><span className="text-gray-400">Issued:</span> <span className="text-gray-700 font-medium">{safeDate(invoice.issuedAt)}</span></div>
              <div><span className="text-gray-400">Due:</span> <span className="text-gray-700 font-medium">{safeDate(invoice.dueDate)}</span></div>
              {invoice.paidAt && (
                <div><span className="text-gray-400">Paid:</span> <span className="text-emerald-600 font-medium">{safeDate(invoice.paidAt)}</span></div>
              )}
            </div>
          </div>
        </div>

        {/* Ailment / Diagnosis */}
        {(invoice.ailment || invoice.diagnosis) && (
          <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-blue-500 font-semibold">Diagnosis / Ailment</div>
              <div className="text-sm text-gray-800 mt-0.5">
                {[invoice.ailment, invoice.diagnosis].filter(Boolean).join(" — ")}
              </div>
            </div>
          </div>
        )}

        {/* Line Items */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ background: brandColor }}>
                <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-widest text-white/80 font-semibold">Description</th>
                <th className="text-center px-3 py-2.5 text-[10px] uppercase tracking-widest text-white/80 font-semibold w-16">Qty</th>
                <th className="text-right px-3 py-2.5 text-[10px] uppercase tracking-widest text-white/80 font-semibold w-24">Price</th>
                <th className="text-right px-4 py-2.5 text-[10px] uppercase tracking-widest text-white/80 font-semibold w-24">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-800">{item.description}</div>
                    {item.code && <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.code}</div>}
                  </td>
                  <td className="text-center px-3 py-3 text-sm text-gray-600">{item.qty}</td>
                  <td className="text-right px-3 py-3 text-sm text-gray-600">{safeMoney(cur, item.unitPrice)}</td>
                  <td className="text-right px-4 py-3 text-sm font-semibold text-gray-800">{safeMoney(cur, item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{safeMoney(cur, invoice.subtotal)}</span>
            </div>
            {(invoice.tax || 0) > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>VAT / Tax</span>
                <span>{safeMoney(cur, invoice.tax)}</span>
              </div>
            )}
            {coveredAmount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  CareFlex Covered
                </span>
                <span>−{safeMoney(cur, coveredAmount)}</span>
              </div>
            )}
            <div className="h-px bg-gray-200 my-1" />
            <div className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ background: brandColor }}>
              <span className="text-white/80 text-sm font-medium">Total Due</span>
              <span className="text-white text-lg font-bold">{safeMoney(cur, balanceDue)}</span>
            </div>
          </div>
        </div>

        {/* CareFlex note */}
        {coveredAmount > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="text-sm text-emerald-800">
              <span className="font-semibold">{safeMoney(cur, coveredAmount)}</span> of this invoice was covered by your CareFlex credit line.
            </div>
          </div>
        )}
      </div>

      {/* ===== Footer ===== */}
      <div className="receipt-footer text-center space-y-1">
        <p className="text-xs text-gray-400">
          Thank you for choosing {branding.brandName || "Evermore Hospitals"}. This invoice was generated electronically and is valid without a signature.
        </p>
        <p className="text-[10px] text-gray-300">
          {branding.supportPhone || "+44 20 7946 0958"} • {branding.supportEmail || "billing@evermore.health"} • Invoice {invoice.invoiceNo}
        </p>
      </div>
    </div>
  );
}

/* ===== Compact invoice card for lists ===== */
export function InvoiceCard({
  invoice,
  currency = "GBP",
  onView,
  onPay,
  onDownload,
}: {
  invoice: Invoice;
  currency?: string;
  onView?: () => void;
  onPay?: () => void;
  onDownload?: () => void;
}) {
  const cfg = statusConfig[invoice.status] || statusConfig.issued;
  const balanceDue = Math.max(0, (invoice.total || 0) - (Number(invoice.coveredAmount) || 0));
  const isOverdue = invoice.status === "issued" && new Date(invoice.dueDate) < new Date();

  return (
    <div className="card p-4 hover:border-gray-300 transition-all group cursor-pointer" onClick={onView}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-400">{invoice.invoiceNo}</span>
          <StatusBadge status={isOverdue ? "overdue" : invoice.status} />
        </div>
        <span className="text-lg font-bold text-gray-900">{safeMoney(currency, invoice.total)}</span>
      </div>

      {invoice.ailment && (
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {invoice.ailment}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Issued {safeDate(invoice.issuedAt)} • Due {safeDate(invoice.dueDate)}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onPay && balanceDue > 0 && invoice.status !== "paid" && invoice.status !== "void" && (
            <button onClick={(e) => { e.stopPropagation(); onPay(); }} className="btn btn-sm btn-accent">Pay</button>
          )}
          {onDownload && (
            <button onClick={(e) => { e.stopPropagation(); onDownload(); }} className="btn btn-sm btn-ghost">PDF</button>
          )}
        </div>
      </div>

      {/* Coverage bar */}
      {invoice.total > 0 && Number(invoice.coveredAmount) > 0 && invoice.status !== "paid" && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Covered: {safeMoney(currency, Number(invoice.coveredAmount))}</span>
            <span>Due: {safeMoney(currency, balanceDue)}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill bg-emerald-400"
              style={{ width: `${Math.min(100, (Number(invoice.coveredAmount) / invoice.total) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
