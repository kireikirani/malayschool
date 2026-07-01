/**
 * Shared mutable db stub.
 * Tests assign methods directly: `db.select = vi.fn(...)`
 * The vi.mock factory returns this object as `{ db }`.
 */
export const db: Record<string, unknown> = {};
