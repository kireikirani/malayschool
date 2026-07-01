import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "../helpers/db-mock";

vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn(() => true), getClientIp: vi.fn(() => "127.0.0.1") }));
vi.mock("@/lib/api/with-auth", () => ({ requireAdmin: vi.fn().mockResolvedValue({ user: { role: "admin" } }) }));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, eq: vi.fn((a, b) => ({ eq: [a, b] })), and: vi.fn((...a) => ({ and: a })), like: vi.fn((a, b) => ({ like: [a, b] })), asc: vi.fn((a) => ({ asc: a })), count: vi.fn(() => "count") };
});

const pelajarRow = {
  id: 1, jantina: "lelaki", nama: "Ahmad Faris", tingkatan: "T5",
  dorm: "Dorm Jupiter", namaWaris: "Ahmad bin Kassim", noWaris: "0134442233",
  foto: null, status: "active", createdAt: new Date(), updatedAt: new Date(),
};

function makeRequest(method: string, url: string, body?: unknown): Request {
  return new Request(`http://localhost${url}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
}

describe("GET /api/asrama-pelajar", () => {
  it("returns paginated pelajar list", async () => {
    (db as any).select = vi.fn()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ orderBy: vi.fn(() => ({ limit: vi.fn(() => ({ offset: vi.fn(() => Promise.resolve([pelajarRow])) })) })) })) })) })
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ total: 1 }])) })) });
    const { GET } = await import("@/app/api/asrama-pelajar/route");
    const res = await GET(makeRequest("GET", "/api/asrama-pelajar?page=1&limit=20"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
  });
});

describe("POST /api/asrama-pelajar", () => {
  beforeEach(() => {
    (db as any).insert = vi.fn(() => ({ values: vi.fn(() => Promise.resolve([{ insertId: 1 }])) }));
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([pelajarRow])) })) })) }));
  });

  it("creates pelajar and returns 201", async () => {
    const { POST } = await import("@/app/api/asrama-pelajar/route");
    const res = await POST(makeRequest("POST", "/api/asrama-pelajar", { jantina: "lelaki", nama: "Ahmad Faris", tingkatan: "T5", dorm: "Dorm Jupiter", status: "active" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.nama).toBe("Ahmad Faris");
  });

  it("returns 400 on missing required fields", async () => {
    const { POST } = await import("@/app/api/asrama-pelajar/route");
    const res = await POST(makeRequest("POST", "/api/asrama-pelajar", { jantina: "lelaki" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 on invalid jantina", async () => {
    const { POST } = await import("@/app/api/asrama-pelajar/route");
    const res = await POST(makeRequest("POST", "/api/asrama-pelajar", { jantina: "unknown", nama: "Test", tingkatan: "T1", dorm: "A" }));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/asrama-pelajar/[id]", () => {
  it("returns pelajar by id", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([pelajarRow])) })) })) }));
    const { GET } = await import("@/app/api/asrama-pelajar/[id]/route");
    const res = await GET(makeRequest("GET", "/api/asrama-pelajar/1"), { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe(1);
  });

  it("returns 404 when not found", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([])) })) })) }));
    const { GET } = await import("@/app/api/asrama-pelajar/[id]/route");
    const res = await GET(makeRequest("GET", "/api/asrama-pelajar/999"), { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/asrama-pelajar/[id]", () => {
  it("updates pelajar dorm", async () => {
    (db as any).select = vi.fn()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })) })
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ ...pelajarRow, dorm: "Dorm Saturn" }])) })) })) });
    (db as any).update = vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) }));
    const { PATCH } = await import("@/app/api/asrama-pelajar/[id]/route");
    const res = await PATCH(makeRequest("PATCH", "/api/asrama-pelajar/1", { dorm: "Dorm Saturn" }), { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.dorm).toBe("Dorm Saturn");
  });
});

describe("DELETE /api/asrama-pelajar/[id]", () => {
  it("deletes pelajar and returns 204", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })) }));
    (db as any).delete = vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) }));
    const { DELETE } = await import("@/app/api/asrama-pelajar/[id]/route");
    const res = await DELETE(makeRequest("DELETE", "/api/asrama-pelajar/1"), { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(204);
  });

  it("returns 404 when not found", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([])) })) })) }));
    const { DELETE } = await import("@/app/api/asrama-pelajar/[id]/route");
    const res = await DELETE(makeRequest("DELETE", "/api/asrama-pelajar/999"), { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(404);
  });
});
