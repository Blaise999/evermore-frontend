// libs/backendConfig.ts
// Evermore Hospitals — Shared Backend Configuration
// Used by all API proxy routes for consistent URL handling

/**
 * Get the backend API base URL.
 * ✅ Normalizes trailing slashes
 * ✅ Fails fast in production if not configured
 * ✅ Falls back to localhost:8080 in development only
 */
export function getBackendUrl(): string {
  // Check for explicit URL first (preferred)
  const explicitUrl = 
    process.env.EVERMORE_API_URL ||
    process.env.EVERMORE_BACKEND_URL ||
    process.env.NEXT_PUBLIC_EVERMORE_API_URL ||
    process.env.BACKEND_URL;
  
  if (explicitUrl) {
    // Normalize: strip trailing slashes
    return explicitUrl.replace(/\/+$/, "");
  }
  
  // In production, require explicit config
  if (process.env.NODE_ENV === "production") {
    console.error("[Evermore Backend] ❌ EVERMORE_API_URL is not set!");
    throw new Error(
      "Backend URL not configured. Set EVERMORE_API_URL environment variable."
    );
  }
  
  // Development fallback only
  return "http://localhost:8080";
}

/**
 * Build a full backend API URL path.
 * @param path - API path (e.g., "/auth/login" or "auth/login")
 * @returns Full URL (e.g., "https://backend.example.com/api/auth/login")
 */
export function backendApiUrl(path: string): string {
  const base = getBackendUrl();
  // Ensure path starts with /api/
  const normalizedPath = path.startsWith("/api/") 
    ? path 
    : path.startsWith("/") 
      ? `/api${path}` 
      : `/api/${path}`;
  return `${base}${normalizedPath}`;
}

/**
 * Standard response headers for API routes (no caching)
 */
export function noStoreHeaders(): Record<string, string> {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };
}

/**
 * Cookie configuration for session tokens.
 * ✅ Secure in production
 * ✅ SameSite=Lax for CSRF protection
 * ✅ HttpOnly to prevent XSS token theft
 */
export function cookieConfig() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    // No domain specified = current domain only (works for both Vercel and custom domains)
  };
}

/**
 * Extended cookie config with max-age for persistent sessions
 */
export function cookieConfigWithMaxAge(maxAgeSeconds: number = 60 * 60 * 24 * 7) {
  return {
    ...cookieConfig(),
    maxAge: maxAgeSeconds,
  };
}

/**
 * Cookie name for session token
 */
export const SESSION_COOKIE_NAME = "evermore_token";
