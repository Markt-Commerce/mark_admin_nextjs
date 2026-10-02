/** Helpers for reading list filters from the URL safely. */

type Raw = Record<string, string | string[] | undefined>;

export function str(sp: Raw, key: string): string | undefined {
  const v = sp[key];
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.trim() ? s.trim() : undefined;
}

/** A value from a fixed list, or undefined (unknown values are ignored). */
export function oneOf<T extends string>(sp: Raw, key: string, allowed: readonly T[]): T | undefined {
  const s = str(sp, key);
  return s && (allowed as readonly string[]).includes(s) ? (s as T) : undefined;
}

export function pageNumber(sp: Raw): number {
  const n = Number(str(sp, "page"));
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export function bool(sp: Raw, key: string): "true" | "false" | undefined {
  return oneOf(sp, key, ["true", "false"] as const);
}

/** Drop undefined entries, e.g. for building links that keep filters. */
export function compact(params: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)) as Record<string, string>;
}
