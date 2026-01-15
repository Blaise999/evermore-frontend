"use client";

import React, { useMemo, useState } from "react";
import { clampInt } from "./_utils";
import { Button, Field, Modal, TextInput } from "./ui";

export default function SeedWizard({
  open,
  onClose,
  onSeed,
}: {
  open: boolean;
  onClose: () => void;
  onSeed: (count: number, sizes?: { records?: number; appts?: number; invoices?: number }) => void;
}) {
  const [count, setCount] = useState("24");
  const [records, setRecords] = useState("");
  const [appts, setAppts] = useState("");
  const [invoices, setInvoices] = useState("");

  const parsed = useMemo(() => {
    const n = clampInt(Number(count || 0), 0, 500);
    const r = records.trim() === "" ? undefined : clampInt(Number(records), 0, 500);
    const a = appts.trim() === "" ? undefined : clampInt(Number(appts), 0, 500);
    const i = invoices.trim() === "" ? undefined : clampInt(Number(invoices), 0, 500);
    const sizes = r === undefined && a === undefined && i === undefined ? undefined : { records: r, appts: a, invoices: i };
    return { n, sizes };
  }, [count, records, appts, invoices]);

  return (
    <Modal
      title="Mass seed users"
      open={open}
      onClose={onClose}
      maxW="720px"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-500">
            Demo mode only — refresh resets. No localStorage.
          </div>
          <div className="flex items-center gap-2">
            <Button tone="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onSeed(parsed.n, parsed.sizes);
                onClose();
              }}
            >
              Seed {parsed.n} users
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-4">
        <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="text-sm font-semibold text-slate-900">What this does</div>
          <div className="mt-2 text-sm text-slate-600">
            Creates a batch of patient accounts with portal data (profile, records, appointments, invoices) so you can test the admin editor UI.
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Number of users" hint="0–500">
            <TextInput value={count} onChange={setCount} type="number" />
          </Field>
          <div />

          <Field label="Records per user" hint="leave blank = random">
            <TextInput value={records} onChange={setRecords} type="number" placeholder="e.g. 12" />
          </Field>
          <Field label="Appointments per user" hint="leave blank = random">
            <TextInput value={appts} onChange={setAppts} type="number" placeholder="e.g. 2" />
          </Field>
          <Field label="Invoices per user" hint="leave blank = random">
            <TextInput value={invoices} onChange={setInvoices} type="number" placeholder="e.g. 3" />
          </Field>
        </div>

        <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
          <div className="text-xs font-semibold text-slate-500">Preview</div>
          <div className="mt-2 text-sm font-semibold text-slate-900">{parsed.n} users</div>
          <div className="mt-1 text-xs text-slate-600">
            Data sizes: {parsed.sizes ? JSON.stringify(parsed.sizes) : "randomized per user"}
          </div>
        </div>
      </div>
    </Modal>
  );
}
