// app/admin/UserEditor.client.tsx
"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";

import type { Appointment, HospitalRecord, Invoice, RecordType } from "../dashboard/_model";
import { fmtDate, fmtMoneyGBP, fmtTime, pillForRecord, toneForStatus } from "../dashboard/_model";

import { useAdminStore, useSelectedUser } from "./AdminStore.client";
import { cn, isoToLocalInputValue, listToLines, linesToList, localInputToISO, safeCopy } from "./_utils";
import { Button, Card, Field, Modal, Select, TextArea, TextInput } from "./ui";

type PortalPreviewProps = { data: any };

const PortalPreview = dynamic<PortalPreviewProps>(
  () => import("../dashboard/Dashboard.client").then((m) => m.default as any),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_22px_70px_rgba(2,8,23,.10)]">
        <div className="text-sm font-semibold text-slate-900">Loading portal preview…</div>
        <div className="mt-2 text-sm text-slate-600">Rendering patient dashboard UI.</div>
      </div>
    ),
  }
);

type TabKey = "profile" | "records" | "appointments" | "invoices" | "preview";

function SectionTabs({ tab, setTab }: { tab: TabKey; setTab: (t: TabKey) => void }) {
  const items: Array<{ k: TabKey; label: string }> = [
    { k: "profile", label: "Profile" },
    { k: "records", label: "Records" },
    { k: "appointments", label: "Appointments" },
    { k: "invoices", label: "Invoices" },
    { k: "preview", label: "Portal preview" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((t) => (
        <button
          key={t.k}
          onClick={() => setTab(t.k)}
          className={cn(
            "rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition",
            tab === t.k
              ? "bg-blue-600 text-white ring-blue-600 shadow-[0_16px_40px_rgba(37,99,235,.25)]"
              : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function UserEditor() {
  const selected = useSelectedUser();
  const { actions } = useAdminStore();

  const [tab, setTab] = useState<TabKey>("profile");

  // Modals
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");

  const [recordOpen, setRecordOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<HospitalRecord | null>(null);

  const [apptOpen, setApptOpen] = useState(false);
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);

  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);

  if (!selected) return null;

  const profile = selected.portal.profile;

  const exportPayload = useMemo(() => {
    return JSON.stringify(
      {
        user: {
          id: selected.id,
          fullName: selected.fullName,
          email: selected.email,
          phone: selected.phone,
          status: selected.status,
          createdISO: selected.createdISO,
          lastActiveISO: selected.lastActiveISO,
        },
        portal: selected.portal,
      },
      null,
      2
    );
  }, [selected]);

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-[0_22px_70px_rgba(2,8,23,.10)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-500">Patient</div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="truncate text-lg font-semibold text-slate-900">{selected.fullName}</div>
              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                {selected.id}
              </span>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold ring-1",
                  selected.status === "Active"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                    : selected.status === "Suspended"
                      ? "bg-rose-50 text-rose-700 ring-rose-100"
                      : "bg-amber-50 text-amber-700 ring-amber-100"
                )}
              >
                {selected.status}
              </span>
            </div>
            <div className="mt-2 text-sm text-slate-600">{selected.email}</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button tone="ghost" onClick={() => actions.seedForUsers([selected.id])}>
              Reseed user
            </Button>
            <Button tone="secondary" onClick={() => setExportOpen(true)}>
              Export JSON
            </Button>
            <Button tone="secondary" onClick={() => setImportOpen(true)}>
              Import JSON
            </Button>
            <Button tone="danger" onClick={() => actions.deleteUser(selected.id)}>
              Delete
            </Button>
          </div>
        </div>

        <div className="mt-5">
          <SectionTabs tab={tab} setTab={setTab} />
        </div>

        <div className="mt-5 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <div className="text-xs font-semibold text-slate-500">Eligibility score</div>
              <div className="mt-1 text-xl font-semibold">{profile?.eligibilityScore ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">CareFlex limit</div>
              <div className="mt-1 text-xl font-semibold">{profile ? fmtMoneyGBP(profile.careflexLimit) : "—"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Portal data</div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                {selected.portal.records.length} records • {selected.portal.appts.length} appts • {selected.portal.invoices.length} invoices
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {tab === "profile" ? (
        <ProfileEditor />
      ) : tab === "records" ? (
        <RecordsEditor
          onNew={() => {
            setEditRecord(null);
            setRecordOpen(true);
          }}
          onEdit={(r) => {
            setEditRecord(r);
            setRecordOpen(true);
          }}
          onDelete={(id) => actions.deleteRecord(selected.id, id)}
        />
      ) : tab === "appointments" ? (
        <AppointmentsEditor
          onNew={() => {
            setEditAppt(null);
            setApptOpen(true);
          }}
          onEdit={(a) => {
            setEditAppt(a);
            setApptOpen(true);
          }}
          onDelete={(id) => actions.deleteAppt(selected.id, id)}
        />
      ) : tab === "invoices" ? (
        <InvoicesEditor
          onNew={() => {
            setEditInvoice(null);
            setInvoiceOpen(true);
          }}
          onEdit={(inv) => {
            setEditInvoice(inv);
            setInvoiceOpen(true);
          }}
          onDelete={(id) => actions.deleteInvoice(selected.id, id)}
        />
      ) : (
        <PortalPreview data={selected.portal as any} />
      )}

      {/* Export modal */}
      <Modal
        title="Export user JSON"
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        maxW="860px"
        footer={
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold text-slate-500">Paste into backend seed endpoints later.</div>
            <div className="flex items-center gap-2">
              <Button
                tone="secondary"
                onClick={async () => {
                  const ok = await safeCopy(exportPayload);
                  if (!ok) alert("Copy failed");
                }}
              >
                Copy JSON
              </Button>
              <Button tone="ghost" onClick={() => setExportOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        <pre className="max-h-[55vh] overflow-auto rounded-3xl bg-slate-950 p-4 text-xs text-slate-100 ring-1 ring-slate-800">
          {exportPayload}
        </pre>
      </Modal>

      {/* Import modal */}
      <Modal
        title="Import user JSON"
        open={importOpen}
        onClose={() => setImportOpen(false)}
        maxW="860px"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold text-slate-500">Accepts {"{ portal: {...} }"} or a full export payload.</div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  try {
                    const parsed = JSON.parse(importText || "{}") as any;
                    const portal = parsed.portal ?? parsed;
                    if (!portal || typeof portal !== "object") throw new Error("Invalid JSON");
                    if (!("records" in portal) || !("appts" in portal) || !("invoices" in portal)) {
                      throw new Error("Missing portal arrays: records/appts/invoices");
                    }
                    actions.replacePortal(selected.id, portal);
                    setImportText("");
                    setImportOpen(false);
                  } catch (e: any) {
                    alert(e?.message ?? "Import failed");
                  }
                }}
              >
                Import
              </Button>
              <Button tone="ghost" onClick={() => setImportOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        }
      >
        <TextArea
          value={importText}
          onChange={setImportText}
          rows={14}
          placeholder='Paste JSON here…\n\nExample:\n{ "portal": { "profile": {...}, "records": [], "appts": [], "invoices": [] } }'
        />
      </Modal>

      {/* Record modal */}
      <EditRecordModal
        key={editRecord?.id ?? "new"}
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        userId={selected.id}
        initial={editRecord}
      />

      {/* Appt modal */}
      <EditAppointmentModal
        key={editAppt?.id ?? "new"}
        open={apptOpen}
        onClose={() => setApptOpen(false)}
        userId={selected.id}
        initial={editAppt}
      />

      {/* Invoice modal */}
      <EditInvoiceModal
        key={editInvoice?.id ?? "new"}
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        userId={selected.id}
        initial={editInvoice}
      />
    </div>
  );
}

function ProfileEditor() {
  const selected = useSelectedUser();
  const { actions } = useAdminStore();
  if (!selected) return null;

  const p = selected.portal.profile;
  const [fullName, setFullName] = useState(p?.fullName ?? selected.fullName);
  const [email, setEmail] = useState(p?.email ?? selected.email);
  const [phone, setPhone] = useState(p?.phone ?? selected.phone ?? "");
  const [patientId, setPatientId] = useState(p?.patientId ?? selected.id);

  const [eligibilityScore, setEligibilityScore] = useState(String(p?.eligibilityScore ?? 700));
  const [careflexLimit, setCareflexLimit] = useState(String(p?.careflexLimit ?? 1200));
  const [careflexTermsDays, setCareflexTermsDays] = useState(String(p?.careflexTermsDays ?? 14));

  const [status, setStatus] = useState(selected.status);

  return (
    <Card
      title="Profile & Account"
      subtitle="Edit every field that powers the patient portal. (Frontend-only state for now.)"
      right={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            tone="secondary"
            onClick={() => {
              actions.updateProfile(selected.id, {
                fullName,
                email,
                phone,
                eligibilityScore: Number(eligibilityScore || 0),
                careflexLimit: Number(careflexLimit || 0),
                careflexTermsDays: Number(careflexTermsDays || 0),
              });
              actions.updateUserMeta(selected.id, { status });
              if (patientId && patientId !== selected.id) {
                actions.changePatientId(selected.id, patientId.trim());
              }
            }}
          >
            Save changes
          </Button>
        </div>
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name">
            <TextInput value={fullName} onChange={setFullName} placeholder="e.g. Amelia Cole" />
          </Field>
          <Field label="Patient ID" hint="unique">
            <TextInput value={patientId} onChange={setPatientId} placeholder="EM-XXXX" />
          </Field>

          <Field label="Email">
            <TextInput value={email} onChange={setEmail} type="email" placeholder="name@mail.com" />
          </Field>
          <Field label="Phone">
            <TextInput value={phone} onChange={setPhone} placeholder="+44 ..." />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Eligibility score" hint="0–999">
            <TextInput value={eligibilityScore} onChange={setEligibilityScore} type="number" />
          </Field>
          <Field label="CareFlex limit" hint="GBP">
            <TextInput value={careflexLimit} onChange={setCareflexLimit} type="number" />
          </Field>
          <Field label="Terms (days)">
            <TextInput value={careflexTermsDays} onChange={setCareflexTermsDays} type="number" />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Account status">
            <Select value={status} onChange={(v) => setStatus(v as any)}>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </Select>
          </Field>
          <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="text-xs font-semibold text-slate-500">Notes</div>
            <div className="mt-2 text-sm text-slate-600">
              Changing the patient ID updates the user key in this demo store. In the real backend, that would be a dedicated “rename” operation with audit logs.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function RecordsEditor({
  onNew,
  onEdit,
  onDelete,
}: {
  onNew: () => void;
  onEdit: (r: HospitalRecord) => void;
  onDelete: (id: string) => void;
}) {
  const selected = useSelectedUser();
  if (!selected) return null;

  const records = useMemo(() => {
    return selected.portal.records.slice().sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
  }, [selected.portal.records]);

  return (
    <Card
      title="Hospital records"
      subtitle="Create, edit, and delete labs, imaging, visit notes, prescriptions, and documents."
      right={<Button onClick={onNew}>Add record</Button>}
    >
      {records.length ? (
        <div className="grid gap-3">
          {records.map((r) => (
            <div key={r.id} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      {pillForRecord(r.type)}
                    </span>
                    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold ring-1", toneForStatus(r.status))}>
                      {r.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {fmtDate(r.dateISO)} • {fmtTime(r.dateISO)}
                    </span>
                  </div>
                  <div className="mt-2 text-base font-semibold text-slate-900">{r.title}</div>
                  {r.subtitle ? <div className="mt-1 text-sm text-slate-600">{r.subtitle}</div> : null}
                  <div className="mt-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">{r.facility}</span> • <span>{r.clinician}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-2">{r.summary}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button tone="secondary" onClick={() => onEdit(r)}>
                    Edit
                  </Button>
                  <Button tone="ghost" onClick={() => onDelete(r.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
          <div className="text-sm font-semibold text-slate-900">No records</div>
          <div className="mt-2 text-sm text-slate-600">Add a record to see it appear in the patient portal.</div>
        </div>
      )}
    </Card>
  );
}

function AppointmentsEditor({
  onNew,
  onEdit,
  onDelete,
}: {
  onNew: () => void;
  onEdit: (a: Appointment) => void;
  onDelete: (id: string) => void;
}) {
  const selected = useSelectedUser();
  if (!selected) return null;
  const appts = useMemo(() => {
    return selected.portal.appts.slice().sort((a, b) => new Date(b.startISO).getTime() - new Date(a.startISO).getTime());
  }, [selected.portal.appts]);

  return (
    <Card title="Appointments" subtitle="Edit bookings, clinician, location, status, and prep checklist." right={<Button onClick={onNew}>Add appointment</Button>}>
      {appts.length ? (
        <div className="grid gap-3">
          {appts.map((a) => (
            <div key={a.id} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold ring-1", toneForStatus(a.status))}>{a.status}</span>
                    <span className="text-xs font-semibold text-slate-500">{fmtDate(a.startISO)} • {fmtTime(a.startISO)}</span>
                  </div>
                  <div className="mt-2 text-base font-semibold text-slate-900">{a.dept}</div>
                  <div className="mt-1 text-sm text-slate-600">{a.clinician}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">{a.facility}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button tone="secondary" onClick={() => onEdit(a)}>Edit</Button>
                  <Button tone="ghost" onClick={() => onDelete(a.id)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
          <div className="text-sm font-semibold text-slate-900">No appointments</div>
          <div className="mt-2 text-sm text-slate-600">Add an appointment to populate “Next appointment” in the portal.</div>
        </div>
      )}
    </Card>
  );
}

function InvoicesEditor({
  onNew,
  onEdit,
  onDelete,
}: {
  onNew: () => void;
  onEdit: (inv: Invoice) => void;
  onDelete: (id: string) => void;
}) {
  const selected = useSelectedUser();
  if (!selected) return null;
  const invoices = useMemo(() => {
    return selected.portal.invoices.slice().sort((a, b) => new Date(b.createdISO).getTime() - new Date(a.createdISO).getTime());
  }, [selected.portal.invoices]);

  return (
    <Card title="Invoices" subtitle="Edit billing title, amount, dates, and status." right={<Button onClick={onNew}>Add invoice</Button>}>
      {invoices.length ? (
        <div className="grid gap-3">
          {invoices.map((inv) => (
            <div key={inv.id} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold ring-1", toneForStatus(inv.status))}>{inv.status}</span>
                    <span className="text-xs font-semibold text-slate-500">Created: {fmtDate(inv.createdISO)} • Due: {fmtDate(inv.dueISO)}</span>
                  </div>
                  <div className="mt-2 text-base font-semibold text-slate-900">{inv.title}</div>
                  <div className="mt-1 text-xl font-semibold">{fmtMoneyGBP(inv.amount)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button tone="secondary" onClick={() => onEdit(inv)}>Edit</Button>
                  <Button tone="ghost" onClick={() => onDelete(inv.id)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
          <div className="text-sm font-semibold text-slate-900">No invoices</div>
          <div className="mt-2 text-sm text-slate-600">Add an invoice to test portal billing flows (pending approval, overdue, paid).</div>
        </div>
      )}
    </Card>
  );
}

function EditRecordModal({
  open,
  onClose,
  userId,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  initial: HospitalRecord | null;
}) {
  const { actions } = useAdminStore();

  const isNew = !initial;
  const [id] = useState(initial?.id ?? `rec_${userId}_${Math.random().toString(36).slice(2, 7)}`);
  const [type, setType] = useState<RecordType>(initial?.type ?? "lab");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [facility, setFacility] = useState(initial?.facility ?? "Evermore London — Harley St");
  const [clinician, setClinician] = useState(initial?.clinician ?? "Dr. A. Bennett");
  const [dateLocal, setDateLocal] = useState(isoToLocalInputValue(initial?.dateISO ?? new Date().toISOString()));
  const [status, setStatus] = useState<HospitalRecord["status"]>(initial?.status ?? "Ready");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [notes, setNotes] = useState(listToLines(initial?.notes));
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));

  return (
    <Modal
      title={isNew ? "Add record" : "Edit record"}
      open={open}
      onClose={() => {
        onClose();
      }}
      maxW="920px"
      footer={
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-500">ID: {id}</div>
          <div className="flex items-center gap-2">
            <Button tone="ghost" onClick={onClose}>Cancel</Button>
            <Button
              onClick={() => {
                const dateISO = localInputToISO(dateLocal) || new Date().toISOString();
                const record: HospitalRecord = {
                  id,
                  type,
                  title: title || (type === "lab" ? "Lab result" : "Record"),
                  subtitle: subtitle || undefined,
                  facility,
                  clinician,
                  dateISO,
                  status,
                  summary: summary || "—",
                  notes: linesToList(notes),
                  tags: tags
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                };
                actions.upsertRecord(userId, record);
                onClose();
              }}
            >
              Save
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Record type">
            <Select value={type} onChange={(v) => setType(v as any)}>
              <option value="lab">Lab</option>
              <option value="imaging">Imaging</option>
              <option value="visit">Visit note</option>
              <option value="prescription">Prescription</option>
              <option value="document">Document</option>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(v) => setStatus(v as any)}>
              <option value="Ready">Ready</option>
              <option value="Processing">Processing</option>
              <option value="Flagged">Flagged</option>
              <option value="Synced">Synced</option>
            </Select>
          </Field>
          <Field label="Title">
            <TextInput value={title} onChange={setTitle} placeholder="e.g. Complete Blood Count" />
          </Field>
          <Field label="Subtitle (optional)">
            <TextInput value={subtitle} onChange={setSubtitle} placeholder="e.g. Sample processed" />
          </Field>
          <Field label="Facility">
            <TextInput value={facility} onChange={setFacility} />
          </Field>
          <Field label="Clinician">
            <TextInput value={clinician} onChange={setClinician} />
          </Field>
          <Field label="Date & time">
            <TextInput value={dateLocal} onChange={setDateLocal} type="datetime-local" />
          </Field>
          <Field label="Tags" hint="comma separated">
            <TextInput value={tags} onChange={setTags} placeholder="Routine, Cardio" />
          </Field>
        </div>

        <Field label="Summary">
          <TextArea value={summary} onChange={setSummary} rows={4} placeholder="Short patient-facing summary…" />
        </Field>

        <Field label="Notes" hint="one per line">
          <TextArea value={notes} onChange={setNotes} rows={4} placeholder="Clinician review required…" />
        </Field>
      </div>
    </Modal>
  );
}

function EditAppointmentModal({
  open,
  onClose,
  userId,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  initial: Appointment | null;
}) {
  const { actions } = useAdminStore();
  const isNew = !initial;

  const [id] = useState(initial?.id ?? `appt_${userId}_${Math.random().toString(36).slice(2, 7)}`);
  const [dept, setDept] = useState(initial?.dept ?? "General Medicine");
  const [clinician, setClinician] = useState(initial?.clinician ?? "Dr. E. Wallace");
  const [facility, setFacility] = useState(initial?.facility ?? "Evermore London — Canary Wharf");
  const [startLocal, setStartLocal] = useState(isoToLocalInputValue(initial?.startISO ?? new Date().toISOString()));
  const [status, setStatus] = useState<Appointment["status"]>(initial?.status ?? "Confirmed");
  const [checklist, setChecklist] = useState(listToLines(initial?.prepChecklist));

  return (
    <Modal
      title={isNew ? "Add appointment" : "Edit appointment"}
      open={open}
      onClose={onClose}
      maxW="860px"
      footer={
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-500">ID: {id}</div>
          <div className="flex items-center gap-2">
            <Button tone="ghost" onClick={onClose}>Cancel</Button>
            <Button
              onClick={() => {
                const startISO = localInputToISO(startLocal) || new Date().toISOString();
                const appt: Appointment = {
                  id,
                  dept: dept || "Appointment",
                  clinician,
                  facility,
                  startISO,
                  status,
                  prepChecklist: linesToList(checklist),
                };
                actions.upsertAppt(userId, appt);
                onClose();
              }}
            >
              Save
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Department">
            <TextInput value={dept} onChange={setDept} placeholder="Cardiology" />
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(v) => setStatus(v as any)}>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Select>
          </Field>
          <Field label="Clinician">
            <TextInput value={clinician} onChange={setClinician} />
          </Field>
          <Field label="Facility">
            <TextInput value={facility} onChange={setFacility} />
          </Field>
          <Field label="Start date & time">
            <TextInput value={startLocal} onChange={setStartLocal} type="datetime-local" />
          </Field>
        </div>

        <Field label="Prep checklist" hint="one per line">
          <TextArea value={checklist} onChange={setChecklist} rows={5} placeholder="Bring a photo ID…" />
        </Field>
      </div>
    </Modal>
  );
}

function EditInvoiceModal({
  open,
  onClose,
  userId,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  initial: Invoice | null;
}) {
  const { actions } = useAdminStore();
  const isNew = !initial;

  const [id] = useState(initial?.id ?? `inv_${userId}_${Math.random().toString(36).slice(2, 5)}`);
  const [title, setTitle] = useState(initial?.title ?? "Consultation fee");
  const [amount, setAmount] = useState(String(initial?.amount ?? 250));
  const [status, setStatus] = useState<Invoice["status"]>(initial?.status ?? "Pending approval");
  const [createdLocal, setCreatedLocal] = useState(isoToLocalInputValue(initial?.createdISO ?? new Date().toISOString()));
  const [dueLocal, setDueLocal] = useState(isoToLocalInputValue(initial?.dueISO ?? new Date().toISOString()));

  return (
    <Modal
      title={isNew ? "Add invoice" : "Edit invoice"}
      open={open}
      onClose={onClose}
      maxW="860px"
      footer={
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-500">ID: {id}</div>
          <div className="flex items-center gap-2">
            <Button tone="ghost" onClick={onClose}>Cancel</Button>
            <Button
              onClick={() => {
                const inv: Invoice = {
                  id,
                  title: title || "Invoice",
                  amount: Number(amount || 0),
                  status,
                  createdISO: localInputToISO(createdLocal) || new Date().toISOString(),
                  dueISO: localInputToISO(dueLocal) || new Date().toISOString(),
                };
                actions.upsertInvoice(userId, inv);
                onClose();
              }}
            >
              Save
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title">
            <TextInput value={title} onChange={setTitle} />
          </Field>
          <Field label="Amount" hint="GBP">
            <TextInput value={amount} onChange={setAmount} type="number" />
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(v) => setStatus(v as any)}>
              <option value="Unpaid">Unpaid</option>
              <option value="Pending approval">Pending approval</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Waived">Waived</option>
            </Select>
          </Field>
          <div />
          <Field label="Created">
            <TextInput value={createdLocal} onChange={setCreatedLocal} type="datetime-local" />
          </Field>
          <Field label="Due">
            <TextInput value={dueLocal} onChange={setDueLocal} type="datetime-local" />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
