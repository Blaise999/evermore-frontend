// libs/errorMapper.ts
// Evermore Hospitals — Shared Error Mapper
// Maps API errors and network issues to user-friendly messages
// ✅ Hides all technical details from users
// ✅ Logs technical details server-side only

export type UserFriendlyError = {
  message: string;
  action?: "retry" | "sign-in" | "check-details" | "contact-support" | null;
  actionLabel?: string;
  severity: "warning" | "error" | "info";
};

// Known error codes from backend
const CODE_MESSAGES: Record<string, UserFriendlyError> = {
  // Authentication
  UNAUTHORIZED: {
    message: "Session expired. Please sign in again.",
    action: "sign-in",
    actionLabel: "Sign in",
    severity: "warning",
  },
  TOKEN_EXPIRED: {
    message: "Session expired. Please sign in again.",
    action: "sign-in",
    actionLabel: "Sign in",
    severity: "warning",
  },
  INVALID_TOKEN: {
    message: "Session expired. Please sign in again.",
    action: "sign-in",
    actionLabel: "Sign in",
    severity: "warning",
  },
  INVALID_CREDENTIALS: {
    message: "Incorrect email or password. Please try again.",
    action: "check-details",
    actionLabel: "Try again",
    severity: "error",
  },
  
  // Forbidden
  FORBIDDEN: {
    message: "You don't have access to this.",
    action: null,
    severity: "error",
  },
  ACCESS_DENIED: {
    message: "You don't have access to this.",
    action: null,
    severity: "error",
  },
  ROLE_REQUIRED: {
    message: "You don't have permission to do this.",
    action: null,
    severity: "error",
  },
  
  // Not found
  NOT_FOUND: {
    message: "We couldn't find that.",
    action: null,
    severity: "warning",
  },
  USER_NOT_FOUND: {
    message: "Account not found. Please check your email.",
    action: "check-details",
    actionLabel: "Try again",
    severity: "error",
  },
  INVOICE_NOT_FOUND: {
    message: "Invoice not found.",
    action: null,
    severity: "warning",
  },
  RECORD_NOT_FOUND: {
    message: "Record not found.",
    action: null,
    severity: "warning",
  },
  APPOINTMENT_NOT_FOUND: {
    message: "Appointment not found.",
    action: null,
    severity: "warning",
  },
  
  // Conflict
  DUPLICATE: {
    message: "That action was already completed.",
    action: null,
    severity: "info",
  },
  ALREADY_EXISTS: {
    message: "That already exists. Try a different option.",
    action: null,
    severity: "warning",
  },
  EMAIL_ALREADY_EXISTS: {
    message: "An account with this email already exists. Try signing in instead.",
    action: "sign-in",
    actionLabel: "Sign in",
    severity: "warning",
  },
  PAYMENT_ALREADY_PROCESSED: {
    message: "This payment was already processed.",
    action: null,
    severity: "info",
  },
  
  // Validation
  VALIDATION_ERROR: {
    message: "Please check your details and try again.",
    action: "check-details",
    actionLabel: "Try again",
    severity: "error",
  },
  INVALID_INPUT: {
    message: "Please check your details and try again.",
    action: "check-details",
    actionLabel: "Try again",
    severity: "error",
  },
  MISSING_FIELD: {
    message: "Some required information is missing. Please fill in all fields.",
    action: "check-details",
    actionLabel: "Try again",
    severity: "error",
  },
  INVALID_EMAIL: {
    message: "Please enter a valid email address.",
    action: "check-details",
    actionLabel: "Try again",
    severity: "error",
  },
  PASSWORD_TOO_WEAK: {
    message: "Password must be at least 8 characters with a mix of letters and numbers.",
    action: "check-details",
    actionLabel: "Try again",
    severity: "error",
  },
  
  // Server errors
  SERVER_ERROR: {
    message: "Something went wrong on our side. Try again.",
    action: "retry",
    actionLabel: "Try again",
    severity: "error",
  },
  INTERNAL_ERROR: {
    message: "Something went wrong on our side. Try again.",
    action: "retry",
    actionLabel: "Try again",
    severity: "error",
  },
  DATABASE_ERROR: {
    message: "Something went wrong on our side. Try again.",
    action: "retry",
    actionLabel: "Try again",
    severity: "error",
  },
  
  // Rate limiting
  RATE_LIMITED: {
    message: "Too many attempts. Please wait a moment and try again.",
    action: "retry",
    actionLabel: "Try again",
    severity: "warning",
  },
  TOO_MANY_REQUESTS: {
    message: "Too many attempts. Please wait a moment and try again.",
    action: "retry",
    actionLabel: "Try again",
    severity: "warning",
  },
  
  // Verification
  EMAIL_NOT_VERIFIED: {
    message: "Please verify your email address to continue.",
    action: null,
    severity: "warning",
  },
  OTP_EXPIRED: {
    message: "Verification code expired. Please request a new one.",
    action: "retry",
    actionLabel: "Resend code",
    severity: "warning",
  },
  INVALID_OTP: {
    message: "Invalid verification code. Please check and try again.",
    action: "check-details",
    actionLabel: "Try again",
    severity: "error",
  },
  
  // Payment specific
  INSUFFICIENT_FUNDS: {
    message: "Insufficient funds. Please check your balance.",
    action: null,
    severity: "error",
  },
  PAYMENT_DECLINED: {
    message: "Payment was declined. Please try a different payment method.",
    action: null,
    severity: "error",
  },
};

