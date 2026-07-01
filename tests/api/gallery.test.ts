import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "../helpers/db-mock";

vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn(() => true), getClientIp: vi.fn(() => "127.0.0.1") }));
vi.mock("@/lib/api/with-auth", () => ({ requireAdmin: vi.fn().mockResolvedValue({ user: { role: "admin" } }) }));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, eq: vi.fn((a, b) => ({ eq: [a, b] })), like: vi.fn((a, b) => ({ like: [a, b] })), count: vi.fn(() => "count") };
});

const albumRow = { id: "album-1", name: "Hari Sukan 2026", description: "Album hari sukan", coverImage: null, itemCount: 0, createdAt: new Date(), updatedAt: new Date() };

function makeRequest(method: string, url: string, body?: unknown): Request {
  return new Request(`http://localhost${url}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
}

describe("GET /api/gallery/albums", () => {
  it("returns paginated album list", async () => {
    (db as any).select = vi.fn()
      .mockReturnValueOnce({ from: vi.fn(() => ({ leftJoin: vi.fn(() => ({ where: vi.fn(() => ({ groupBy: vi.fn(() => ({ limit: vi.fn(() => ({ offset: vi.fn(() => Promise.resolve([albumRow])) })) })) })) })) })) })
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ total: 1 }])) })) });
    const { GET } = await import("@/app/api/gallery/albums/route");
    const res = await GET(makeRequest("GET", "/api/gallery/albums?page=1&limit=12"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.pagination.total).toBe(1);
  });
});

describe("POST /api/gallery/albums", () => {
  beforeEach(() => {
    (db as any).insert = vi.fn(() => ({ values: vi.fn(() => Promise.resolve()) }));
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([albumRow])) })) })) }));
  });

  it("creates album and returns 201", async () => {
    const { POST } = await import("@/app/api/gallery/albums/route");
    const res = await POST(makeRequest("POST", "/api/gallery/albums", { name: "Hari Sukan 2026", description: "Album hari sukan" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.name).toBe("Hari Sukan 2026");
  });

  it("returns 400 when name is empty", async () => {
    const { POST } = await import("@/app/api/gallery/albums/route");
    const res = await POST(makeRequest("POST", "/api/gallery/albums", { name: "" }));
    expect(res.status).toBe(400);
  });
});
