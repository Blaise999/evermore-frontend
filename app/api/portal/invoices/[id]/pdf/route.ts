// app/api/portal/invoices/[id]/pdf/route.ts
//
// Designed invoice PDF (HTML -> PDF via headless Chromium)
// Falls back to lightweight placeholder PDF if Chromium/Puppeteer fails

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  joinUpstream,
  getUpstreamBase,
  noStoreHeaders,
  SESSION_COOKIE_NAME,
} from "../../../../../libs/upstream";
import { logAndMapError } from "../../../../../libs/errorMapper";

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------------------------------- */
/* Fallback placeholder PDF (always works) */
/* ---------------------------------- */
function escapePdfText(s: string) {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\r\n]+/g, " ");
}

function buildSimplePdf(lines: string[]) {
  const safeLines = lines.map(escapePdfText);

  const fontObj = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  const contentLines: string[] = [];
  contentLines.push("BT");
  contentLines.push("/F1 14 Tf");
  contentLines.push("72 750 Td");

  safeLines.forEach((ln, idx) => {
    if (idx > 0) contentLines.push("0 -18 Td");
    contentLines.push(`(${ln}) Tj`);
  });

  contentLines.push("ET");

  const stream = contentLines.join("\n") + "\n";
  const streamLen = Buffer.byteLength(stream, "utf8");

  const objs: string[] = [];
  objs[1] = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj";
  objs[2] = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj";
  objs[3] =
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj";
  objs[4] = `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}endstream\nendobj`;
  objs[5] = `5 0 obj\n${fontObj}\nendobj`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  offsets[0] = 0;

  for (let i = 1; i <= 5; i++) {
    offsets[i] = Buffer.byteLength(pdf, "utf8");
    pdf += objs[i] + "\n";
  }

  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 6\n`;
  pdf += `0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) {
    const off = String(offsets[i]).padStart(10, "0");
    pdf += `${off} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

/* ---------------------------------- */
/* HTML invoice template */
/* ---------------------------------- */
function escapeHtml(s: any) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fmtDate(iso: any) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function fmtMoney(currency: string, n: any) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "GBP",
    }).format(num);
  } catch {
    return `${num.toFixed(2)} ${currency || ""}`.trim();
  }
}

function pickInvoiceNo(invoice: any, id: string) {
  return (
    invoice?.invoiceNo ??
    invoice?.invoice_no ??
    invoice?.number ??
    invoice?.invoiceNumber ??
    `INV-${String(id).slice(-8).toUpperCase()}`
  );
}

function normalizeCurrency(invoice: any) {
  return String(invoice?.currency ?? "GBP").toUpperCase();
}

function normalizeItems(invoice: any) {
  const raw = Array.isArray(invoice?.items) ? invoice.items : [];
  return raw
    .map((it: any) => ({
      code: it?.code ?? "",
      description: it?.description ?? it?.name ?? "Item",
      qty: Number(it?.qty ?? it?.quantity ?? 1) || 1,
      unitPrice: Number(it?.unitPrice ?? it?.unit_price ?? it?.price ?? 0) || 0,
      amount: Number(it?.amount ?? it?.total ?? 0) || 0,
    }))
    .filter((it: any) => it.description);
}

function computeTotals(invoice: any, items: any[]) {
  const subtotal =
    invoice?.subtotal ??
    invoice?.subTotal ??
    invoice?.amountSubtotal ??
    items.reduce((s, it) => s + (Number(it.amount) || 0), 0);

  const tax = invoice?.tax ?? invoice?.vat ?? 0;

  const total =
    invoice?.total ??
    invoice?.amountTotal ??
    invoice?.amount_total ??
    invoice?.amount ??
    (Number(subtotal) || 0) + (Number(tax) || 0);

  return {
    subtotal: Number(subtotal) || 0,
    tax: Number(tax) || 0,
    total: Number(total) || 0,
  };
}

function normalizeStatus(invoice: any) {
  const st = String(invoice?.status ?? "").toLowerCase();
  if (st === "paid") return "paid";
  if (st === "overdue") return "overdue";
  if (st === "issued") return "issued";
  return invoice?.paidAt ? "paid" : "issued";
}

function invoiceHtml(opts: {
  invoice: any;
  id: string;
  branding: {
    brandName: string;
    logoUrl?: string;
    accentHex?: string;
    addressLines?: string[];
    supportEmail?: string;
    supportPhone?: string;
    footerNote?: string;
  };
}) {
  const { invoice, id, branding } = opts;

  const currency = normalizeCurrency(invoice);
  const items = normalizeItems(invoice);
  const totals = computeTotals(invoice, items);

  const invoiceNo = pickInvoiceNo(invoice, id);
  const status = normalizeStatus(invoice);

  const issuedAt =
    invoice?.issuedAt ?? invoice?.createdAt ?? invoice?.created_at ?? null;
  const dueDate = invoice?.dueDate ?? invoice?.dueISO ?? invoice?.dueAt ?? null;
  const paidAt = invoice?.paidAt ?? invoice?.paid_at ?? null;

  const accent = branding.accentHex ?? "#22c55e";
  const brandName = branding.brandName ?? "Evermore Hospitals";

  const statusClass =
    status === "paid"
      ? "pill paid"
      : status === "overdue"
      ? "pill overdue"
      : "pill issued";

  const logoBlock = branding.logoUrl
    ? `<img class="logo" src="${escapeHtml(branding.logoUrl)}" alt="${escapeHtml(
        brandName
      )}" />`
    : `<div class="brandDot" aria-hidden="true"></div>`;

  const address = (branding.addressLines ?? []).filter(Boolean).join(" - ");

  const supportEmail = branding.supportEmail ? escapeHtml(branding.supportEmail) : "";
  const supportPhone = branding.supportPhone ? escapeHtml(branding.supportPhone) : "";
  const footerNote = branding.footerNote
    ? escapeHtml(branding.footerNote)
    : "Payment due within 30 days. Thank you for choosing Evermore.";

  const rows =
    items.length > 0
      ? items
          .map(
            (it: any) => `
      <tr>
        <td>
          <div class="desc">${escapeHtml(it.description)}</div>
          ${
            it.code
              ? `<div class="code">${escapeHtml(it.code)}</div>`
              : `<div class="code">&nbsp;</div>`
          }
        </td>
        <td class="right">${escapeHtml(it.qty)}</td>
        <td class="right">${escapeHtml(fmtMoney(currency, it.unitPrice))}</td>
        <td class="right">${escapeHtml(fmtMoney(currency, it.amount))}</td>
      </tr>`
          )
          .join("")
      : `<tr><td colspan="4" style="text-align:center;color:#888;">No line items</td></tr>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fa; padding: 24px; }
    .card { background: #fff; border-radius: 18px; max-width: 640px; margin: 0 auto; padding: 28px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brandDot { width: 36px; height: 36px; border-radius: 50%; background: ${accent}; }
    .logo { width: 36px; height: 36px; object-fit: contain; }
    .brandName { font-weight: 900; font-size: 15px; color: #0b1220; }
    .muted { color: #667085; font-size: 12px; }
    .invTitle { text-align: right; }
    .invTitle .label { font-size: 12px; color: #667085; }
    .invTitle .no { font-weight: 1000; font-size: 18px; color: #0b1220; }
    .pill { display: inline-block; margin-top: 6px; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .pill.paid { background: #d1fae5; color: #047857; }
    .pill.overdue { background: #fee2e2; color: #b91c1c; }
    .pill.issued { background: #e0e7ff; color: #4338ca; }
    .meta { display: flex; gap: 16px; margin-top: 20px; flex-wrap: wrap; }
    .box { flex: 1; min-width: 200px; background: #fafbff; border: 1px solid #eef0f4; border-radius: 14px; padding: 12px; }
    .box .row { display: flex; justify-content: space-between; gap: 10px; margin-top: 6px; }
    .box .k { color: #667085; font-size: 12px; }
    .box .v { font-weight: 900; font-size: 12.5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; border: 1px solid #eef0f4; border-radius: 14px; overflow: hidden; }
    thead th { background: #fafbff; color: #667085; font-size: 12px; text-align: left; padding: 10px 12px; border-bottom: 1px solid #eef0f4; }
    tbody td { padding: 10px 12px; border-bottom: 1px solid #eef0f4; font-size: 13px; vertical-align: top; }
    tbody tr:last-child td { border-bottom: none; }
    .right { text-align: right; }
    .desc { font-weight: 900; color: #0b1220; }
    .code { color: #667085; font-size: 12px; margin-top: 2px; }
    .totals { margin-top: 14px; display: flex; justify-content: flex-end; }
    .totalBox { width: 320px; border: 1px solid #eef0f4; border-radius: 14px; padding: 12px; }
    .line { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
    .strong { font-weight: 1000; }
    .divider { height: 1px; background: #eef0f4; margin: 8px 0; }
    .foot { margin-top: 14px; border-top: 1px dashed #eef0f4; padding-top: 12px; display: flex; justify-content: space-between; gap: 14px; }
    .foot .note { font-size: 12px; color: #667085; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="top">
      <div class="brand">
        ${logoBlock}
        <div>
          <div class="brandName">${escapeHtml(brandName)}</div>
          <div class="muted">${escapeHtml(address || "Billing Department")}</div>
        </div>
      </div>

      <div class="invTitle">
        <div class="label">Invoice</div>
        <div class="no">${escapeHtml(invoiceNo)}</div>
        <div class="${statusClass}">${escapeHtml(String(status).toUpperCase())}</div>
      </div>
    </div>

    <div class="meta">
      <div class="box">
        <div class="muted">Invoice details</div>
        <div class="row"><div class="k">Invoice ID</div><div class="v">${escapeHtml(id)}</div></div>
        <div class="row"><div class="k">Issued</div><div class="v">${escapeHtml(fmtDate(issuedAt))}</div></div>
        <div class="row"><div class="k">Due</div><div class="v">${escapeHtml(fmtDate(dueDate))}</div></div>
        <div class="row"><div class="k">Paid</div><div class="v">${escapeHtml(fmtDate(paidAt))}</div></div>
      </div>

      <div class="box">
        <div class="muted">Support</div>
        <div class="row"><div class="k">Email</div><div class="v">${supportEmail || "—"}</div></div>
        <div class="row"><div class="k">Phone</div><div class="v">${supportPhone || "—"}</div></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="right">Qty</th>
          <th class="right">Unit</th>
          <th class="right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="totals">
      <div class="totalBox">
        <div class="line"><span class="muted">Subtotal</span><span class="strong">${escapeHtml(
          fmtMoney(currency, totals.subtotal)
        )}</span></div>
        <div class="line"><span class="muted">Tax</span><span class="strong">${escapeHtml(
          fmtMoney(currency, totals.tax)
        )}</span></div>
        <div class="divider"></div>
        <div class="line"><span class="strong">Total</span><span class="strong">${escapeHtml(
          fmtMoney(currency, totals.total)
        )}</span></div>
      </div>
    </div>

    <div class="foot">
      <div class="note">${escapeHtml(footerNote)}</div>
      <div class="note"><span class="strong">${escapeHtml(currency)}</span></div>
    </div>
  </div>
</body>
</html>`;
}