// Status code fallbacks (when no specific code is provided)
function getStatusFallback(status: number): UserFriendlyError {
  if (status === 0 || status === -1) {
    return {
      message: "You're offline or the connection is slow. Try again.",
      action: "retry",
      actionLabel: "Try again",
      severity: "warning",
    };
  }
  
  if (status === 401) {
    return {
      message: "Session expired. Please sign in again.",
      action: "sign-in",
      actionLabel: "Sign in",
      severity: "warning",
    };
  }
  
  if (status === 403) {
    return {
      message: "You don't have access to this.",
      action: null,
      severity: "error",
    };
  }
  
  if (status === 404) {
    return {
      message: "We couldn't find that.",
      action: null,
      severity: "warning",
    };
  }
  
  if (status === 409) {
    return {
      message: "That action was already completed.",
      action: null,
      severity: "info",
    };
  }
  
  if (status === 422 || status === 400) {
    return {
      message: "Please check your details and try again.",
      action: "check-details",
      actionLabel: "Try again",
      severity: "error",
    };
  }
  
  if (status === 429) {
    return {
      message: "Too many attempts. Please wait a moment and try again.",
      action: "retry",
      actionLabel: "Try again",
      severity: "warning",
    };
  }
  
  if (status >= 500) {
    return {
      message: "Something went wrong on our side. Try again.",
      action: "retry",
      actionLabel: "Try again",
      severity: "error",
    };
  }
  
  // Generic fallback
  return {
    message: "Something went wrong. Try again.",
    action: "retry",
    actionLabel: "Try again",
    severity: "error",
  };
}

// Check if error looks like a network/timeout error
function isNetworkError(err: unknown): boolean {
  if (!err) return false;
  
  const errorMessage = String((err as any)?.message || "").toLowerCase();
  const errorName = String((err as any)?.name || "").toLowerCase();
  const errorCause = String((err as any)?.cause || "").toLowerCase();
  
  const networkIndicators = [
    "network",
    "offline",
    "failed to fetch",
    "fetch failed",
    "networkerror",
    "timeout",
    "timedout",
    "timed out",
    "aborterror",
    "aborted",
    "econnrefused",
    "econnreset",
    "enotfound",
    "getaddrinfo",
    "dns",
    "socket",
    "connection",
    "net::",
    "err_network",
    "err_internet",
    "err_connection",
    "err_timed_out",
    "err_name_not_resolved",
    "certificate",
    "ssl",
    "tls",
    "epipe",
    "ehostunreach",
    "enetunreach",
  ];
  
  const combined = `${errorMessage} ${errorName} ${errorCause}`;
  
  return networkIndicators.some((indicator) => combined.includes(indicator));
}

/**
 * Maps any error to a user-friendly message.
 * 
 * Usage:
 *   const friendly = mapError(err);
 *   setErrorMessage(friendly.message);
 */
export function mapError(err: unknown): UserFriendlyError {
  // Handle network errors first
  if (isNetworkError(err)) {
    return {
      message: "You're offline or the connection is slow. Try again.",
      action: "retry",
      actionLabel: "Try again",
      severity: "warning",
    };
  }
  
  // Handle null/undefined
  if (!err) {
    return {
      message: "Something went wrong. Try again.",
      action: "retry",
      actionLabel: "Try again",
      severity: "error",
    };
  }
  
  // Extract info from error object
  const errObj = err as any;
  const code = String(errObj?.code || "").toUpperCase();
  const status = Number(errObj?.status || errObj?.statusCode || 0);
  
  // Check for known error codes
  if (code && CODE_MESSAGES[code]) {
    return CODE_MESSAGES[code];
  }
  
  // Check for status-based fallback
  if (status > 0) {
    return getStatusFallback(status);
  }
  
  // Final fallback
  return {
    message: "Something went wrong. Try again.",
    action: "retry",
    actionLabel: "Try again",
    severity: "error",
  };
}

/**
 * Simple string-only version for backward compatibility.
 * Returns just the message string.
 */
export function mapErrorMessage(err: unknown): string {
  return mapError(err).message;
}

/**
 * Check if error requires sign-in action.
 */
export function requiresSignIn(err: unknown): boolean {
  const friendly = mapError(err);
  return friendly.action === "sign-in";
}

/**
 * Check if error is retryable.
 */
export function isRetryable(err: unknown): boolean {
  const friendly = mapError(err);
  return friendly.action === "retry";
}

/**
 * Server-side error logging helper.
 * Logs full technical details while returning user-friendly message.
 * 
 * @param context - Where the error occurred (e.g., "login", "fetch dashboard")
 * @param err - The error object
 * @returns User-friendly error message
 */
export function logAndMapError(context: string, err: unknown): UserFriendlyError {
  // Log full technical details server-side
  console.error(`[${context}] Error:`, {
    message: (err as any)?.message,
    code: (err as any)?.code,
    status: (err as any)?.status,
    cause: (err as any)?.cause,
    stack: (err as any)?.stack?.split("\n").slice(0, 5).join("\n"),
  });
  
  // Return user-friendly message
  return mapError(err);
}

// Re-export for convenience
export type { UserFriendlyError as ErrorInfo };
