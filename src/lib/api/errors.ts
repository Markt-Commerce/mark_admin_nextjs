/**
 * One error shape for every failed admin API call, safe to send to the
 * browser (it never carries tokens or request bodies).
 *
 * The backend returns three body shapes:
 * - flask-smorest abort: { code, status, message }
 * - APIError raised directly: { message, status: "error", code, ...payload }
 * - webargs validation (422): { code, status, errors: { json: { field: [msg] } } }
 *   with no `message`.
 */
export interface ApiError {
  status: number;
  message: string;
  /** Per-field messages from a 422, keyed by request field name. */
  fieldErrors?: Record<string, string>;
  /** Seconds to wait, from a 429. */
  retryAfter?: number;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

const FALLBACK: Record<number, string> = {
  0: "Couldn't reach the Markt API. Check your connection and try again.",
  400: "The request wasn't accepted. Check the details and try again.",
  401: "Your session has ended. Sign in again.",
  403: "You don't have permission to do that.",
  404: "That record no longer exists. It may have been removed.",
  409: "That conflicts with an existing record.",
  422: "Some details need fixing before this can be saved.",
  429: "Too many attempts. Wait a moment and try again.",
  500: "Something went wrong on the server. Try again, and report it if it keeps happening.",
  503: "The service is temporarily unavailable. Try again in a few minutes.",
};

export function fallbackMessage(status: number): string {
  return FALLBACK[status] ?? FALLBACK[status >= 500 ? 500 : 400];
}

function flattenFieldErrors(errors: unknown): Record<string, string> | undefined {
  if (!errors || typeof errors !== "object") return undefined;
  const out: Record<string, string> = {};
  // webargs nests by location: { json: {...}, query: {...}, form: {...} }
  for (const [location, fields] of Object.entries(errors)) {
    if (location === "retry_after") continue;
    if (!fields || typeof fields !== "object") continue;
    for (const [field, messages] of Object.entries(fields as Record<string, unknown>)) {
      const first = Array.isArray(messages) ? messages[0] : messages;
      if (typeof first === "string") out[field] = first;
    }
  }
  return Object.keys(out).length ? out : undefined;
}

export function parseApiError(status: number, body: unknown, retryAfterHeader?: string | null): ApiError {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const fieldErrors = flattenFieldErrors(b.errors);
  const message =
    typeof b.message === "string" && b.message.trim()
      ? b.message
      : fieldErrors
        ? FALLBACK[422]
        : fallbackMessage(status);

  const errors = b.errors as Record<string, unknown> | undefined;
  const retryRaw = errors?.retry_after ?? retryAfterHeader;
  const retryAfter = retryRaw != null && !Number.isNaN(Number(retryRaw)) ? Number(retryRaw) : undefined;

  return { status, message, fieldErrors, retryAfter };
}
