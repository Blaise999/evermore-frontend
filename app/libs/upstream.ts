// libs/upstream.ts
// Evermore Hospitals — Canonical Upstream API URL Helper
// ✅ Single source of truth for backend URL
// ✅ Uses `new URL()` for safe URL building (no string concatenation bugs)
// ✅ Guards against missing/malformed env vars
// ✅ Detailed server-side logging for debugging

export const UPSTREAM_ENV_VAR = "UPSTREAM_API_URL";

/**
 * Get the upstream backend base URL.
 * 
 * Expected env var: UPSTREAM_API_URL=https://evermore-rlt0.onrender.com
 * 
 * ✅ Validates URL format
 * ✅ Throws clear error if missing/invalid in production
 * ✅ Falls back to localhost:8080 in development only
 */
export function getUpstreamBase(): string {
  // Check the canonical env var first
  const raw = process.env.UPSTREAM_API_URL
    // Legacy fallbacks (for migration period)
    || process.env.EVERMORE_API_URL
    || process.env.EVERMORE_BACKEND_URL
    || process.env.BACKEND_URL;

  if (raw) {
    const trimmed = raw.trim();
    
    // Guard: must start with http:// or https://
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      const errorMsg = `[Upstream] ❌ ${UPSTREAM_ENV_VAR} must start with http:// or https://. Got: "${trimmed.slice(0, 50)}"`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    // Normalize: strip trailing slashes
    return trimmed.replace(/\/+$/, "");
  }

  // In production, require explicit config
  if (process.env.NODE_ENV === "production") {
    const errorMsg = `[Upstream] ❌ ${UPSTREAM_ENV_VAR} is not set! Set it in your Vercel environment variables.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Development fallback only
  console.warn(`[Upstream] ⚠️ ${UPSTREAM_ENV_VAR} not set, using http://localhost:8080`);
  return "http://localhost:8080";
}

/**
 * Build a full upstream API URL using the safe `new URL()` constructor.
 * 
 * @param path - API path, e.g., "/api/auth/login" or "api/auth/login"
 * @returns Full URL, e.g., "https://evermore-rlt0.onrender.com/api/auth/login"
 * 
 * @example
 * joinUpstream("/api/auth/login")
 * // => "https://evermore-rlt0.onrender.com/api/auth/login"
 * 
 * joinUpstream("api/auth/login")
 * // => "https://evermore-rlt0.onrender.com/api/auth/login"
 */
export function joinUpstream(path: string): string {
  const base = getUpstreamBase();
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  // Use URL constructor for safe joining (handles edge cases correctly)
  const url = new URL(normalizedPath, base);
  return url.toString();
}

/**
 * Build a full upstream API URL with query parameters.
 * 
 * @param path - API path
 * @param query - Query parameters object
 * @returns Full URL with query string
 * 
 * @example
 * joinUpstreamWithQuery("/api/admin/users", { page: 1, limit: 10 })
 * // => "https://evermore-rlt0.onrender.com/api/admin/users?page=1&limit=10"
 */
export function joinUpstreamWithQuery(
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>
): string {
  const base = getUpstreamBase();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(normalizedPath, base);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

/**
 * Copy query parameters from an incoming request URL to the upstream URL.
 * 
 * @param path - API path
 * @param incomingUrl - The incoming request URL (to copy search params from)
 * @returns Full URL with copied query string
 */
export function joinUpstreamWithSearch(path: string, incomingUrl: URL): string {
  const base = getUpstreamBase();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(normalizedPath, base);
  
  // Copy all search params from incoming request
  url.search = incomingUrl.search;
  
  return url.toString();
}

/**
 * Standard response headers for API routes (no caching).
 */
export function noStoreHeaders(): Record<string, string> {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };
}

/**
 * Cookie configuration for session tokens.
 */
export function cookieConfig() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };
}

/**
 * Cookie config with max-age for persistent sessions.
 */
export function cookieConfigWithMaxAge(maxAgeSeconds: number = 60 * 60 * 24 * 7) {
  return {
    ...cookieConfig(),
    maxAge: maxAgeSeconds,
  };
}

/**
 * Session cookie name.
 */
export const SESSION_COOKIE_NAME = "evermore_token";
