/**
 * Shared DB mock factory.
 * Each test file calls `mockDb()` inside `vi.mock("@/lib/db", ...)` to get
 * a fully-typed stub that returns configurable data.
 */
import { vi } from "vitest";

export type MockQueryResult<T = Record<string, unknown>> = T[];

/** Returns a chainable drizzle-style builder that resolves to `rows`. */
export function buildChain<T>(rows: T[]) {
  const chain: Record<string, unknown> = {};
  const end = () => Promise.resolve(rows);
  const methods = ["select", "from", "where", "orderBy", "limit", "offset", "leftJoin", "groupBy"];
  for (const m of methods) {
    chain[m] = vi.fn(() => {
      // Return a thenable + the chain itself so callers can keep chaining or await
      const thenableChain = new Proxy(chain, {});
      (thenableChain as unknown as Promise<T[]>).then = (onfulfilled: unknown, onrejected: unknown) =>
        end().then(onfulfilled as never, onrejected as never);
      return thenableChain;
    });
  }
  return chain;
}

/** A simple mock for db.insert().values() → resolves to { insertId } */
export function buildInsert(insertId: number | string = 1) {
  return {
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve([{ insertId }])),
    })),
  };
}

/** A simple mock for db.update().set().where() */
export function buildUpdate() {
  return {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
      })),
    })),
  };
}

/** A simple mock for db.delete().where() */
export function buildDelete() {
  return {
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve([])),
    })),
  };
}
