/**
 * Display helpers. They only reformat real backend values; they never
 * invent a value. A missing value renders as an em dash (—) in the UI.
 */

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Lagos",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Lagos",
});

/**
 * The backend serialises naive UTC datetimes with isoformat() (no "Z").
 * Treat a timestamp without an offset as UTC rather than local time.
 */
function parseBackendDate(value: string): Date | null {
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
  const date = new Date(hasZone ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = parseBackendDate(value);
  return date ? dateFormatter.format(date) : null;
}

export function formatDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = parseBackendDate(value);
  return date ? dateTimeFormatter.format(date) : null;
}

/** Up to two initials from a name, e.g. "Balogun Fabrics" -> "BF". */
export function initials(name: string | null | undefined): string {
  const words = (name ?? "").trim().split(/[\s._-]+/).filter(Boolean);
  if (!words.length) return "?";
  const letters = words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0];
  return letters.toUpperCase();
}

/**
 * `profile_picture` defaults to the bare string "default.jpg" in the
 * backend, which is not an image anyone can load. Only http(s) URLs count.
 */
export function imageUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : null;
}

/**
 * Read `Seller.shop_address` the same way the customer API does
 * (app/users/schemas.py shop_address_line): {formatted | street |
 * street_address, city, state}.
 */
export function shopAddress(raw: unknown): { line: string | null; city: string | null; state: string | null } {
  if (!raw || typeof raw !== "object") return { line: null, city: null, state: null };
  const r = raw as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  return {
    line: str(r.formatted) ?? str(r.street) ?? str(r.street_address),
    city: str(r.city),
    state: str(r.state),
  };
}

/** Show only the last four digits: "•••• 6789". */
export function maskTail(value: string, visible = 4): string {
  if (value.length <= visible) return "•".repeat(value.length);
  return `•••• ${value.slice(-visible)}`;
}

export function formatRating(total: number | null, raters: number | null): string | null {
  if (!raters || total == null) return null;
  return (total / raters).toFixed(1);
}

export function pluralise(count: number, one: string, many = `${one}s`): string {
  return `${count.toLocaleString("en-GB")} ${count === 1 ? one : many}`;
}
