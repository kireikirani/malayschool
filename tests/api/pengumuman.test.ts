import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "../helpers/db-mock";

vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn(() => true), getClientIp: vi.fn(() => "127.0.0.1") }));
vi.mock("@/lib/api/with-auth", () => ({ requireAdmin: vi.fn().mockResolvedValue({ user: { role: "admin" } }), getSession: vi.fn().mockResolvedValue({ user: { role: "admin" } }) }));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, eq: vi.fn((a, b) => ({ eq: [a, b] })), and: vi.fn((...a) => ({ and: a })), asc: vi.fn((a) => ({ asc: a })), desc: vi.fn((a) => ({ desc: a })), count: vi.fn(() => "count") };
});

const pengRow = {
  id: 1, tajuk: "Pengumuman Ujian", deskripsi: "Sila hadir tepat masa",
  imageUrl: "/public/images/poster.jpg", linkUrl: null, aktif: true,
  tamatPada: null, sortOrder: 0, createdAt: new Date(), updatedAt: new Date(),
};

function makeRequest(method: string, url: string, body?: unknown): Request {
  return new Request(`http://localhost${url}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
}

describe("GET /api/pengumuman", () => {
  it("returns paginated pengumuman list", async () => {
    (db as any).select = vi.fn()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ orderBy: vi.fn(() => ({ limit: vi.fn(() => ({ offset: vi.fn(() => Promise.resolve([pengRow])) })) })) })) })) })
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ total: 1 }])) })) });
    const { GET } = await import("@/app/api/pengumuman/route");
    const res = await GET(makeRequest("GET", "/api/pengumuman?page=1&limit=10"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
  });
});

describe("POST /api/pengumuman", () => {
  beforeEach(() => {
    (db as any).insert = vi.fn(() => ({ values: vi.fn(() => Promise.resolve([{ insertId: 1 }])) }));
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([pengRow])) })) })) }));
  });

  it("creates pengumuman and returns 201", async () => {
    const { POST } = await import("@/app/api/pengumuman/route");
    const res = await POST(makeRequest("POST", "/api/pengumuman", { tajuk: "Pengumuman Ujian", deskripsi: "Sila hadir", imageUrl: "/public/images/poster.jpg", aktif: true, sortOrder: 0 }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.tajuk).toBe("Pengumuman Ujian");
  });

  it("returns 400 when tajuk is empty", async () => {
    const { POST } = await import("@/app/api/pengumuman/route");
    const res = await POST(makeRequest("POST", "/api/pengumuman", { tajuk: "", imageUrl: "/public/images/poster.jpg" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when imageUrl is missing", async () => {
    const { POST } = await import("@/app/api/pengumuman/route");
    const res = await POST(makeRequest("POST", "/api/pengumuman", { tajuk: "Valid Tajuk" }));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/pengumuman/[id]", () => {
  it("returns pengumuman by id", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([pengRow])) })) })) }));
    const { GET } = await import("@/app/api/pengumuman/[id]/route");
    const res = await GET(makeRequest("GET", "/api/pengumuman/1"), { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.tajuk).toBe("Pengumuman Ujian");
  });

  it("returns 404 when not found", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([])) })) })) }));
    const { GET } = await import("@/app/api/pengumuman/[id]/route");
    const res = await GET(makeRequest("GET", "/api/pengumuman/999"), { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/pengumuman/[id]", () => {
  it("updates pengumuman tajuk", async () => {
    (db as any).select = vi.fn()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })) })
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ ...pengRow, tajuk: "Dikemaskini" }])) })) })) });
    (db as any).update = vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) }));
    const { PATCH } = await import("@/app/api/pengumuman/[id]/route");
    const res = await PATCH(makeRequest("PATCH", "/api/pengumuman/1", { tajuk: "Dikemaskini" }), { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.tajuk).toBe("Dikemaskini");
  });
});

describe("DELETE /api/pengumuman/[id]", () => {
  it("deletes pengumuman and returns 204", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })) }));
    (db as any).delete = vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) }));
    const { DELETE } = await import("@/app/api/pengumuman/[id]/route");
    const res = await DELETE(makeRequest("DELETE", "/api/pengumuman/1"), { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(204);
  });

  it("returns 404 when not found", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([])) })) })) }));
    const { DELETE } = await import("@/app/api/pengumuman/[id]/route");
    const res = await DELETE(makeRequest("DELETE", "/api/pengumuman/999"), { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(404);
  });
});
