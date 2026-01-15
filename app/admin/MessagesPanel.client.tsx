"use client";

import React, { useEffect, useMemo, useState } from "react";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

type MessageStatus = "sent" | "failed" | "queued";

export type AdminMessage = {
  id: string;
  to: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt?: string | null;
  providerId?: string | null;
  error?: string | null;
};

type TemplateKey = "general" | "appointment" | "billing";

async function apiJson<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts?.headers || {}),
    },
    cache: "no-store",
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    const msg = data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

function defaultTemplate(kind: TemplateKey, name?: string) {
  const safeName = (name || "").trim() || "there";

  if (kind === "appointment") {
    return {
      subject: "Appointment update",
      message: `Hi ${safeName},

This is an update regarding your appointment. Please sign in to your Evermore portal to view details.

— Evermore Health`,
    };
  }

  if (kind === "billing") {
    return {
      subject: "Billing notice",
      message: `Hi ${safeName},

This is a billing notice from Evermore. Please sign in to your portal to review your invoices and outstanding balance.

— Evermore Health`,
    };
  }

  // general
  return {
    subject: "Welcome to Evermore",
    message: `Welcome, ${safeName} 👋

Your Evermore account is ready. You can sign in anytime to manage appointments, view records, and handle billing securely.

If you did not create an account, you can ignore this email.

— Evermore Health`,
  };
}

function formatWhen(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

function snippet(s: string, n = 140) {
  const x = String(s || "").trim().replace(/\s+/g, " ");
  return x.length > n ? x.slice(0, n - 1) + "…" : x;
}

export default function MessagesPanel({
  userId,
  userEmail,
  userName,
}: {
  userId: string;
  userEmail: string;
  userName?: string | null;
}) {
  const [items, setItems] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [template, setTemplate] = useState<TemplateKey>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // init from template
  useEffect(() => {
    const t = defaultTemplate(template, userName || undefined);
    setSubject(t.subject);
    setMessage(t.message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, userId]);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const res = await apiJson<{ ok: true; items: AdminMessage[] }>(`/api/admin/users/${userId}/messages`);
      setItems(res.items || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!userId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const canSend = useMemo(() => {
    return !!userEmail && subject.trim().length >= 2 && message.trim().length >= 2;
  }, [userEmail, subject, message]);

  async function send() {
    if (!canSend) return;
    setErr(null);
    setBusy(true);
    try {
      await apiJson<{ ok: true }>(`/api/admin/users/${userId}/messages/email`, {
        method: "POST",
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          templateId: template, // backend expects: "general" | "appointment" | "billing"
        }),
      });
      await load();
    } catch (e: any) {
      setErr(e?.message || "Failed to send message");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Compose */}
      <div className="rounded-3xl bg-white ring-1 ring-slate-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500">Messaging</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">Send a message</div>
            <div className="mt-1 text-sm text-slate-600">
              Recipient: <span className="font-semibold text-slate-900">{userEmail}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => load()}
              className={cn(
                "rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50",
                (loading || busy) && "opacity-70 cursor-not-allowed"
              )}
              disabled={loading || busy}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>

            <button
              type="button"
              onClick={send}
              disabled={!canSend || busy}
              className={cn(
                "rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.18)] transition hover:bg-blue-700",
                (!canSend || busy) && "opacity-60 cursor-not-allowed"
              )}
            >
              {busy ? "Sending…" : "Send"}
            </button>
          </div>
        </div>

        {err ? (
          <div className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
            {err}
          </div>
        ) : null}

        <div className="mt-4 grid gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="text-sm font-semibold text-slate-900">Compose</div>
            <div className="flex items-center gap-2">
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as TemplateKey)}
                className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
                title="Template"
              >
                <option value="general">General / Welcome</option>
                <option value="appointment">Appointment update</option>
                <option value="billing">Billing notice</option>
              </select>
              <div className="text-xs font-semibold text-slate-500">Templates fill the fields — you can edit.</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-600">Subject</div>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="Email subject"
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-600">Message</div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2 w-full min-h-[220px] rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="Write your message here…"
            />
            <div className="mt-2 text-xs text-slate-500">
              This sends as a branded Evermore email automatically — no HTML needed.
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="rounded-3xl bg-white ring-1 ring-slate-200 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">Message history</div>
          <div className="text-xs font-semibold text-slate-500">Latest {Math.min(items.length, 50)} shown</div>
        </div>

        <div className="mt-4 space-y-3">
          {loading && items.length === 0 ? <div className="text-sm text-slate-600">Loading…</div> : null}
          {!loading && items.length === 0 ? <div className="text-sm text-slate-600">No messages yet.</div> : null}

          {items.map((m) => (
            <div key={m.id} className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{m.subject}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-600">
                    To: {m.to}
                    {m.createdAt ? <span className="text-slate-400"> • </span> : null}
                    {m.createdAt ? <span className="text-slate-500">{formatWhen(m.createdAt)}</span> : null}
                  </div>
                </div>

                <div
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-extrabold",
                    m.status === "sent" && "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
                    m.status === "failed" && "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
                    m.status === "queued" && "bg-slate-200 text-slate-700 ring-1 ring-slate-300"
                  )}
                >
                  {m.status.toUpperCase()}
                </div>
              </div>

              <div className="mt-3 whitespace-pre-wrap text-sm text-slate-800">{snippet(m.message, 420)}</div>

              {m.status === "failed" && m.error ? (
                <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
                  {m.error}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
