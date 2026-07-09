import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "../helpers/db-mock";

const mockSession = {
  user: {
    id: "user-teacher-1",
    name: "Cikgu Ahmad",
    email: "ahmad@school.edu.my",
    role: "teacher",
    teacherPhone: "0123456789",
    teacherSubject: "Sains",
    teacherNotes: "Guru Cemerlang",
  },
};

let currentSession: any = mockSession;

vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => true),
  getClientIp: vi.fn(() => "127.0.0.1"),
}));
vi.mock("@/lib/api/with-auth", () => ({
  getSession: vi.fn(() => Promise.resolve(currentSession)),
}));

function makeRequest(method: string, url: string, body?: unknown): Request {
  return new Request(`http://localhost${url}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("GET /api/teacher-self-service", () => {
  beforeEach(() => {
    currentSession = mockSession;
  });

  it("returns 401 if unauthorized (no session)", async () => {
    currentSession = null;
    const { GET } = await import("@/app/api/teacher-self-service/route");
    const res = await GET(makeRequest("GET", "/api/teacher-self-service"));
    expect(res.status).toBe(401);
  });

  it("returns 401 if user is not a teacher", async () => {
    currentSession = { user: { role: "admin" } };
    const { GET } = await import("@/app/api/teacher-self-service/route");
    const res = await GET(makeRequest("GET", "/api/teacher-self-service"));
    expect(res.status).toBe(401);
  });

  it("returns teacher profile details and initializes if not found", async () => {
    const teacherRow = {
      id: "teacher-1",
      userId: "user-teacher-1",
      name: "Cikgu Ahmad",
      phone: "0123456789",
      subject: "Sains",
      notes: "Guru Cemerlang",
      status: "active",
    };

    (db as any).select = vi.fn()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([])) })) })) }) // first search: empty
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([teacherRow])) })) })) }); // second search: initialized row

    (db as any).insert = vi.fn(() => ({ values: vi.fn(() => Promise.resolve()) }));

    const { GET } = await import("@/app/api/teacher-self-service/route");
    const res = await GET(makeRequest("GET", "/api/teacher-self-service"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.name).toBe("Cikgu Ahmad");
    expect(db.insert).toHaveBeenCalled();
  });
});

describe("PATCH /api/teacher-self-service", () => {
  beforeEach(() => {
    currentSession = mockSession;
  });

  it("updates teacher profile details", async () => {
    const teacherRow = {
      id: "teacher-1",
      userId: "user-teacher-1",
      name: "Cikgu Ahmad Baru",
      phone: "0129999999",
      subject: "Matematik",
      status: "active",
    };

    (db as any).select = vi.fn()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([{ id: "teacher-1" }])) })) })) }) // verification search
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve([teacherRow])) })) })) }); // post-update fetch

    (db as any).update = vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) }));

    const { PATCH } = await import("@/app/api/teacher-self-service/route");
    const res = await PATCH(
      makeRequest("PATCH", "/api/teacher-self-service", {
        name: "Cikgu Ahmad Baru",
        phone: "0129999999",
        subject: "Matematik",
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe("Cikgu Ahmad Baru");
    expect(body.data.phone).toBe("0129999999");
    expect(db.update).toHaveBeenCalled();
  });
});
