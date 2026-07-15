// Characters that start a formula in spreadsheet apps (CSV injection)
const FORMULA_PREFIXES = /^[=+\-@\t\r|]/;

// Keys that could trigger prototype pollution
const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/** Strip null bytes and formula-injection prefixes from a string cell value. */
export function sanitizeCell(value: string): string {
  return value
    .replace(/\0/g, "")           // null bytes
    .replace(FORMULA_PREFIXES, "") // formula injection
    .trim();
}

/** Sanitize a score/column key name: strip null bytes, block prototype pollution, cap length. */
export function sanitizeScoreKey(key: string): string | null {
  const clean = key.replace(/\0/g, "").trim().slice(0, 100);
  if (DANGEROUS_KEYS.has(clean.toLowerCase())) return null;
  if (clean.length === 0) return null;
  return clean;
}

/** Sanitize a full scores record. Returns only valid entries. */
export function sanitizeScores(scores: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {};
  let count = 0;
  for (const [rawKey, value] of Object.entries(scores)) {
    if (count >= 50) break; // cap number of traits
    const key = sanitizeScoreKey(rawKey);
    if (!key) continue;
    const num = Number(value);
    if (!isFinite(num)) continue;
    result[key] = num;
    count++;
  }
  return result;
}
