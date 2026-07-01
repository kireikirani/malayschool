import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "../helpers/db-mock";

vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => true),
  getClientIp: vi.fn(() => "127.0.0.1"),
}));
vi.mock("@/lib/api/with-auth", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ user: { role: "admin" } }),
  getSession: vi.fn().mockResolvedValue({ user: { role: "admin" } }),
}));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, eq: vi.fn((a, b) => ({ eq: [a, b] })), and: vi.fn((...a) => ({ and: a })), like: vi.fn((a, b) => ({ like: [a, b] })), asc: vi.fn((a) => ({ asc: a })), count: vi.fn(() => "count") };
});

const teacherRow = {
  id: "teacher-1", name: "Ahmad bin Ali", position: "Guru Sains",
  photo: null, biography: "Guru berpengalaman", status: "active",
  createdAt: new Date(), updatedAt: new Date(),
};

function makeRequest(method: string, url: string, body?: unknown): Request {
  return new Request(`http://localhost${url}`, {
    method, headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("GET /api/teachers", () => {
  it("returns paginated teacher list", async () => {
    (db as any).select = vi.fn()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ orderBy: vi.fn(() => ({ limit: vi.fn(() => ({ offset: vi.fn(() => Promise.resolve([teacherRow])) })) })) })) })) })
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ total: 1 }])) })) });

    const { GET } = await import("@/app/api/teachers/route");
    const res = await GET(makeRequest("GET", "/api/teachers?page=1&limit=12"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.pagination.total).toBe(1);
  });
});

describe("POST /api/teachers", () => {
  beforeEach(() => {
    (db as any).insert = vi.fn(() => ({ values: vi.fn(() => Promise.resolve()) }));
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([teacherRow])) })) })) }));
  });

  it("creates teacher and returns 201", async () => {
    const { POST } = await import("@/app/api/teachers/route");
    const res = await POST(makeRequest("POST", "/api/teachers", { name: "Ahmad bin Ali", position: "Guru Sains", status: "active" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.name).toBe("Ahmad bin Ali");
  });

  it("returns 400 on missing name", async () => {
    const { POST } = await import("@/app/api/teachers/route");
    const res = await POST(makeRequest("POST", "/api/teachers", { position: "Guru" }));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/teachers/[id]", () => {
  it("returns teacher by id", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([teacherRow])) })) })) }));
    const { GET } = await import("@/app/api/teachers/[id]/route");
    const res = await GET(makeRequest("GET", "/api/teachers/teacher-1"), { params: Promise.resolve({ id: "teacher-1" }) });
    expect(res.status).toBe(200);
  });

  it("returns 404 if not found", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([])) })) })) }));
    const { GET } = await import("@/app/api/teachers/[id]/route");
    const res = await GET(makeRequest("GET", "/api/teachers/nope"), { params: Promise.resolve({ id: "nope" }) });
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/teachers/[id]", () => {
  it("updates teacher", async () => {
    (db as any).select = vi.fn()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ id: "teacher-1" }])) })) })) })
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ ...teacherRow, position: "Guru Matematik" }])) })) })) });
    (db as any).update = vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) }));

    const { PATCH } = await import("@/app/api/teachers/[id]/route");
    const res = await PATCH(makeRequest("PATCH", "/api/teachers/teacher-1", { position: "Guru Matematik" }), { params: Promise.resolve({ id: "teacher-1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.position).toBe("Guru Matematik");
  });
});

describe("DELETE /api/teachers/[id]", () => {
  it("deletes teacher and returns 204", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ id: "teacher-1" }])) })) })) }));
    (db as any).delete = vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) }));
    const { DELETE } = await import("@/app/api/teachers/[id]/route");
    const res = await DELETE(makeRequest("DELETE", "/api/teachers/teacher-1"), { params: Promise.resolve({ id: "teacher-1" }) });
    expect(res.status).toBe(204);
  });

  it("returns 404 when not found", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([])) })) })) }));
    const { DELETE } = await import("@/app/api/teachers/[id]/route");
    const res = await DELETE(makeRequest("DELETE", "/api/teachers/nope"), { params: Promise.resolve({ id: "nope" }) });
    expect(res.status).toBe(404);
  });
});
