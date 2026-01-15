// app/signup/onboarding/Onboarding.client.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/** ---- Icons (lightweight, no deps) ---- */
function Shield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M12 2l8 4v6c0 5.2-3.4 9.9-8 10-4.6-.1-8-4.8-8-10V6l8-4Z"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-5"
        className="stroke-current"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ArrowLeft({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none">
      <path
        d="M15 18l-6-6 6-6"
        className="stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <label className="text-sm font-semibold text-slate-900">{label}</label>
        {hint ? <div className="text-xs font-medium text-slate-500">{hint}</div> : null}
      </div>
      {children}
      {error ? <div className="text-xs font-semibold text-rose-600">{error}</div> : null}
    </div>
  );
}

function inputBase() {
  return "w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40";
}

/** ---- Real UK Banks ---- */
type Bank = { id: string; name: string };
const BANKS: Bank[] = [
  { id: "barclays", name: "Barclays" },
  { id: "hsbc", name: "HSBC" },
  { id: "natwest", name: "NatWest" },
  { id: "monzo", name: "Monzo" },
  { id: "revolut", name: "Revolut" },
];

function onlyDigits(x: string) {
  return x.replace(/\D/g, "");
}
function maskSortCode(sc: string) {
  const d = onlyDigits(sc).padEnd(6, "0").slice(0, 6);
  return `**-**-${d.slice(4, 6)}`;
}
function maskAccount(acc: string) {
  const d = onlyDigits(acc).padEnd(8, "0").slice(0, 8);
  return `****${d.slice(4, 8)}`;
}

type Connection = {
  bankName: string;
  accountHolderName: string;
  sortCodeMasked: string;
  accountNumberMasked: string;
};

