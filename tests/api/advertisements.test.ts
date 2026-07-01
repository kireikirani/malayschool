import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "../helpers/db-mock";

vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn(() => true), getClientIp: vi.fn(() => "127.0.0.1") }));
vi.mock("@/lib/api/with-auth", () => ({ requireAdmin: vi.fn().mockResolvedValue({ user: { role: "admin" } }), getSession: vi.fn().mockResolvedValue({ user: { role: "admin" } }) }));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, eq: vi.fn((a, b) => ({ eq: [a, b] })), and: vi.fn((...a) => ({ and: a })), or: vi.fn((...a) => ({ or: a })), isNull: vi.fn((a) => ({ isNull: a })), lte: vi.fn((a, b) => ({ lte: [a, b] })), gte: vi.fn((a, b) => ({ gte: [a, b] })), count: vi.fn(() => "count") };
});

const adRow = {
  id: "ad-1", name: "Test Ad", type: "external_link",
  placement: "homepage_sidebar", content: "https://example.com",
  status: "inactive", startDate: null, endDate: null,
  createdAt: new Date(), updatedAt: new Date(),
};

function makeRequest(method: string, url: string, body?: unknown): Request {
  return new Request(`http://localhost${url}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
}

describe("GET /api/advertisements", () => {
  it("returns paginated ads list", async () => {
    (db as any).select = vi.fn()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => ({ offset: vi.fn(() => Promise.resolve([adRow])) })) })) })) })
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ total: 1 }])) })) });
    const { GET } = await import("@/app/api/advertisements/route");
    const res = await GET(makeRequest("GET", "/api/advertisements"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });
});

describe("POST /api/advertisements", () => {
  beforeEach(() => {
    (db as any).insert = vi.fn(() => ({ values: vi.fn(() => Promise.resolve()) }));
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([adRow])) })) })) }));
  });

  it("creates advertisement and returns 201", async () => {
    const { POST } = await import("@/app/api/advertisements/route");
    const res = await POST(makeRequest("POST", "/api/advertisements", { name: "Test Ad", type: "external_link", placement: "homepage_sidebar", content: "https://example.com", status: "inactive" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.name).toBe("Test Ad");
  });

  it("returns 400 for invalid placement", async () => {
    const { POST } = await import("@/app/api/advertisements/route");
    const res = await POST(makeRequest("POST", "/api/advertisements", { name: "Bad Ad", type: "external_link", placement: "invalid_spot", content: "https://example.com" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for non-url external_link content", async () => {
    const { POST } = await import("@/app/api/advertisements/route");
    const res = await POST(makeRequest("POST", "/api/advertisements", { name: "Bad Ad", type: "external_link", placement: "footer", content: "not-a-url" }));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/advertisements/[id]", () => {
  it("returns ad by id for admin", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([adRow])) })) })) }));
    const { GET } = await import("@/app/api/advertisements/[id]/route");
    const res = await GET(makeRequest("GET", "/api/advertisements/ad-1"), { params: Promise.resolve({ id: "ad-1" }) });
    expect(res.status).toBe(200);
  });

  it("returns 404 when not found", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([])) })) })) }));
    const { GET } = await import("@/app/api/advertisements/[id]/route");
    const res = await GET(makeRequest("GET", "/api/advertisements/nope"), { params: Promise.resolve({ id: "nope" }) });
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/advertisements/[id]", () => {
  it("updates advertisement status", async () => {
    (db as any).select = vi.fn()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([adRow])) })) })) })
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ ...adRow, status: "active" }])) })) })) });
    (db as any).update = vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) }));
    const { PATCH } = await import("@/app/api/advertisements/[id]/route");
    const res = await PATCH(makeRequest("PATCH", "/api/advertisements/ad-1", { status: "active" }), { params: Promise.resolve({ id: "ad-1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.status).toBe("active");
  });
});

describe("DELETE /api/advertisements/[id]", () => {
  it("deletes ad and returns 204", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ id: "ad-1" }])) })) })) }));
    (db as any).delete = vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) }));
    const { DELETE } = await import("@/app/api/advertisements/[id]/route");
    const res = await DELETE(makeRequest("DELETE", "/api/advertisements/ad-1"), { params: Promise.resolve({ id: "ad-1" }) });
    expect(res.status).toBe(204);
  });

  it("returns 404 when not found", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([])) })) })) }));
    const { DELETE } = await import("@/app/api/advertisements/[id]/route");
    const res = await DELETE(makeRequest("DELETE", "/api/advertisements/nope"), { params: Promise.resolve({ id: "nope" }) });
    expect(res.status).toBe(404);
  });
});
