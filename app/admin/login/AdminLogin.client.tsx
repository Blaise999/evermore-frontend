// app/admin/login/AdminLogin.client.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Field, TextInput } from "../ui";

type MeResponse =
  | { ok: true; user: { id: string; email: string; role?: string } }
  | { ok: false; message?: string };

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

function isAdmin(me: MeResponse) {
  return Boolean((me as any)?.ok && (me as any)?.user?.role === "admin");
}

export default function AdminLoginClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const next = useMemo(() => sp.get("next") || "/admin", [sp]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // If already logged in as admin -> go straight to /admin
  useEffect(() => {
    (async () => {
      try {
        const me = await apiJson<MeResponse>("/api/auth/me");
        if (isAdmin(me)) {
          router.replace(next);
          return;
        }
      } catch {
        // ignore: not logged in
      } finally {
        setChecking(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const em = email.trim().toLowerCase();
    if (!em || !password) {
      setErr("Enter your admin email and password.");
      return;
    }

    setLoading(true);
    try {
      // 1) login -> sets HttpOnly cookie (evermore_token)
      await apiJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: em, password }),
      });

      // 2) confirm role is admin
      const me = await apiJson<MeResponse>("/api/auth/me");

      if (!isAdmin(me)) {
        // not admin: logout (clear cookie) and block access
        try {
          await apiJson("/api/auth/logout", { method: "POST", body: JSON.stringify({}) });
        } catch {}
        throw new Error("This account is not an admin. Use an admin account.");
      }

      router.replace(next);
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <Card title="Staff Admin Login" subtitle="Sign in with an admin account to access the Admin Console.">
        {checking ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
            Checking session…
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-4 grid gap-4">
          <Field label="Email">
            <TextInput
              value={email}
              onChange={setEmail}
              placeholder="admin@evermore.com"
              type="email"
              disabled={loading}
            />
          </Field>

          <Field label="Password">
            <TextInput
              value={password}
              onChange={setPassword}
              placeholder="••••••••••"
              type="password"
              disabled={loading}
            />
          </Field>

          {err ? (
            <div className="rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
              {err}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" tone="primary" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>

            <Button
              type="button"
              tone="ghost"
              disabled={loading}
              onClick={() => {
                setEmail("");
                setPassword("");
                setErr(null);
              }}
            >
              Clear
            </Button>
          </div>

          <div className="mt-2 text-xs font-semibold text-slate-500">
            Tip: If you get “not admin”, set the user role to <span className="text-slate-700">admin</span> in MongoDB
            (or run your <span className="text-slate-700">create admin</span> script).
          </div>
        </form>
      </Card>
    </div>
  );
}
