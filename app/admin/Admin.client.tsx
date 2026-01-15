"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Field, Modal, Select, TextArea, TextInput } from "./ui";
import MessagesPanel from "./MessagesPanel.client";

type AnyObj = Record<string, any>;

type AdminUserRow = {
  _id: string;
  email: string;
  role?: string;
  createdAt?: string;
  lastLoginAt?: string | null;
};

type LoginEventRow = {
  _id?: string;
  at?: string;
  ip?: string;
  ua?: string;
  userId?: { _id: string; email: string; role?: string } | string;
};

function fmtMoney(amount: number, currency = "EUR") {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount || 0);
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
}

function fmtDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isoToLocalInputValue(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function localInputToISO(v: string) {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function apiJson<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { ok: false, message: text || "Bad JSON" };
  }

  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

function normalizeId<T extends AnyObj>(x: T): T & { id: string; _id: string } {
  const id = String((x as any).id || (x as any)._id || "");
  return { ...(x as any), id, _id: id };
}

function safeCopy(text: string) {
  try {
    navigator.clipboard?.writeText?.(text);
    return true;
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

type TabKey = "profile" | "records" | "appointments" | "invoices" | "messages" | "seed" | "logins";

export default function AdminClient() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const selectedUser = useMemo(
    () => (selectedUserId ? users.find((u) => u._id === selectedUserId) || null : null),
    [selectedUserId, users]
  );

  const [profile, setProfile] = useState<AnyObj | null>(null);
  const [records, setRecords] = useState<AnyObj[]>([]);
  const [appts, setAppts] = useState<AnyObj[]>([]);
  const [invoices, setInvoices] = useState<AnyObj[]>([]);
  const [loadingUserData, setLoadingUserData] = useState(false);

  const [logins, setLogins] = useState<LoginEventRow[]>([]);
  const [loginsLoading, setLoginsLoading] = useState(false);

  const [tab, setTab] = useState<TabKey>("profile");
  const [toast, setToast] = useState<{ tone: "ok" | "bad"; msg: string } | null>(null);

  const [recordModal, setRecordModal] = useState<{ open: boolean; item: AnyObj | null }>({ open: false, item: null });
  const [apptModal, setApptModal] = useState<{ open: boolean; item: AnyObj | null }>({ open: false, item: null });
  const [invoiceModal, setInvoiceModal] = useState<{ open: boolean; item: AnyObj | null }>({ open: false, item: null });

  const [seedOpen, setSeedOpen] = useState(false);
  const [seedFrom, setSeedFrom] = useState(() => isoToLocalInputValue(new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString()));
  const [seedTo, setSeedTo] = useState(() => isoToLocalInputValue(new Date().toISOString()));
  const [seedRecords, setSeedRecords] = useState("10");
  const [seedAppts, setSeedAppts] = useState("6");
  const [seedInvoices, setSeedInvoices] = useState("4");
  const [seedPaidRatio, setSeedPaidRatio] = useState("0.25");

  const searchDebounce = useRef<any>(null);

  function pushToast(tone: "ok" | "bad", msg: string) {
    setToast({ tone, msg });
    window.clearTimeout((pushToast as any)._t);
    (pushToast as any)._t = window.setTimeout(() => setToast(null), 3200);
  }

  async function loadUsers(signal?: AbortSignal) {
    setUsersLoading(true);
    try {
      const qs = new URLSearchParams();
      if (q.trim()) qs.set("q", q.trim());
      qs.set("page", String(page));
      qs.set("limit", String(limit));

      const data = await apiJson<{ ok: true; items: AdminUserRow[]; total: number }>(`/api/admin/users?${qs.toString()}`, {
        signal,
      });
      setUsers(data.items || []);
      setUsersTotal(Number(data.total || 0));

      if (selectedUserId && !(data.items || []).some((u) => u._id === selectedUserId)) {
        setSelectedUserId(null);
        setProfile(null);
        setRecords([]);
        setAppts([]);
        setInvoices([]);
      }
    } catch (e: any) {
      if (String(e?.name || "") !== "AbortError") pushToast("bad", e?.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }

  async function loadLogins() {
    setLoginsLoading(true);
    try {
      const data = await apiJson<{ ok: true; items: LoginEventRow[] }>(`/api/admin/logins?limit=200`);
      setLogins(data.items || []);
    } catch (e: any) {
      pushToast("bad", e?.message || "Failed to load login events");
    } finally {
      setLoginsLoading(false);
    }
  }

  async function loadSelectedUserData(userId: string) {
    setLoadingUserData(true);
    try {
      const [p, r, a, i] = await Promise.all([
        apiJson<{ ok: true; profile: AnyObj | null }>(`/api/admin/users/${userId}/profile`),
        apiJson<{ ok: true; items: AnyObj[] }>(`/api/admin/users/${userId}/records`),
        apiJson<{ ok: true; items: AnyObj[] }>(`/api/admin/users/${userId}/appointments`),
        apiJson<{ ok: true; items: AnyObj[] }>(`/api/admin/users/${userId}/invoices`),
      ]);

      setProfile(p.profile ? normalizeId(p.profile) : null);
      setRecords((r.items || []).map(normalizeId));
      setAppts((a.items || []).map(normalizeId));
      setInvoices((i.items || []).map(normalizeId));

      pushToast("ok", "User data loaded");
    } catch (e: any) {
      pushToast("bad", e?.message || "Failed to load user data");
    } finally {
      setLoadingUserData(false);
    }
  }

  useEffect(() => {
    const ac = new AbortController();
    loadUsers(ac.signal);
    return () => ac.abort();
  }, [page, limit]);

  useEffect(() => {
    if (searchDebounce.current) window.clearTimeout(searchDebounce.current);
    searchDebounce.current = window.setTimeout(() => {
      setPage(1);
      const ac = new AbortController();
      loadUsers(ac.signal);
      return () => ac.abort();
    }, 300);
  }, [q]);

  useEffect(() => {
    loadLogins();
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    loadSelectedUserData(selectedUserId);
  }, [selectedUserId]);

  const selectedUserLogins = useMemo(() => {
    if (!selectedUserId) return [];
    return (logins || []).filter((x) => {
      const uid = typeof x.userId === "string" ? x.userId : x.userId?._id;
      return uid === selectedUserId;
    });
  }, [logins, selectedUserId]);

  const maxPage = Math.max(1, Math.ceil(usersTotal / Math.max(1, limit)));

  async function saveProfile() {
    if (!selectedUserId || !profile) return;

    try {
      const patch: AnyObj = { ...profile };
      delete patch._id; delete patch.id; delete patch.userId;
      delete patch.createdAt; delete patch.updatedAt;

      const data = await apiJson<{ ok: true; profile: AnyObj }>(`/api/admin/users/${selectedUserId}/profile`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      setProfile(data.profile ? normalizeId(data.profile) : null);
      pushToast("ok", "Profile saved");
      loadUsers();
    } catch (e: any) {
      pushToast("bad", e?.message || "Failed to save profile");
    }
  }

  async function deleteRecord(id: string) {
    try {
      await apiJson(`/api/admin/records/${id}`, { method: "DELETE" });
      setRecords((xs) => xs.filter((x) => x._id !== id));
      pushToast("ok", "Record deleted");
    } catch (e: any) {
      pushToast("bad", e?.message || "Failed to delete record");
    }
  }

  async function upsertRecord(item: AnyObj) {
    if (!selectedUserId) return;
    const isEdit = Boolean(item?._id);

    try {
      if (isEdit) {
        const body: AnyObj = { ...item };
        delete body._id; delete body.id;
        const data = await apiJson<{ ok: true; record: AnyObj }>(`/api/admin/records/${item._id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        const rec = normalizeId(data.record);
        setRecords((xs) => xs.map((x) => (x._id === rec._id ? rec : x)));
        pushToast("ok", "Record updated");
      } else {
        const body: AnyObj = { ...item };
        delete body._id; delete body.id;
        const data = await apiJson<{ ok: true; record: AnyObj }>(`/api/admin/users/${selectedUserId}/records`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        const rec = normalizeId(data.record);
        setRecords((xs) => [rec, ...xs]);
        pushToast("ok", "Record created");
      }
    } catch (e: any) {
      pushToast("bad", e?.message || "Failed to save record");
    }
  }

  async function deleteAppt(id: string) {
    try {
      await apiJson(`/api/admin/appointments/${id}`, { method: "DELETE" });
      setAppts((xs) => xs.filter((x) => x._id !== id));
      pushToast("ok", "Appointment deleted");
    } catch (e: any) {
      pushToast("bad", e?.message || "Failed to delete appointment");
    }
  }

  async function upsertAppt(item: AnyObj) {
    if (!selectedUserId) return;
    const isEdit = Boolean(item?._id);

    try {
      if (isEdit) {
        const body: AnyObj = { ...item };
        delete body._id; delete body.id;
        const data = await apiJson<{ ok: true; appointment: AnyObj }>(`/api/admin/appointments/${item._id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        const ap = normalizeId(data.appointment);
        setAppts((xs) => xs.map((x) => (x._id === ap._id ? ap : x)));
        pushToast("ok", "Appointment updated");
      } else {
        const body: AnyObj = { ...item };
        delete body._id; delete body.id;
        const data = await apiJson<{ ok: true; appointment: AnyObj }>(`/api/admin/users/${selectedUserId}/appointments`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        const ap = normalizeId(data.appointment);
        setAppts((xs) => [ap, ...xs]);
        pushToast("ok", "Appointment created");
      }
    } catch (e: any) {
      pushToast("bad", e?.message || "Failed to save appointment");
    }
  }

  async function deleteInvoice(id: string) {
    try {
      await apiJson(`/api/admin/invoices/${id}`, { method: "DELETE" });
      setInvoices((xs) => xs.filter((x) => x._id !== id));
      pushToast("ok", "Invoice deleted");
    } catch (e: any) {
      pushToast("bad", e?.message || "Failed to delete invoice");
    }
  }

  async function upsertInvoice(item: AnyObj) {
    if (!selectedUserId) return;
    const isEdit = Boolean(item?._id);

    try {
      if (isEdit) {
        const body: AnyObj = { ...item };
        delete body._id; delete body.id;
        const data = await apiJson<{ ok: true; invoice: AnyObj }>(`/api/admin/invoices/${item._id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        const inv = normalizeId(data.invoice);
        setInvoices((xs) => xs.map((x) => (x._id === inv._id ? inv : x)));
        pushToast("ok", "Invoice updated");
      } else {
        const body: AnyObj = { ...item };
        delete body._id; delete body.id;
        const data = await apiJson<{ ok: true; invoice: AnyObj }>(`/api/admin/users/${selectedUserId}/invoices`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        const inv = normalizeId(data.invoice);
        setInvoices((xs) => [inv, ...xs]);
        pushToast("ok", "Invoice created");
      }
    } catch (e: any) {
      pushToast("bad", e?.message || "Failed to save invoice");
    }
  }

  async function seedUserData() {
    if (!selectedUserId) return;

    const fromISO = localInputToISO(seedFrom);
    const toISO = localInputToISO(seedTo);
    if (!fromISO || !toISO) {
      pushToast("bad", "Invalid date range");
      return;
    }

    try {
      await apiJson(`/api/admin/users/${selectedUserId}/seed`, {
        method: "POST",
        body: JSON.stringify({
          fromDate: fromISO,
          toDate: toISO,
          records: Number(seedRecords || 0),
          appointments: Number(seedAppts || 0),
          invoices: Number(seedInvoices || 0),
          currency: "EUR",
          paidRatio: Number(seedPaidRatio || 0),
        }),
      });
      pushToast("ok", "Data seeded successfully");
      setSeedOpen(false);
      await loadSelectedUserData(selectedUserId);
    } catch (e: any) {
      pushToast("bad", e?.message || "Failed to seed data");
    }
  }

  return (
    <div className="mx-auto grid max-w-screen-2xl gap-8 px-4 py-8 lg:grid-cols-[420px_1fr]">
      {/* Left Panel - Users List */}
      <Card title="Patients" subtitle="Search and select a patient">
        <div className="grid gap-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_130px]">
            <TextInput
              value={q}
              onChange={setQ}
              placeholder="Search email, name..."
              autoFocus
            />
            <Select
              value={String(limit)}
              onChange={(v) => setLimit(Number(v))}
              options={[
                { label: "25", value: "25" },
                { label: "50", value: "50" },
                { label: "100", value: "100" },
              ]}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">
              {usersLoading ? "Loading…" : `${usersTotal} patient${usersTotal === 1 ? "" : "s"}`}
            </span>
            <div className="flex items-center gap-2">
              <Button tone="ghost" size="sm" disabled={page <= 1 || usersLoading} onClick={() => setPage(p => Math.max(1, p - 1))}>
                ← Prev
              </Button>
              <span className="min-w-[80px] text-center font-medium text-slate-700">
                {page} / {maxPage}
              </span>
              <Button tone="ghost" size="sm" disabled={page >= maxPage || usersLoading} onClick={() => setPage(p => Math.min(maxPage, p + 1))}>
                Next →
              </Button>
            </div>
          </div>

          <div className=" -mx-6">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5 text-right">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-sm">
                  {usersLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="h-4 w-64 rounded bg-slate-200"></div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="ml-auto h-4 w-32 rounded bg-slate-200"></div>
                          </td>
                        </tr>
                      ))
                    : users.map((u) => {
                        const active = u._id === selectedUserId;
                        return (
                          <tr
                            key={u._id}
                            onClick={() => {
                              setSelectedUserId(u._id);
                              setTab("profile");
                            }}
                            className={`cursor-pointer transition-colors ${active ? "bg-blue-50" : "hover:bg-slate-50"}`}
                          >
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{u.email}</div>
                              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                ID: {u._id.slice(-8)}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    safeCopy(u._id);
                                    pushToast("ok", "Full ID copied");
                                  }}
                                  className="font-medium text-blue-600 hover:underline"
                                >
                                  Copy full
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-slate-600">{fmtDateTime(u.lastLoginAt || null)}</td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>

              {!usersLoading && users.length === 0 && (
                <div className="py-16 text-center">
                  <div className="text-lg font-medium text-slate-700">No patients found</div>
                  <div className="mt-2 text-sm text-slate-500">Try adjusting your search or filters</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Right Panel - Editor */}
      <div className="grid gap-8">
        <Card
          title={selectedUser ? `Editing: ${selectedUser.email}` : "Patient Editor"}
          subtitle={selectedUser ? "Profile, records, appointments, invoices & history" : "Select a patient to begin"}
          right={
            selectedUser && (
              <div className="flex flex-wrap gap-3">
                <Button tone="ghost" disabled={loadingUserData} onClick={() => selectedUserId && loadSelectedUserData(selectedUserId)}>
                  {loadingUserData ? "Reloading…" : "Reload Data"}
                </Button>
                <Button tone="primary" onClick={() => setSeedOpen(true)}>
                  Seed Data
                </Button>
              </div>
            )
          }
        >
          {!selectedUser ? (
            <div className="rounded-2xl bg-slate-50 p-12 text-center">
              <div className="text-xl font-medium text-slate-700">No patient selected</div>
              <div className="mt-3 text-base text-slate-600">Choose a patient from the list on the left to edit their data</div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-5">
                {([
                  ["profile", "Profile"],
                  ["records", "Medical Records"],
                  ["appointments", "Appointments"],
                  ["invoices", "Invoices"],
                  ["messages", "Messages"],
                  ["logins", "Login History"],
                  ["seed", "Seed Data"],
                ] as [TabKey, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                      tab === key
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="mt-7">
                {/* Profile */}
                {tab === "profile" && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label="Full Name">
                      <TextInput value={profile?.fullName || ""} onChange={(v) => setProfile((p) => ({ ...(p || {}), fullName: v }))} />
                    </Field>
                    <Field label="Phone">
                      <TextInput value={profile?.phone || ""} onChange={(v) => setProfile((p) => ({ ...(p || {}), phone: v }))} />
                    </Field>
                    <Field label="Gender">
                      <TextInput value={profile?.gender || ""} onChange={(v) => setProfile((p) => ({ ...(p || {}), gender: v }))} />
                    </Field>
                    <Field label="Date of Birth">
                      <TextInput
                        placeholder="YYYY-MM-DD"
                        value={profile?.dob || ""}
                        onChange={(v) => setProfile((p) => ({ ...(p || {}), dob: v || null }))}
                      />
                    </Field>
                    <Field label="Blood Type">
                      <TextInput value={profile?.bloodType || ""} onChange={(v) => setProfile((p) => ({ ...(p || {}), bloodType: v }))} />
                    </Field>
                    <Field label="Address">
                      <TextInput value={profile?.address || ""} onChange={(v) => setProfile((p) => ({ ...(p || {}), address: v }))} />
                    </Field>
                    <Field label="Allergies (comma-separated)" className="sm:col-span-2">
                      <TextInput
                        placeholder="Peanuts, Latex, Penicillin..."
                        value={Array.isArray(profile?.allergies) ? profile.allergies.join(", ") : ""}
                        onChange={(v) =>
                          setProfile((p) => ({
                            ...(p || {}),
                            allergies: v.split(",").map((s) => s.trim()).filter(Boolean),
                          }))
                        }
                      />
                    </Field>
                    <Field label="Notes" className="sm:col-span-2">
                      <TextArea rows={6} value={profile?.notes || ""} onChange={(v) => setProfile((p) => ({ ...(p || {}), notes: v }))} />
                    </Field>

                    <div className="flex gap-3 sm:col-span-2">
                      <Button tone="primary" size="lg" onClick={saveProfile}>
                        Save Profile
                      </Button>
                      <Button tone="ghost" onClick={() => { safeCopy(selectedUser.email); pushToast("ok", "Email copied"); }}>
                        Copy Email
                      </Button>
                    </div>
                  </div>
                )}

                {/* Records */}
                {tab === "records" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Medical Records</h3>
                      <Button
                        tone="primary"
                        onClick={() =>
                          setRecordModal({
                            open: true,
                            item: {
                              type: "consultation",
                              title: "",
                              clinician: "",
                              facility: "",
                              notes: "",
                              happenedAt: new Date().toISOString(),
                            },
                          })
                        }
                      >
                        + New Record
                      </Button>
                    </div>

                    <div className="-mx-6">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                          <tr>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {records.map((r) => (
                            <tr key={r._id} className="hover:bg-slate-50">
                              <td className="px-6 py-4">
                                <div className="font-medium text-slate-900">{r.title || "Untitled"}</div>
                                <div className="text-xs text-slate-600">{r.clinician || "—"}</div>
                              </td>
                              <td className="px-6 py-4 text-slate-700">{r.type || "—"}</td>
                              <td className="px-6 py-4 text-slate-700">{fmtDateTime(r.happenedAt || r.createdAt)}</td>
                              <td className="px-6 py-4 text-right">
                                <Button tone="ghost" size="sm" onClick={() => setRecordModal({ open: true, item: { ...r } })}>
                                  Edit
                                </Button>
                                <Button tone="danger" size="sm" onClick={() => deleteRecord(r._id)}>
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {records.length === 0 && (
                        <div className="py-12 text-center text-slate-500">No medical records yet.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Appointments */}
                {tab === "appointments" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Appointments</h3>
                      <Button
                        tone="primary"
                        onClick={() =>
                          setApptModal({
                            open: true,
                            item: {
                              status: "scheduled",
                              scheduledAt: new Date().toISOString(),
                              department: "",
                              doctor: "",
                              reason: "",
                              notes: "",
                            },
                          })
                        }
                      >
                        + New Appointment
                      </Button>
                    </div>

                    <div className="-mx-6">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                          <tr>
                            <th className="px-6 py-3">Department / Reason</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {appts.map((a) => (
                            <tr key={a._id} className="hover:bg-slate-50">
                              <td className="px-6 py-4">
                                <div className="font-medium text-slate-900">{a.department || "—"}</div>
                                <div className="text-xs text-slate-600">{a.reason || "—"}</div>
                              </td>
                              <td className="px-6 py-4 text-slate-700">{a.status || "—"}</td>
                              <td className="px-6 py-4 text-slate-700">{fmtDateTime(a.scheduledAt || a.createdAt)}</td>
                              <td className="px-6 py-4 text-right">
                                <Button tone="ghost" size="sm" onClick={() => setApptModal({ open: true, item: { ...a } })}>
                                  Edit
                                </Button>
                                <Button tone="danger" size="sm" onClick={() => deleteAppt(a._id)}>
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {appts.length === 0 && (
                        <div className="py-12 text-center text-slate-500">No appointments yet.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Invoices */}
                {tab === "invoices" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Invoices</h3>
                      <Button
                        tone="primary"
                        onClick={() =>
                          setInvoiceModal({
                            open: true,
                            item: {
                              invoiceNo: `INV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`,
                              currency: "EUR",
                              status: "issued",
                              issuedAt: new Date().toISOString(),
                              dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
                              paidAt: null,
                              items: [{ name: "Consultation", qty: 1, unitPrice: 60 }],
                              subtotal: 60,
                              tax: 0,
                              total: 60,
                            },
                          })
                        }
                      >
                        + New Invoice
                      </Button>
                    </div>

                    <div className="-mx-6">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                          <tr>
                            <th className="px-6 py-3">Invoice No.</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Total</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {invoices.map((inv) => (
                            <tr key={inv._id} className="hover:bg-slate-50">
                              <td className="px-6 py-4">
                                <div className="font-medium text-slate-900">{inv.invoiceNo || "—"}</div>
                                <div className="text-xs text-slate-600">
                                  Issued {fmtDateTime(inv.issuedAt)} • Due {fmtDateTime(inv.dueDate)}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-700">{inv.status || "—"}</td>
                              <td className="px-6 py-4 text-slate-700">{fmtMoney(Number(inv.total || 0), inv.currency || "EUR")}</td>
                              <td className="px-6 py-4 text-right">
                                <Button tone="ghost" size="sm" onClick={() => setInvoiceModal({ open: true, item: { ...inv } })}>
                                  Edit
                                </Button>
                                <Button tone="danger" size="sm" onClick={() => deleteInvoice(inv._id)}>
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {invoices.length === 0 && (
                        <div className="py-12 text-center text-slate-500">No invoices yet.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Messages */}
                {tab === "messages" && (
                  <MessagesPanel
                    userId={selectedUserId || ""}
                    userEmail={selectedUser?.email || ""}
                    userName={(profile?.name || profile?.fullName || "") as string}
                  />
                )}

                {/* Login History */}
                {tab === "logins" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Login History (last 80)</h3>
                      <Button tone="ghost" disabled={loginsLoading} onClick={loadLogins}>
                        Refresh
                      </Button>
                    </div>

                    <div className="-mx-6">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                          <tr>
                            <th className="px-6 py-3">Time / IP</th>
                            <th className="px-6 py-3 text-right">User Agent</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {selectedUserLogins.slice(0, 80).map((e) => (
                            <tr key={(e as any)._id} className="hover:bg-slate-50">
                              <td className="px-6 py-4">
                                <div className="font-medium text-slate-900">{fmtDateTime(e.at)}</div>
                                <div className="text-xs text-slate-600">IP: {e.ip || "—"}</div>
                              </td>
                              <td className="px-6 py-4 text-right text-xs text-slate-700 truncate max-w-md">{e.ua || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {selectedUserLogins.length === 0 && (
                        <div className="py-12 text-center text-slate-500">No login events recorded for this patient.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Seed Data Quick Access */}
                {tab === "seed" && (
                  <div className="rounded-2xl bg-slate-50 p-8 text-center ring-1 ring-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">Generate Random Test Data</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Create realistic records, appointments, and invoices within a date range.
                    </p>
                    <div className="mt-6">
                      <Button tone="primary" size="lg" onClick={() => setSeedOpen(true)}>
                        Open Seed Wizard
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-8 right-8 z-50 rounded-xl px-6 py-4 text-white shadow-2xl transition-all ${
            toast.tone === "ok" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          <div className="font-semibold">{toast.msg}</div>
        </div>
      )}

      {/* Record Modal */}
      <Modal
        title={recordModal.item?._id ? "Edit Record" : "New Record"}
        open={recordModal.open}
        onClose={() => setRecordModal({ open: false, item: null })}
        footer={
          <div className="flex gap-3">
            <Button tone="ghost" onClick={() => setRecordModal({ open: false, item: null })}>
              Cancel
            </Button>
            <Button
              tone="primary"
              onClick={() => {
                if (!recordModal.item?.happenedAt) {
                  pushToast("bad", "Date is required");
                  return;
                }
                upsertRecord(recordModal.item!);
                setRecordModal({ open: false, item: null });
              }}
            >
              Save Record
            </Button>
          </div>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Type">
            <TextInput value={recordModal.item?.type || ""} onChange={(v) => setRecordModal((m) => ({ ...m, item: { ...(m.item || {}), type: v } }))} />
          </Field>
          <Field label="Date & Time">
            <TextInput
              type="datetime-local"
              value={isoToLocalInputValue(recordModal.item?.happenedAt)}
              onChange={(v) => setRecordModal((m) => ({ ...m, item: { ...(m.item || {}), happenedAt: localInputToISO(v) || undefined } }))}
            />
          </Field>
          <Field label="Title" className="sm:col-span-2">
            <TextInput value={recordModal.item?.title || ""} onChange={(v) => setRecordModal((m) => ({ ...m, item: { ...(m.item || {}), title: v } }))} />
          </Field>
          <Field label="Clinician">
            <TextInput value={recordModal.item?.clinician || ""} onChange={(v) => setRecordModal((m) => ({ ...m, item: { ...(m.item || {}), clinician: v } }))} />
          </Field>
          <Field label="Facility">
            <TextInput value={recordModal.item?.facility || ""} onChange={(v) => setRecordModal((m) => ({ ...m, item: { ...(m.item || {}), facility: v } }))} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <TextArea rows={6} value={recordModal.item?.notes || ""} onChange={(v) => setRecordModal((m) => ({ ...m, item: { ...(m.item || {}), notes: v } }))} />
          </Field>
        </div>
      </Modal>

      {/* Appointment Modal */}
      <Modal
        title={apptModal.item?._id ? "Edit Appointment" : "New Appointment"}
        open={apptModal.open}
        onClose={() => setApptModal({ open: false, item: null })}
        footer={
          <div className="flex gap-3">
            <Button tone="ghost" onClick={() => setApptModal({ open: false, item: null })}>
              Cancel
            </Button>
            <Button
              tone="primary"
              onClick={() => {
                if (!apptModal.item?.scheduledAt) {
                  pushToast("bad", "Scheduled date is required");
                  return;
                }
                upsertAppt(apptModal.item!);
                setApptModal({ open: false, item: null });
              }}
            >
              Save Appointment
            </Button>
          </div>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Status">
            <Select
              value={apptModal.item?.status || "scheduled"}
              onChange={(v) => setApptModal((m) => ({ ...m, item: { ...(m.item || {}), status: v } }))}
              options={[
                { label: "Scheduled", value: "scheduled" },
                { label: "Completed", value: "completed" },
                { label: "Cancelled", value: "cancelled" },
              ]}
            />
          </Field>
          <Field label="Scheduled Date & Time">
            <TextInput
              type="datetime-local"
              value={isoToLocalInputValue(apptModal.item?.scheduledAt)}
              onChange={(v) => setApptModal((m) => ({ ...m, item: { ...(m.item || {}), scheduledAt: localInputToISO(v) || undefined } }))}
            />
          </Field>
          <Field label="Department">
            <TextInput value={apptModal.item?.department || ""} onChange={(v) => setApptModal((m) => ({ ...m, item: { ...(m.item || {}), department: v } }))} />
          </Field>
          <Field label="Doctor">
            <TextInput value={apptModal.item?.doctor || ""} onChange={(v) => setApptModal((m) => ({ ...m, item: { ...(m.item || {}), doctor: v } }))} />
          </Field>
          <Field label="Reason" className="sm:col-span-2">
            <TextInput value={apptModal.item?.reason || ""} onChange={(v) => setApptModal((m) => ({ ...m, item: { ...(m.item || {}), reason: v } }))} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <TextArea rows={5} value={apptModal.item?.notes || ""} onChange={(v) => setApptModal((m) => ({ ...m, item: { ...(m.item || {}), notes: v } }))} />
          </Field>
        </div>
      </Modal>

      {/* Invoice Modal */}
      <Modal
        title={invoiceModal.item?._id ? "Edit Invoice" : "New Invoice"}
        open={invoiceModal.open}
        onClose={() => setInvoiceModal({ open: false, item: null })}
        footer={
          <div className="flex gap-3">
            <Button tone="ghost" onClick={() => setInvoiceModal({ open: false, item: null })}>
              Cancel
            </Button>
            <Button
              tone="primary"
              onClick={() => {
                const it = invoiceModal.item!;
                if (!it.invoiceNo || !it.issuedAt || typeof it.total !== "number") {
                  pushToast("bad", "Invoice number, issued date and total are required");
                  return;
                }
                upsertInvoice(it);
                setInvoiceModal({ open: false, item: null });
              }}
            >
              Save Invoice
            </Button>
          </div>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Invoice Number">
            <TextInput value={invoiceModal.item?.invoiceNo || ""} onChange={(v) => setInvoiceModal((m) => ({ ...m, item: { ...(m.item || {}), invoiceNo: v } }))} />
          </Field>
          <Field label="Currency">
            <Select
              value={invoiceModal.item?.currency || "EUR"}
              onChange={(v) => setInvoiceModal((m) => ({ ...m, item: { ...(m.item || {}), currency: v } }))}
              options={[{ label: "EUR", value: "EUR" }]}
            />
          </Field>
          <Field label="Status">
            <Select
              value={invoiceModal.item?.status || "issued"}
              onChange={(v) => setInvoiceModal((m) => ({ ...m, item: { ...(m.item || {}), status: v } }))}
              options={[
                { label: "Issued", value: "issued" },
                { label: "Paid", value: "paid" },
              ]}
            />
          </Field>
          <Field label="Issued At">
            <TextInput
              type="datetime-local"
              value={isoToLocalInputValue(invoiceModal.item?.issuedAt)}
              onChange={(v) => setInvoiceModal((m) => ({ ...m, item: { ...(m.item || {}), issuedAt: localInputToISO(v) || undefined } }))}
            />
          </Field>
          <Field label="Due Date">
            <TextInput
              type="datetime-local"
              value={isoToLocalInputValue(invoiceModal.item?.dueDate)}
              onChange={(v) => setInvoiceModal((m) => ({ ...m, item: { ...(m.item || {}), dueDate: localInputToISO(v) || undefined } }))}
            />
          </Field>
          <Field label="Paid At (optional)">
            <TextInput
              type="datetime-local"
              value={isoToLocalInputValue(invoiceModal.item?.paidAt)}
              onChange={(v) => setInvoiceModal((m) => ({ ...m, item: { ...(m.item || {}), paidAt: v ? localInputToISO(v) : null } }))}
            />
          </Field>

          <div className="grid gap-4 sm:col-span-2 sm:grid-cols-3">
            <Field label="Subtotal">
              <TextInput
                type="number"
                value={String(invoiceModal.item?.subtotal ?? 0)}
                onChange={(v) => setInvoiceModal((m) => ({ ...m, item: { ...(m.item || {}), subtotal: Number(v || 0) } }))}
              />
            </Field>
            <Field label="Tax">
              <TextInput
                type="number"
                value={String(invoiceModal.item?.tax ?? 0)}
                onChange={(v) => setInvoiceModal((m) => ({ ...m, item: { ...(m.item || {}), tax: Number(v || 0) } }))}
              />
            </Field>
            <Field label="Total">
              <TextInput
                type="number"
                value={String(invoiceModal.item?.total ?? 0)}
                onChange={(v) => setInvoiceModal((m) => ({ ...m, item: { ...(m.item || {}), total: Number(v || 0) } }))}
              />
            </Field>
          </div>

          <Field label="Line Items (JSON array)" className="sm:col-span-2">
            <TextArea
              rows={8}
              value={JSON.stringify(invoiceModal.item?.items || [], null, 2)}
              onChange={(v) => {
                try {
                  const parsed = JSON.parse(v);
                  setInvoiceModal((m) => ({ ...m, item: { ...(m.item || {}), items: parsed } }));
                } catch {}
              }}
            />
          </Field>
        </div>
      </Modal>

      {/* Seed Modal */}
      <Modal
        title="Seed Random Test Data"
        open={seedOpen}
        onClose={() => setSeedOpen(false)}
        footer={
          <div className="flex gap-3">
            <Button tone="ghost" onClick={() => setSeedOpen(false)}>
              Cancel
            </Button>
            <Button tone="primary" onClick={seedUserData}>
              Generate Data
            </Button>
          </div>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="From Date & Time">
            <TextInput type="datetime-local" value={seedFrom} onChange={setSeedFrom} />
          </Field>
          <Field label="To Date & Time">
            <TextInput type="datetime-local" value={seedTo} onChange={setSeedTo} />
          </Field>
          <Field label="Number of Records">
            <TextInput type="number" value={seedRecords} onChange={setSeedRecords} placeholder="10" />
          </Field>
          <Field label="Number of Appointments">
            <TextInput type="number" value={seedAppts} onChange={setSeedAppts} placeholder="6" />
          </Field>
          <Field label="Number of Invoices">
            <TextInput type="number" value={seedInvoices} onChange={setSeedInvoices} placeholder="4" />
          </Field>
          <Field label="Paid Ratio (0.0 – 1.0)">
            <TextInput value={seedPaidRatio} onChange={setSeedPaidRatio} placeholder="0.25" />
          </Field>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200 sm:col-span-2">
            Generates random realistic data between the selected dates. Currency is fixed to EUR.
          </div>
        </div>
      </Modal>
    </div>
  );
}