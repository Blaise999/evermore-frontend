"use client";

import React, { useMemo, useState } from "react";
import type { HospitalRecord, RecordType } from "../_model";
import { cn, fmtDate, fmtTime, pillForRecord, toneForStatus } from "../_model";

function EmptyCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-slate-600">{body}</div>
    </div>
  );
}

export default function RecordsTab({
  records,
  counts,
  onOpenRecord,
}: {
  records: HospitalRecord[];
  counts: Record<RecordType, number>;
  onOpenRecord: (r: HospitalRecord) => void;
}) {
  const [recordFilter, setRecordFilter] = useState<RecordType | "all">("all");
  const [q, setQ] = useState("");

  const filteredRecords = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return records
      .filter((r) => (recordFilter === "all" ? true : r.type === recordFilter))
      .filter((r) => {
        if (!qq) return true;
        const hay = [
          r.title,
          r.subtitle,
          r.facility,
          r.clinician,
          r.status,
          r.summary,
          ...(r.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(qq);
      })
      .slice()
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
  }, [records, recordFilter, q]);

  return (
    <div className="mt-6 rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_22px_70px_rgba(2,8,23,.10)]">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">Hospital Records</div>
            <div className="mt-1 text-xs text-slate-600">
              Labs, imaging, visit summaries, prescriptions, and documents.
            </div>
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search records…"
            className="w-[min(420px,70vw)] rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              { key: "all", label: "All" },
              { key: "lab", label: `Labs (${counts.lab})` },
              { key: "imaging", label: `Imaging (${counts.imaging})` },
              { key: "visit", label: `Visit notes (${counts.visit})` },
              { key: "prescription", label: `Prescriptions (${counts.prescription})` },
              { key: "document", label: `Documents (${counts.document})` },
            ] as const
          ).map((x) => (
            <button
              key={x.key}
              onClick={() => setRecordFilter(x.key as any)}
              className={cn(
                "rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition",
                recordFilter === (x.key as any)
                  ? "bg-blue-600 text-white ring-blue-600"
                  : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
              )}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-5">
        {filteredRecords.length ? (
          <div className="grid gap-3">
            {filteredRecords.map((r) => (
              <button
                key={r.id}
                onClick={() => onOpenRecord(r)}
                className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200 hover:bg-white transition text-left"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        {pillForRecord(r.type)}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold ring-1",
                          toneForStatus(r.status)
                        )}
                      >
                        {r.status}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {fmtDate(r.dateISO)} • {fmtTime(r.dateISO)}
                      </span>
                    </div>

                    <div className="mt-2 text-base font-semibold text-slate-900">{r.title}</div>
                    {r.subtitle ? <div className="mt-1 text-sm text-slate-600">{r.subtitle}</div> : null}

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">{r.facility}</span>
                      <span className="opacity-60">•</span>
                      <span>{r.clinician}</span>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-2">
                      {r.summary}
                    </p>

                    {r.tags?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {r.tags.slice(0, 5).map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <span className="text-sm font-semibold text-blue-700">Open</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyCard
            title="No records"
            body="When the backend is connected, records will populate here per patient account."
          />
        )}
      </div>
    </div>
  );
}
