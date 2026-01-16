// libs/Api.ts
// Evermore Hospitals — Frontend API client (TypeScript)
// Client-side: calls SAME-ORIGIN (/api/...) - no CORS issues
// Server-side: uses canonical upstream helper for safe URL building

export type Role = "patient" | "admin";

export type ApiOk<T> = { ok: true } & T;
export type ApiFail = { ok: false; code?: string; message?: string; details?: unknown };

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status = 500, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// ---------- Core Models (match backend) ----------

export type UserSafe = {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string | null;
  hospitalId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PatientAccount = {
  _id?: string;
  userId: string;
  currency: string;
  balance: number;
  creditLimit: number;
  amountOwed: number;
  creditScore: number;
  owedDueAt: string | null;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export type Appointment = {
  _id: string;
  userId: string;
  department: string;
  doctorName: string | null;
  scheduledAt: string;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RecordType =
  | "consultation"
  | "lab"
  | "radiology"
  | "prescription"
  | "diagnosis"
  | "discharge"
  | "other";

export type RecordStatus = "final" | "draft";

export type RecordModel = {
  _id: string;
  userId: string;
  type: RecordType;
  title: string;
  summary: string | null;
  data: any;
  recordedAt: string;
  clinician: string | null;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceStatus = "unpaid" | "paid" | "void";

export type InvoiceItem = { label: string; amount: number };

export type Invoice = {
  _id: string;
  userId: string;
  invoiceNo: string;
  currency: string;
  title: string;
  description: string | null;
  items: InvoiceItem[];
  amountTotal: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentStatus = "pending" | "approved" | "declined";
export type PaymentMethod = "card" | "bank" | "cash" | "other";

export type PaymentRequest = {
  _id: string;
  userId: string;
  invoiceId: string | null;
  reference: string;
  currency: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  createdBy: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuditLog = {
  _id: string;
  actorId: string | null;
  actorRole: string;
  action: string;
  targetModel: string;
  targetId: string | null;
  before: any;
  after: any;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
};

// ---------- Response Shapes ----------

export type AuthResponse = ApiOk<{ token: string; user: UserSafe }>;
export type SessionAuthResponse = ApiOk<{ user: UserSafe; token?: string }>;

export type MeResponse = ApiOk<{ user: UserSafe; account: PatientAccount | null }>;

export type PatientDashboardResponse = ApiOk<{
  user: UserSafe;
  account: PatientAccount | null;
  appointments: Appointment[];
  records: RecordModel[];
  invoices: Invoice[];
  payments: PaymentRequest[];
}>;

export type PatientPaymentCreateResponse = ApiOk<{
  paymentRequest: PaymentRequest;
  message: string;
}>;

export type AdminUsersResponse = ApiOk<{
  page: number;
  limit: number;
  total: number;
  users: UserSafe[];
}>;

export type AdminUserBundleResponse = ApiOk<{
  user: UserSafe;
  account: PatientAccount | null;
  appointments: Appointment[];
  records: RecordModel[];
  invoices: Invoice[];
  payments: PaymentRequest[];
}>;

export type AdminSeedResponse = ApiOk<{ created: { appointments: number; records: number; invoices: number } }>;

export type AdminPaymentsListResponse = ApiOk<{ payments: PaymentRequest[] }>;

export type AdminApprovePaymentResponse = ApiOk<{
  payment: PaymentRequest;
  invoice: Invoice | null;
  account: PatientAccount;
}>;

export type AdminDeclinePaymentResponse = ApiOk<{ payment: PaymentRequest }>;

export type AdminAuditResponse = ApiOk<{ logs: AuditLog[] }>;

// ---------- Request Helpers ----------

export type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  token?: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: any;
  signal?: AbortSignal;
};

function toQueryString(q?: RequestOptions["query"]) {
  if (!q) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === null) continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

function isPlainObject(x: any) {
  return x && typeof x === "object" && !Array.isArray(x);
}

async function safeReadJson(res: Response): Promise<any | null> {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  try {
    const txt = await res.text();
    if (!txt) return null;

    if (txt.trim().startsWith("{") || txt.trim().startsWith("[")) {
      try {
        return JSON.parse(txt);
      } catch {
        return { message: txt };
      }
    }
    return { message: txt };
  } catch {
    return null;
  }
}

// ---------- Client Factory ----------

export type EvermoreApiConfig = {
  baseUrl?: string;
  apiPrefix?: string;
};

const IS_BROWSER = typeof window !== "undefined";

/**
 * Get the server-side base URL using canonical upstream helper.
 * Only called on server-side.
 */
function getServerBase(): string {
  // Import upstream helper dynamically to avoid issues on client
  // Note: In actual usage, this will be evaluated at build/runtime
  const raw = 
    process.env.UPSTREAM_API_URL ||
    process.env.EVERMORE_API_URL ||
    process.env.EVERMORE_BACKEND_URL ||
    process.env.BACKEND_URL;

  if (raw) {
    const trimmed = raw.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      console.error(`[Api.ts] Invalid UPSTREAM_API_URL: must start with http:// or https://`);
      throw new Error("Invalid UPSTREAM_API_URL configuration");
    }
    return trimmed.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    console.error("[Api.ts] UPSTREAM_API_URL not set in production!");
    throw new Error("UPSTREAM_API_URL not configured");
  }

  return "http://localhost:8080";
}

// Browser uses same-origin (no CORS), Server uses backend base
const DEFAULT_BASE = IS_BROWSER ? "" : getServerBase();

export function createEvermoreApi(config: EvermoreApiConfig = {}) {
  const baseUrl = (config.baseUrl ?? DEFAULT_BASE).replace(/\/+$/, "");
  const apiPrefix = (config.apiPrefix ?? "/api").replace(/\/+$/, "");

  async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const method = opts.method || "GET";
    
    // Use URL constructor for safe URL building
    const fullPath = `${apiPrefix}${path}${toQueryString(opts.query)}`;
    const url = baseUrl ? new URL(fullPath, baseUrl).toString() : fullPath;

    const headers: Record<string, string> = {
      ...(opts.headers || {}),
    };

    if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

    const hasBody = opts.body !== undefined && opts.body !== null && method !== "GET";
    let body: BodyInit | undefined;

    if (hasBody) {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      body = headers["Content-Type"].includes("application/json")
        ? JSON.stringify(opts.body)
        : (opts.body as any);
    }

    const res = await fetch(url, {
      method,
      headers,
      body,
      credentials: IS_BROWSER ? "include" : "omit",
      cache: opts.cache ?? "no-store",
      next: opts.next,
      signal: opts.signal,
    } as any);

    const payload = await safeReadJson(res);

    if (!res.ok) {
      const message = (payload && (payload.message || payload.error)) || `Request failed (${res.status})`;
      const code = payload && payload.code ? String(payload.code) : undefined;
      const details = payload && payload.details !== undefined ? payload.details : payload;
      throw new ApiError(message, res.status, code, details);
    }

    if (payload && isPlainObject(payload) && payload.ok === false) {
      throw new ApiError(payload.message || "Request failed", res.status, payload.code, payload.details);
    }

    return (payload ?? ({} as any)) as T;
  }

  // ---------- Auth ----------
  const auth = {
    signup: (input: { name: string; email: string; password: string; phone?: string | null }) =>
      IS_BROWSER
        ? request<SessionAuthResponse>("/session/signup", { method: "POST", body: input })
        : request<SessionAuthResponse>("/auth/signup", { method: "POST", body: input }),

    login: (input: { email: string; password: string }) =>
      IS_BROWSER
        ? request<SessionAuthResponse>("/session/login", { method: "POST", body: input })
        : request<SessionAuthResponse>("/auth/login", { method: "POST", body: input }),

    logout: () =>
      request<ApiOk<{ message?: string }>>("/session/logout", { method: "POST" }),

    me: (token?: string) =>
      token
        ? request<MeResponse>("/auth/me", { method: "GET", token })
        : request<MeResponse>("/auth/me", { method: "GET" }),

    forgotPassword: (input: { email: string }) =>
      request<ApiOk<{ message: string; debugOtp?: string }>>("/auth/forgot-password", {
        method: "POST",
        body: input,
      }),

    resetPassword: (input: { email: string; otp: string; newPassword: string }) =>
      request<ApiOk<{ message: string }>>("/auth/reset-password", { method: "POST", body: input }),
  };

  // ---------- Patient ----------
  const patient = {
    dashboard: (token?: string) =>
      token
        ? request<PatientDashboardResponse>("/patient/dashboard", { method: "GET", token })
        : request<PatientDashboardResponse>("/patient/dashboard", { method: "GET" }),

    createPaymentRequest: (
      tokenOrInput: string | { amount: number; currency?: string; method?: PaymentMethod; invoiceId?: string | null },
      maybeInput?: { amount: number; currency?: string; method?: PaymentMethod; invoiceId?: string | null }
    ) => {
      const hasToken = typeof tokenOrInput === "string";
      const token = hasToken ? (tokenOrInput as string) : undefined;
      const input = (hasToken ? maybeInput : tokenOrInput) as {
        amount: number;
        currency?: string;
        method?: PaymentMethod;
        invoiceId?: string | null;
      };

      return token
        ? request<PatientPaymentCreateResponse>("/patient/payments", { method: "POST", token, body: input })
        : request<PatientPaymentCreateResponse>("/patient/payments", { method: "POST", body: input });
    },

    profile: async (token?: string) => {
      if (token) return request<ApiOk<{ user: UserSafe }>>("/patient/profile", { method: "GET", token });
      const dash = await request<PatientDashboardResponse>("/patient/dashboard", { method: "GET" });
      return { ok: true as const, user: dash.user };
    },

    account: async (token?: string) => {
      if (token) return request<ApiOk<{ account: PatientAccount }>>("/patient/account", { method: "GET", token });
      const dash = await request<PatientDashboardResponse>("/patient/dashboard", { method: "GET" });
      if (!dash.account) throw new ApiError("Account not found", 404, "ACCOUNT_NOT_FOUND");
      return { ok: true as const, account: dash.account };
    },
  };

  // ---------- Admin ----------
  const admin = {
    users: (token: string, params?: { page?: number; limit?: number; q?: string }) =>
      request<AdminUsersResponse>("/admin/users", { method: "GET", token, query: params }),

    userById: (token: string, userId: string) =>
      request<AdminUserBundleResponse>(`/admin/users/${userId}`, { method: "GET", token }),

    seedUser: (
      token: string,
      userId: string,
      input?: { appointments?: boolean; records?: boolean; invoices?: boolean; count?: number }
    ) =>
      request<AdminSeedResponse>(`/admin/users/${userId}/seed`, { method: "POST", token, body: input || {} }),

    updateAccount: (
      token: string,
      userId: string,
      patch: Partial<
        Pick<PatientAccount, "balance" | "creditLimit" | "amountOwed" | "creditScore" | "owedDueAt" | "currency" | "notes">
      >
    ) =>
      request<ApiOk<{ account: PatientAccount }>>(`/admin/users/${userId}/account`, { method: "PATCH", token, body: patch }),

    updateAppointment: (
      token: string,
      appointmentId: string,
      patch: Partial<Pick<Appointment, "department" | "doctorName" | "scheduledAt" | "status" | "reason" | "notes">>
    ) =>
      request<ApiOk<{ appointment: Appointment }>>(`/admin/appointments/${appointmentId}`, {
        method: "PATCH",
        token,
        body: patch,
      }),

    updateRecord: (
      token: string,
      recordId: string,
      patch: Partial<Pick<RecordModel, "type" | "title" | "summary" | "data" | "recordedAt" | "clinician" | "status">>
    ) =>
      request<ApiOk<{ record: RecordModel }>>(`/admin/records/${recordId}`, { method: "PATCH", token, body: patch }),

    payments: (token: string, status: PaymentStatus = "pending") =>
      request<AdminPaymentsListResponse>("/admin/payments", { method: "GET", token, query: { status } }),

    approvePayment: (token: string, paymentId: string, input?: { adminNote?: string }) =>
      request<AdminApprovePaymentResponse>(`/admin/payments/${paymentId}/approve`, {
        method: "POST",
        token,
        body: input || {},
      }),

    declinePayment: (token: string, paymentId: string, input?: { adminNote?: string }) =>
      request<AdminDeclinePaymentResponse>(`/admin/payments/${paymentId}/decline`, {
        method: "POST",
        token,
        body: input || {},
      }),

    audit: (token: string, limit = 50) =>
      request<AdminAuditResponse>("/admin/audit", { method: "GET", token, query: { limit } }),
  };

  return { request, auth, patient, admin, baseUrl, apiPrefix };
}

// Default singleton
export const api = createEvermoreApi();
export const request = api.request;
