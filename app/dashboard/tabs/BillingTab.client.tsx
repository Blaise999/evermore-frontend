// app/dashboard/tabs/BillingTab.client.tsx
"use client";

import React, { useMemo, useState } from "react";

import type { Invoice, PatientProfile } from "../_model";
import { cn, fmtDate, fmtMoney, toneForStatus } from "../_model";

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

export default function BillingTab({
  profile,
  invoices,
  payments,
  careflexEligible,
  onMakeRepayment,
  onUseCareflex,
  onViewInvoice,
  onDownloadInvoice,
  onViewCareflexDetails,
  pendingRefByInvoiceId,
}: {
  profile: PatientProfile | null;
  invoices: Invoice[];
  payments: PaymentRow[];
  careflexEligible: boolean;
  onMakeRepayment: (amountEUR: number) => void;
  onUseCareflex: () => void;
  onViewInvoice: (invoiceId: string) => void;
  onDownloadInvoice: (invoiceId: string, title: string) => void;
  onViewCareflexDetails: () => void;
  pendingRefByInvoiceId: Record<string, string>;
}) {
  const CURRENCY = "EUR";

  const outstanding = useMemo(
    () =>
      invoices.filter((x) => {
        const bal = Number.isFinite(x.balanceDue) ? (x.balanceDue as number) : x.amount;
        return (x.status === "Unpaid" || x.status === "Overdue") && bal > 0;
      }),
    [invoices]
  );
  const history = useMemo(
    () => invoices.filter((x) => x.status === "Paid" || x.status === "Waived"),
    [invoices]
  );

  const totalOutstanding = useMemo(
    () =>
      outstanding.reduce((s, x) => {
        const bal = Number.isFinite(x.balanceDue) ? (x.balanceDue as number) : x.amount;
        return s + (Number.isFinite(bal) ? bal : 0);
      }, 0),
    [outstanding]
  );
  const totalOverdue = useMemo(
    () =>
      outstanding
        .filter((x) => x.status === "Overdue")
        .reduce((s, x) => {
          const bal = Number.isFinite(x.balanceDue) ? (x.balanceDue as number) : x.amount;
          return s + (Number.isFinite(bal) ? bal : 0);
        }, 0),
    [outstanding]
  );

  const recentPayments = useMemo(() => {
    const okStatuses = new Set(["approved", "paid", "completed", "success", "processed"]);
    return payments
      .slice()
      .sort((a, b) => new Date(b.createdISO).getTime() - new Date(a.createdISO).getTime())
      .filter((p) => okStatuses.has(String(p.status || "").toLowerCase()))
      .slice(0, 12);
  }, [payments]);

  // Fallback: if backend doesn't create PaymentRequest rows for instant payments,
  // we still show a receipt-like timeline based on paid invoices.
  const derivedPaymentsFromPaidInvoices = useMemo(() => {
    return invoices
      .filter((x) => x.status === "Paid")
      .slice()
      .sort((a, b) => new Date(b.createdISO).getTime() - new Date(a.createdISO).getTime())
      .slice(0, 12)
      .map((inv) => ({
        id: `inv_${inv.id}`,
        reference: inv.title,
        invoiceId: inv.id,
        currency: CURRENCY,
        amount: Number.isFinite(inv.amount) ? inv.amount : 0,
        status: "paid",
        method: "invoice",
        // Invoice type doesn't expose a paid timestamp yet. Use createdISO as a stable fallback.
        // If you later add `paidAt`/`paidISO` on the backend + normalizer, you can switch this.
        createdISO: inv.createdISO,
        title: "Invoice payment",
      }));
  }, [invoices]);


const totalPaid = useMemo(() => {
  const ok = new Set([
    "paid",
    "successful",
    "success",
    "completed",
    "approved",
    "succeeded",
    "settled",
    "processed",
  ]);

  const paidFromPayments = (payments || [])
    .filter((p) => ok.has(String((p as any)?.status ?? "").toLowerCase()))
    .reduce((s, p) => s + (Number.isFinite((p as any)?.amount) ? (p as any).amount : 0), 0);

  const paidInvoiceIds = new Set(
    (payments || [])
      .filter((p) => ok.has(String((p as any)?.status ?? "").toLowerCase()))
      .map((p) => String((p as any)?.invoiceId ?? ""))
      .filter(Boolean)
  );

  const paidFromInvoices = (invoices || [])
    .filter((inv) => (inv as any)?.status === "Paid" && !paidInvoiceIds.has(String((inv as any)?.id)))
    .reduce((s, inv) => s + (Number.isFinite((inv as any)?.amount) ? (inv as any).amount : 0), 0);

  return paidFromPayments + paidFromInvoices;
}, [payments, invoices]);

  const paymentsToRender = recentPayments.length ? recentPayments : derivedPaymentsFromPaidInvoices;

  const pendingPayments = useMemo(() => {
    return payments
      .slice()
      .sort((a, b) => new Date(b.createdISO).getTime() - new Date(a.createdISO).getTime())
      .filter((p) => String(p.status || "").toLowerCase() === "pending")
      .slice(0, 8);
  }, [payments]);

  // CareFlex is a pay-later facility (EUR)
  const careflexLimitEUR =
    Number.isFinite(profile?.careflexLimit) && (profile?.careflexLimit ?? 0) > 0
      ? (profile?.careflexLimit as number)
      : 5000;
  const availableEUR = Math.max(0, careflexLimitEUR - totalOutstanding);

  const [repay, setRepay] = useState<string>("");
  const repayAmountEUR = (() => {
    const cleaned = String(repay || "").replace(/[^0-9.+-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) && n > 0 ? n : NaN;
  })();

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
      {/* Left */}
      <div className="grid gap-4">
        {/* Summary */}
        <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_22px_70px_rgba(2,8,23,.10)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Billing</div>
              <div className="mt-1 text-xs text-slate-600">Your unpaid invoices add up here. Paid activity shows below.</div>
            </div>

            <div className="rounded-3xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <div className="text-xs font-semibold text-slate-500">Total outstanding</div>
              <div className="mt-1 text-xl font-semibold text-slate-900">{fmtMoney(totalOutstanding, CURRENCY)}</div>
              <div className="mt-1 text-xs text-slate-600">Paid to date: <span className="font-semibold text-slate-900">{fmtMoney(totalPaid, CURRENCY)}</span></div>
              {totalOverdue > 0 ? (
                <div className="mt-1 text-xs font-semibold text-amber-700">Overdue: {fmtMoney(totalOverdue, CURRENCY)}</div>
              ) : (
                <div className="mt-1 text-xs font-semibold text-slate-600">No overdue balance</div>
              )}
            </div>
          </div>
        </div>

        {/* Outstanding invoices (Pay later) */}
        <div className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_22px_70px_rgba(2,8,23,.10)]">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <div className="text-sm font-semibold">CareFlex invoices (Pay later)</div>
              <div className="mt-1 text-xs text-slate-600">These are the ones you still owe.</div>
            </div>
          </div>

          <div className="px-6 py-5">
            {outstanding.length ? (
              <div className="grid gap-3">
                {outstanding.map((inv) => (
                  <div key={inv.id} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">{inv.title}</div>
                        <div className="mt-1 text-xs text-slate-600">
                          Issued {fmtDate(inv.createdISO)} • Due {fmtDate(inv.dueISO)}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-semibold ring-1",
                              toneForStatus(inv.status as any)
                            )}
                          >
                            {inv.status}
                          </span>

                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                            Balance due: {fmtMoney(Number.isFinite(inv.balanceDue) ? (inv.balanceDue as number) : inv.amount, CURRENCY)}
                          </span>

                          {Number.isFinite(inv.covered) && (inv.covered as number) > 0 ? (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                              Covered {fmtMoney(inv.covered as number, CURRENCY)} / {fmtMoney(inv.amount, CURRENCY)}
                            </span>
                          ) : null}

                          {inv.status === "Unpaid" ? (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                              Payment: due
                            </span>
                          ) : null}

                          {inv.status === "Overdue" ? (
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                              Please settle
                            </span>
                          ) : null}

                          {pendingRefByInvoiceId[inv.id] ? (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                              Ref: {pendingRefByInvoiceId[inv.id]}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            const amt = Number.isFinite(inv.balanceDue) ? (inv.balanceDue as number) : inv.amount;
                            if (!Number.isFinite(amt) || amt <= 0) return;
                            onMakeRepayment(amt);
                          }}
                          className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Repay this amount
                        </button>
                        <button
                          onClick={() => onViewInvoice(inv.id)}
                          className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onDownloadInvoice(inv.id, inv.title)}
                          className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                        >
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
                <div className="text-sm font-semibold text-slate-900">No outstanding CareFlex invoices</div>
                <div className="mt-2 text-sm text-slate-600">
                  When you choose <span className="font-semibold">Pay later</span>, the invoice will appear here.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_22px_70px_rgba(2,8,23,.10)]">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <div className="text-sm font-semibold">Invoice history</div>
              <div className="mt-1 text-xs text-slate-600">Paid and waived items.</div>
            </div>
          </div>

          <div className="px-6 py-5">
            {history.length ? (
              <div className="grid gap-3">
                {history.map((inv) => (
                  <div key={inv.id} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">{inv.title}</div>
                        <div className="mt-1 text-xs text-slate-600">Issued {fmtDate(inv.createdISO)}</div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-semibold ring-1",
                              toneForStatus(inv.status as any)
                            )}
                          >
                            {inv.status}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                            {fmtMoney(inv.amount, CURRENCY)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onViewInvoice(inv.id)}
                          className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onDownloadInvoice(inv.id, inv.title)}
                          className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                        >
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
                <div className="text-sm font-semibold text-slate-900">No invoice history yet</div>
                <div className="mt-2 text-sm text-slate-600">After payments or visits, your receipts will appear here.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="grid gap-4">
        {/* Payments */}
        <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_22px_70px_rgba(2,8,23,.10)]">
          <div className="text-sm font-semibold">Payments (incl. linked account)</div>
          <div className="mt-1 text-xs text-slate-600">This shows any payments made instantly from your account.</div>

          {pendingPayments.length ? (
            <div className="mt-4 rounded-3xl bg-amber-50 p-4 ring-1 ring-amber-100">
              <div className="text-xs font-semibold text-amber-700">Pending</div>
              <div className="mt-1 text-xs text-amber-700">
                You have {pendingPayments.length} pending payment request{pendingPayments.length === 1 ? "" : "s"}.
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid gap-3">
            {paymentsToRender.length ? (
              paymentsToRender.map((p) => (
                <div key={p.id} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-500">{fmtDate(p.createdISO)}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {p.title || (p.invoiceId ? "Invoice payment" : "Payment")}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        Method: {p.method || "—"} • Status: {p.status}
                      </div>
                      {p.reference ? (
                        <div className="mt-2 text-xs font-semibold text-slate-600">Ref: {p.reference}</div>
                      ) : null}
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-900">{fmtMoney(p.amount, p.currency || CURRENCY)}</div>
                      {p.invoiceId ? (
                        <button
                          onClick={() => onViewInvoice(p.invoiceId as string)}
                          className="mt-2 rounded-2xl bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
                        >
                          View invoice
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <div className="text-sm font-semibold text-slate-900">No payments yet</div>
                <div className="mt-2 text-sm text-slate-600">
                  When you pay (linked account or by settling an invoice), the receipt shows here.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CareFlex */}
        <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_22px_70px_rgba(2,8,23,.10)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Evermore CareFlex</div>
              <div className="mt-1 text-xs text-slate-600">Pay later facility — limit up to €5,000.</div>
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

          <div className="mt-5 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <div className="text-xs font-semibold text-slate-500">CareFlex balance</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{fmtMoney(totalOutstanding, CURRENCY)}</div>

            <div className="mt-1 text-xs text-slate-600">
              Available: <span className="font-semibold">{fmtMoney(availableEUR, CURRENCY)}</span>
            </div>

            <div className="mt-2 text-xs text-slate-600">
              Limit: <span className="font-semibold">{fmtMoney(careflexLimitEUR, CURRENCY)}</span> • Score: <span className="font-semibold">{profile?.eligibilityScore ?? "—"}</span> • Terms: <span className="font-semibold">{profile?.careflexTermsDays ?? "—"}</span> days
            </div>
          </div>

          {/* Repayment */}
          <div className="mt-4 rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="text-sm font-semibold text-slate-900">Make a repayment</div>
            <div className="mt-1 text-xs text-slate-600">Pay any amount — we apply it to your oldest unpaid invoices first.</div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                value={repay}
                onChange={(e) => setRepay(e.target.value)}
                inputMode="decimal"
                placeholder="e.g. 60"
                className="w-[min(240px,100%)] rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <button
                onClick={() => {
                  if (!Number.isFinite(repayAmountEUR)) return;
                  onMakeRepayment(repayAmountEUR);
                  setRepay("");
                }}
                disabled={!Number.isFinite(repayAmountEUR) || repayAmountEUR <= 0}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-semibold text-white",
                  Number.isFinite(repayAmountEUR) && repayAmountEUR > 0
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-600/60 cursor-not-allowed"
                )}
              >
                Continue
              </button>
            </div>

            <div className="mt-3 text-xs text-slate-600">
              Tip: you can also click <span className="font-semibold">“Repay this amount”</span> on an invoice to prefill the exact balance.
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={onUseCareflex}
              disabled={!profile || !careflexEligible}
              className={cn(
                "rounded-2xl px-4 py-2.5 text-sm font-semibold ring-1",
                profile && careflexEligible ? "bg-white text-blue-700 ring-blue-200 hover:bg-blue-50" : "bg-slate-50 text-slate-400 ring-slate-200 cursor-not-allowed"
              )}
            >
              Use CareFlex
            </button>

            <button
              onClick={onViewCareflexDetails}
              className="rounded-2xl bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
            >
              Terms & limits
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