/* ---------------------------------- */
/* Invoice fetch helpers */
/* ---------------------------------- */
async function tryFetchInvoiceFromBackend(token: string, id: string) {
  const candidates = [
    `/api/patient/invoices/${encodeURIComponent(id)}`,
    `/api/patient/invoice/${encodeURIComponent(id)}`,
  ];

  for (const path of candidates) {
    try {
      const url = joinUpstream(path);
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });
      if (!res.ok) continue;
      return await res.json();
    } catch {
      // try next
    }
  }

  return null;
}

function makeFallbackLines(id: string, invoice: any | null) {
  const invoiceNo = pickInvoiceNo(invoice ?? {}, id);
  const currency = normalizeCurrency(invoice ?? {});
  const items = normalizeItems(invoice ?? {});
  const totals = computeTotals(invoice ?? {}, items);
  const status = normalizeStatus(invoice ?? {});
  const issuedAt =
    invoice?.issuedAt ?? invoice?.createdAt ?? invoice?.created_at ?? null;
  const dueDate = invoice?.dueDate ?? invoice?.dueISO ?? invoice?.dueAt ?? null;
  const paidAt = invoice?.paidAt ?? invoice?.paid_at ?? null;

  return [
    "Evermore Hospitals - Invoice",
    "",
    `Invoice ID: ${String(id)}`,
    `Invoice No: ${String(invoiceNo)}`,
    `Status: ${String(status)}`,
    `Total: ${String(totals.total)} ${currency}`,
    issuedAt ? `Issued: ${String(issuedAt)}` : "Issued: —",
    dueDate ? `Due: ${String(dueDate)}` : "Due: —",
    paidAt ? `Paid: ${String(paidAt)}` : "Paid: —",
    "",
    "(Fallback placeholder PDF.)",
  ];
}

