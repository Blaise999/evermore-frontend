"use client";

import React from "react";
import type { HospitalRecord } from "./_model";
import { cn, fmtDate, fmtTime, pillForRecord, toneForStatus } from "./_model";

export default function RecordModal({
  record,
  onClose,
  onDownload,
  onCopyShareLink,
  onMessageCareTeam,
}: {
  record: HospitalRecord;
  onClose: () => void;
  onDownload: () => void;
  onCopyShareLink: () => void;
  onMessageCareTeam: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80]">
      <button className="absolute inset-0 bg-slate-950/45" onClick={onClose} aria-label="Close" />

      <div className="absolute left-1/2 top-1/2 w-[min(920px,calc(100%-24px))] -translate-x-1/2 -translate-y-1/2">
        <div className="overflow-hidden rounded-[28px] bg-white ring-1 ring-slate-200 shadow-[0_40px_140px_rgba(2,8,23,.35)]">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  {pillForRecord(record.type)}
                </span>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold ring-1",
                    toneForStatus(record.status)
                  )}
                >
                  {record.status}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {fmtDate(record.dateISO)} • {fmtTime(record.dateISO)}
                </span>
              </div>

              <div className="mt-2 text-lg font-semibold text-slate-900">{record.title}</div>
              {record.subtitle ? <div className="mt-1 text-sm text-slate-600">{record.subtitle}</div> : null}

              <div className="mt-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">{record.facility}</span> •{" "}
                <span>{record.clinician}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.2fr_.8fr]">
            <div className="px-6 py-5">
              <div className="text-sm font-semibold text-slate-900">Summary</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{record.summary}</p>

              {record.notes?.length ? (
                <>
                  <div className="mt-5 text-sm font-semibold text-slate-900">Notes</div>
                  <ul className="mt-2 space-y-2 text-sm text-slate-700">
                    {record.notes.map((n, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-2 h-2 w-2 rounded-full bg-blue-600/70" />
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {record.tags?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {record.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="border-t border-slate-100 px-6 py-5 lg:border-l lg:border-t-0">
              <div className="text-sm font-semibold text-slate-900">Actions</div>

              <div className="mt-4 grid gap-2">
                <button
                  onClick={onDownload}
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Download record
                </button>

                <button
                  onClick={onCopyShareLink}
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
                >
                  Copy share link
                </button>

                <button
                  onClick={onMessageCareTeam}
                  className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
                >
                  Message care team
                </button>
              </div>

              <div className="mt-5 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold text-slate-500">Security</div>
                <div className="mt-2 text-xs text-slate-600">
                  Access is protected by backend ACL + audit logs (requests recorded server-side).
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
