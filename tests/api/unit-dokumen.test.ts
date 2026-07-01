import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "../helpers/db-mock";

vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn(() => true), getClientIp: vi.fn(() => "127.0.0.1") }));
vi.mock("@/lib/api/with-auth", () => ({ requireAdmin: vi.fn().mockResolvedValue({ user: { role: "admin" } }) }));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, eq: vi.fn((a, b) => ({ eq: [a, b] })), and: vi.fn((...a) => ({ and: a })), asc: vi.fn((a) => ({ asc: a })), count: vi.fn(() => "count") };
});

const dokRow = {
  id: 1, unitSlug: "pentadbiran", type: "dokumen", label: "Log Harian Pengurusan",
  fileUrl: "/documents/log-harian.pdf", fileType: "pdf", tahun: "2026",
  sortOrder: 0, createdAt: new Date(), updatedAt: new Date(),
};

function makeRequest(method: string, url: string, body?: unknown): Request {
  return new Request(`http://localhost${url}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
}

describe("GET /api/unit-dokumen", () => {
  it("returns paginated dokumen list", async () => {
    (db as any).select = vi.fn()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ orderBy: vi.fn(() => ({ limit: vi.fn(() => ({ offset: vi.fn(() => Promise.resolve([dokRow])) })) })) })) })) })
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ total: 1 }])) })) });
    const { GET } = await import("@/app/api/unit-dokumen/route");
    const res = await GET(makeRequest("GET", "/api/unit-dokumen?unitSlug=pentadbiran"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].unitSlug).toBe("pentadbiran");
  });
});

describe("POST /api/unit-dokumen", () => {
  beforeEach(() => {
    (db as any).insert = vi.fn(() => ({ values: vi.fn(() => Promise.resolve([{ insertId: 1 }])) }));
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([dokRow])) })) })) }));
  });

  it("creates dokumen and returns 201", async () => {
    const { POST } = await import("@/app/api/unit-dokumen/route");
    const res = await POST(makeRequest("POST", "/api/unit-dokumen", { unitSlug: "pentadbiran", type: "dokumen", label: "Log Harian Pengurusan", fileUrl: "/documents/log-harian.pdf", fileType: "pdf" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.label).toBe("Log Harian Pengurusan");
  });

  it("returns 400 when unitSlug is missing", async () => {
    const { POST } = await import("@/app/api/unit-dokumen/route");
    const res = await POST(makeRequest("POST", "/api/unit-dokumen", { label: "Test", fileUrl: "/doc.pdf" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid type", async () => {
    const { POST } = await import("@/app/api/unit-dokumen/route");
    const res = await POST(makeRequest("POST", "/api/unit-dokumen", { unitSlug: "pentadbiran", type: "invalid-type", label: "Test", fileUrl: "/doc.pdf" }));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/unit-dokumen/[id]", () => {
  it("returns dokumen by id", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([dokRow])) })) })) }));
    const { GET } = await import("@/app/api/unit-dokumen/[id]/route");
    const res = await GET(makeRequest("GET", "/api/unit-dokumen/1"), { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe(1);
  });

  it("returns 404 when not found", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([])) })) })) }));
    const { GET } = await import("@/app/api/unit-dokumen/[id]/route");
    const res = await GET(makeRequest("GET", "/api/unit-dokumen/999"), { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/unit-dokumen/[id]", () => {
  it("updates dokumen label", async () => {
    (db as any).select = vi.fn()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })) })
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ ...dokRow, label: "Label Baharu" }])) })) })) });
    (db as any).update = vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) }));
    const { PATCH } = await import("@/app/api/unit-dokumen/[id]/route");
    const res = await PATCH(makeRequest("PATCH", "/api/unit-dokumen/1", { label: "Label Baharu" }), { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.label).toBe("Label Baharu");
  });
});

describe("DELETE /api/unit-dokumen/[id]", () => {
  it("deletes dokumen and returns 204", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })) }));
    (db as any).delete = vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) }));
    const { DELETE } = await import("@/app/api/unit-dokumen/[id]/route");
    const res = await DELETE(makeRequest("DELETE", "/api/unit-dokumen/1"), { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(204);
  });

  it("returns 404 when not found", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([])) })) })) }));
    const { DELETE } = await import("@/app/api/unit-dokumen/[id]/route");
    const res = await DELETE(makeRequest("DELETE", "/api/unit-dokumen/999"), { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(404);
  });
});