/* ---------------------------------- */
/* Route */
/* ---------------------------------- */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;

  let invoice: any | null = null;

  try {
    if (token) {
      // 1) Try direct invoice endpoint (if available)
      invoice = await tryFetchInvoiceFromBackend(token, id);

      // 2) Fallback: dashboard invoices list
      if (!invoice) {
        const dashUrl = joinUpstream("/api/patient/dashboard");
        const dashRes = await fetch(dashUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (dashRes.ok) {
          const dash = await dashRes.json();
          const invoices: any[] = Array.isArray(dash?.invoices) ? dash.invoices : [];
          invoice =
            invoices.find((inv) => String(inv?._id ?? inv?.id ?? "") === String(id)) ??
            null;
        }
      }
    }
  } catch (err) {
    logAndMapError("portal/invoices/pdf", err);
    invoice = null;
  }

  const invoiceNo = pickInvoiceNo(invoice ?? {}, id);

  const branding = {
    brandName: "Evermore Hospitals",
    accentHex: "#22c55e",
    addressLines: ["Evermore House, London", "United Kingdom"],
    supportEmail: "billing@evermore.health",
    supportPhone: "+44 20 0000 0000",
    footerNote: "Payment due within 30 days. Keep this receipt for your records.",
  };

  // Try designed PDF first
  try {
    const html = invoiceHtml({ invoice: invoice ?? {}, id, branding });

    // Vercel / serverless Linux:
    const executablePath =
      process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath());

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBytes = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "16mm", right: "14mm", bottom: "16mm", left: "14mm" },
      });

      const body = Buffer.from(pdfBytes);

      return new Response(body, {
        status: 200,
        headers: {
          ...noStoreHeaders(),
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=${escapePdfText(
            invoiceNo
          )}.pdf`,
        },
      });
    } finally {
      await browser.close();
    }
  } catch (err) {
    logAndMapError("portal/invoices/pdf/puppeteer", err);

    // Always-working fallback placeholder PDF
    const pdfBytes = buildSimplePdf(makeFallbackLines(id, invoice));

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...noStoreHeaders(),
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${escapePdfText(invoiceNo)}.pdf`,
      },
    });
  }
}