type MeResponse = {
  ok: boolean;
  message?: string;
  user?: {
    name?: string;
    email?: string;
    hospitalId?: string;
    // add fields if your backend returns more
  };
};

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
function clearCookie(name: string) {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export default function Onboarding() {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [loadingMe, setLoadingMe] = useState(true);

  const [evermoreId, setEvermoreId] = useState<string | null>(null);
  const [prefillName, setPrefillName] = useState<string>("");
  const [prefillEmail, setPrefillEmail] = useState<string>("");

  const [authed, setAuthed] = useState<boolean>(false);

  // ---- bank state ----
  const [bankId, setBankId] = useState(BANKS[0]?.id ?? "barclays");
  const bank = useMemo(() => BANKS.find((b) => b.id === bankId), [bankId]);

  const [accountHolderName, setAccountHolderName] = useState("");
  const [sortCode, setSortCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [connection, setConnection] = useState<Connection | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      setLoadingMe(true);

      // 1) Preferred: pull identity from session
      try {
        const r = await fetch("/api/session/me", { cache: "no-store" });
        if (r.ok) {
          const data = (await r.json()) as MeResponse;
          if (!cancelled && data?.ok && data.user) {
            setAuthed(true);

            const id = data.user.hospitalId || null;
            const name = data.user.name || "";
            const email = data.user.email || "";

            setEvermoreId(id);
            setPrefillName(name);
            setPrefillEmail(email);
            if (name) setAccountHolderName(name);

            setLoadingMe(false);
            return;
          }
        }
      } catch {
        // ignore, fall back below
      }

      // 2) Fallback: old signup handoff cookies (your previous working flow)
      const id2 = getCookie("evm_onb_id");
      const name2 = getCookie("evm_onb_name");

      if (!cancelled) {
        if (id2 || name2) {
          setAuthed(true); // “soft authed” for old flow
          setEvermoreId(id2);
          setPrefillName(name2 || "");
          if (name2) setAccountHolderName(name2);
        } else {
          setAuthed(false);
        }
        setLoadingMe(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  function validateBankStep() {
    const e: Record<string, string> = {};
    if (!accountHolderName.trim() || accountHolderName.trim().length < 3) e.holder = "Enter the account holder name.";
    const sc = onlyDigits(sortCode);
    const an = onlyDigits(accountNumber);
    if (sc.length !== 6) e.sortCode = "Sort code must be 6 digits.";
    if (an.length !== 8) e.accountNumber = "Account number must be 8 digits.";
    if (!bank) e.bank = "Choose a bank.";
    return e;
  }

  async function connectBank() {
    const bankErrors = validateBankStep();
    if (Object.keys(bankErrors).length > 0) {
      alert(Object.values(bankErrors)[0]);
      return;
    }

    if (!authed) {
      alert("Please log in first to connect your bank.");
      router.push("/login?next=%2Fonboarding%2Fbank");
      return;
    }

    setBusy(true);
    try {
      // ✅ UI now, backend later:
      // If you already have a backend endpoint, this is where you call it.

      // Example (if you later build /api/session/connect-bank):
      // await fetch("/api/session/connect-bank", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     bankId: bank!.id,
      //     bankName: bank!.name,
      //     accountHolderName: accountHolderName.trim(),
      //     sortCode: onlyDigits(sortCode),
      //     accountNumber: onlyDigits(accountNumber),
      //   }),
      // });

      const conn: Connection = {
        bankName: bank!.name,
        accountHolderName: accountHolderName.trim(),
        sortCodeMasked: maskSortCode(sortCode),
        accountNumberMasked: maskAccount(accountNumber),
      };

      setConnection(conn);

      // clear old handoff cookies (optional)
      clearCookie("evm_onb_id");
      clearCookie("evm_onb_name");

      router.push("/dashboard");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-[32px] bg-white p-6 ring-1 ring-slate-200 shadow-[0_26px_90px_rgba(2,8,23,.10)] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500">Step 2 of 2</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Connect your UK bank</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Connect your bank account securely via Open Banking to enable instant payments.
          </p>

          {loadingMe ? (
            <div className="mt-3 text-xs font-semibold text-slate-500">Loading your account…</div>
          ) : authed && (prefillName || prefillEmail) ? (
            <div className="mt-3 text-xs font-semibold text-slate-600">
              Signed in as <span className="text-slate-900">{prefillName || prefillEmail}</span>
            </div>
          ) : null}
        </div>

        <div className="hidden sm:block rounded-2xl bg-blue-50 px-4 py-3 ring-1 ring-blue-100">
          <div className="text-xs font-semibold text-blue-700">Evermore ID</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{evermoreId ?? "—"}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
          <div className="h-full rounded-full bg-blue-600 transition" style={{ width: `100%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="text-slate-900">Profile</span>
          <span className="text-slate-900">Connect bank</span>
        </div>
      </div>

      {/* Back */}
      <div className="mt-7 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/signup")}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {!loadingMe && !authed ? (
          <div className="text-xs font-semibold text-amber-700">
            You’re not signed in — please{" "}
            <Link href="/login?next=%2Fonboarding%2Fbank" className="underline">
              log in
            </Link>{" "}
            to continue.
          </div>
        ) : null}
      </div>

      {/* Bank UI */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
          <div className="text-sm font-semibold text-slate-900">Choose your bank</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {BANKS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBankId(b.id)}
                className={cn(
                  "rounded-2xl border p-3 text-left transition",
                  bankId === b.id ? "border-slate-900 bg-white" : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div className="text-sm font-semibold text-slate-900">{b.name}</div>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <div className="text-xs font-semibold text-slate-600">Why we need this</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">Pay appointments & outstandings instantly</div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
          <div className="text-sm font-semibold text-slate-900">Enter your bank details</div>

          <div className="mt-4 space-y-4">
            <Field label="Account holder name" hint="As it appears on your bank">
              <input
                className={inputBase()}
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Full name"
                autoComplete="name"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Sort code" hint="6 digits">
                <input
                  className={inputBase()}
                  value={sortCode}
                  onChange={(e) => setSortCode(e.target.value)}
                  placeholder="12-34-56"
                  inputMode="numeric"
                />
              </Field>

              <Field label="Account number" hint="8 digits">
                <input
                  className={inputBase()}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="12345678"
                  inputMode="numeric"
                />
              </Field>
            </div>

            <button
              type="button"
              disabled={busy || loadingMe}
              onClick={connectBank}
              className={cn(
                "w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(37,99,235,.24)] transition hover:bg-blue-700 active:translate-y-[1px]",
                (busy || loadingMe) && "opacity-70 cursor-not-allowed"
              )}
            >
              {busy ? "Connecting…" : "Connect bank →"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer security note */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Shield className="h-4 w-4 text-blue-700" />
          Secure access to sensitive health information
        </div>
        <Link
          href="/emergency"
          prefetch={false}
          className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50"
        >
          Emergency info
        </Link>
      </div>
    </div>
  );
}
