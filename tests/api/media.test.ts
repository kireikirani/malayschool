import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../helpers/db-mock";

const getSignedUrl = vi.fn();

vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/r2", () => ({
  getR2Config: vi.fn(() => ({
    accountId: "test-account-id",
    accessKeyId: "test-access-key-id",
    secretAccessKey: "test-secret-access-key",
    bucketName: "test-bucket",
    publicUrl: "https://pub-test.r2.dev",
  })),
  getR2Client: vi.fn(() => ({})),
}));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn(() => true), getClientIp: vi.fn(() => "127.0.0.1") }));
vi.mock("@/lib/api/with-auth", () => ({ requireAdmin: vi.fn().mockResolvedValue({ user: { id: "admin-1", role: "admin" } }) }));
vi.mock("@aws-sdk/s3-request-presigner", () => ({ getSignedUrl }));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    and: vi.fn((...args) => ({ and: args })),
    count: vi.fn(() => "count"),
    desc: vi.fn((arg) => ({ desc: arg })),
    eq: vi.fn((a, b) => ({ eq: [a, b] })),
    like: vi.fn((a, b) => ({ like: [a, b] })),
    or: vi.fn((...args) => ({ or: args })),
  };
});

function makeRequest(method: string, url: string, body?: unknown): Request {
  return new Request(`http://localhost${url}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("POST /api/media/presign", () => {
  beforeEach(() => {
    getSignedUrl.mockReset();
    getSignedUrl.mockResolvedValue("https://signed-upload.example.com/put");
  });

  it("creates presigned upload data for images", async () => {
    const { POST } = await import("@/app/api/media/presign/route");
    const res = await POST(
      makeRequest("POST", "/api/media/presign", {
        fileName: "poster.png",
        fileType: "image/png",
        fileSize: 1024,
        folder: "general",
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.uploadUrl).toBe("https://signed-upload.example.com/put");
    expect(body.data.fileKey).toMatch(/^general\//);
    expect(body.data.publicUrl).toContain("/general/");
  });

  it("rejects unsupported image mime types", async () => {
    const { POST } = await import("@/app/api/media/presign/route");
    const res = await POST(
      makeRequest("POST", "/api/media/presign", {
        fileName: "animated.gif",
        fileType: "image/gif",
        fileSize: 1024,
        folder: "general",
      }),
    );

    expect(res.status).toBe(400);
  });

  it("creates presigned upload data for documents", async () => {
    const { POST } = await import("@/app/api/media/presign/route");
    const res = await POST(
      makeRequest("POST", "/api/media/presign", {
        fileName: "report.pdf",
        fileType: "application/pdf",
        fileSize: 2048,
        folder: "documents",
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.fileKey).toMatch(/^documents\//);
  });

  it("rejects oversized documents", async () => {
    const { POST } = await import("@/app/api/media/presign/route");
    const res = await POST(
      makeRequest("POST", "/api/media/presign", {
        fileName: "report.pdf",
        fileType: "application/pdf",
        fileSize: 9 * 1024 * 1024,
        folder: "documents",
      }),
    );

    expect(res.status).toBe(400);
  });
});

describe("POST /api/media", () => {
  beforeEach(() => {
    (db as any).insert = vi.fn(() => ({ values: vi.fn(() => Promise.resolve()) }));
  });

  it("stores uploaded media metadata", async () => {
    const { POST } = await import("@/app/api/media/route");
    const res = await POST(
      makeRequest("POST", "/api/media", {
        fileName: "poster.png",
        filePath: "https://pub-48d5734c94824e309be2fcb7e6af7cfc.r2.dev/general/poster.png",
        fileKey: "general/poster.png",
        fileType: "image/png",
        fileSize: 1024,
        folder: "general",
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.uploadedBy).toBe("admin-1");
    expect(body.data.filePath).toContain(".r2.dev/general/");
  });
});
