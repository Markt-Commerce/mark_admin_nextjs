import "server-only";

import { type ApiResult, parseApiError } from "./errors";

const BASE_URL = process.env.MARKT_API_URL;

type Query = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH";
  /** JSON-serialisable body, or FormData for multipart uploads. */
  body?: unknown;
  query?: Query;
  token?: string;
}

function buildUrl(path: string, query?: Query): string {
  if (!BASE_URL) {
    throw new Error("MARKT_API_URL is not set. Copy .env.example to .env.local.");
  }
  const url = new URL(`${BASE_URL.replace(/\/$/, "")}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Call the Flask API from the Next.js server. Never throws for HTTP or
 * network failures: every outcome comes back as an ApiResult so callers
 * handle errors explicitly. Request bodies and tokens are never logged.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const { method = "GET", body, query, token } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: payload,
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: parseApiError(0, null) };
  }

  if (response.status === 204) {
    return { ok: true, data: undefined as T };
  }

  let json: unknown = null;
  try {
    json = await response.json();
  } catch {
    // Non-JSON body (proxy error page and the like): fall back by status.
  }

  if (!response.ok) {
    return {
      ok: false,
      error: parseApiError(response.status, json, response.headers.get("Retry-After")),
    };
  }
  return { ok: true, data: json as T };
}
