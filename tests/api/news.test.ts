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
  return {
    ...actual,
    eq: vi.fn((a, b) => ({ eq: [a, b] })),
    and: vi.fn((...a) => ({ and: a })),
    like: vi.fn((a, b) => ({ like: [a, b] })),
    desc: vi.fn((a) => ({ desc: a })),
    gte: vi.fn((a, b) => ({ gte: [a, b] })),
    lte: vi.fn((a, b) => ({ lte: [a, b] })),
    count: vi.fn(() => "count"),
  };
});

const newsRow = {
  id: "news-1",
  title: "Test News",
  slug: "test-news",
  content: "<p>content</p>",
  status: "published",
  publishDate: new Date("2026-01-01"),
  thumbnail: null,
  metaTitle: null,
  metaDescription: null,
  ogImage: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeRequest(method: string, url: string, body?: unknown): Request {
  return new Request(`http://localhost${url}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ── GET /api/news ─────────────────────────────────────────────────────────────

describe("GET /api/news", () => {
  it("returns paginated news list", async () => {
    (db as any).select = vi.fn()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ orderBy: vi.fn(() => ({ limit: vi.fn(() => ({ offset: vi.fn(() => Promise.resolve([newsRow])) })) })) })) })) })
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ total: 1 }])) })) });

    const { GET } = await import("@/app/api/news/route");
    const res = await GET(makeRequest("GET", "/api/news?page=1&limit=12"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("pagination");
  });
});

// ── POST /api/news ────────────────────────────────────────────────────────────

describe("POST /api/news", () => {
  beforeEach(() => {
    (db as any).select = vi.fn()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([])) })) })) })
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([newsRow])) })) })) });
    (db as any).insert = vi.fn(() => ({ values: vi.fn(() => Promise.resolve()) }));
  });

  it("creates news and returns 201", async () => {
    const { POST } = await import("@/app/api/news/route");
    const res = await POST(makeRequest("POST", "/api/news", {
      title: "Test News",
      slug: "test-news",
      content: "<p>content</p>",
      status: "draft",
    }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toMatchObject({ title: "Test News" });
  });

  it("returns 409 when slug already exists", async () => {
    (db as any).select = vi.fn()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ id: "existing" }])) })) })) });

    const { POST } = await import("@/app/api/news/route");
    const res = await POST(makeRequest("POST", "/api/news", {
      title: "Test News",
      slug: "test-news",
      content: "<p>content</p>",
      status: "draft",
    }));
    expect(res.status).toBe(409);
  });

  it("returns 400 on invalid payload", async () => {
    const { POST } = await import("@/app/api/news/route");
    const res = await POST(makeRequest("POST", "/api/news", { title: "" }));
    expect(res.status).toBe(400);
  });
});

// ── GET /api/news/[id] ────────────────────────────────────────────────────────

describe("GET /api/news/[id]", () => {
  it("returns news by id", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([newsRow])) })) })) }));

    const { GET } = await import("@/app/api/news/[id]/route");
    const res = await GET(makeRequest("GET", "/api/news/news-1"), { params: Promise.resolve({ id: "news-1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe("news-1");
  });

  it("returns 404 for missing news", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([])) })) })) }));

    const { GET } = await import("@/app/api/news/[id]/route");
    const res = await GET(makeRequest("GET", "/api/news/nope"), { params: Promise.resolve({ id: "nope" }) });
    expect(res.status).toBe(404);
  });
});

// ── PATCH /api/news/[id] ──────────────────────────────────────────────────────

describe("PATCH /api/news/[id]", () => {
  it("updates and returns news", async () => {
    (db as any).select = vi.fn()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([newsRow])) })) })) })
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ id: "news-1" }])) })) })) })
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ ...newsRow, title: "Updated" }])) })) })) });
    (db as any).update = vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) }));

    const { PATCH } = await import("@/app/api/news/[id]/route");
    const res = await PATCH(makeRequest("PATCH", "/api/news/news-1", { title: "Updated" }), { params: Promise.resolve({ id: "news-1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.title).toBe("Updated");
  });
});

// ── DELETE /api/news/[id] ─────────────────────────────────────────────────────

describe("DELETE /api/news/[id]", () => {
  it("deletes news and returns 204", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ id: "news-1" }])) })) })) }));
    (db as any).delete = vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) }));

    const { DELETE } = await import("@/app/api/news/[id]/route");
    const res = await DELETE(makeRequest("DELETE", "/api/news/news-1"), { params: Promise.resolve({ id: "news-1" }) });
    expect(res.status).toBe(204);
  });

  it("returns 404 when news not found", async () => {
    (db as any).select = vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([])) })) })) }));

    const { DELETE } = await import("@/app/api/news/[id]/route");
    const res = await DELETE(makeRequest("DELETE", "/api/news/nope"), { params: Promise.resolve({ id: "nope" }) });
    expect(res.status).toBe(404);
  });
});
