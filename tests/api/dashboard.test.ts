import { describe, it, expect, vi } from "vitest";
import { db } from "../helpers/db-mock";

vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/api/with-auth", () => ({ requireAdmin: vi.fn().mockResolvedValue({ user: { role: "admin" } }) }));
vi.mock("@/lib/units", () => ({ UNITS: [{ slug: "pentadbiran" }, { slug: "kurikulum" }, { slug: "hem" }, { slug: "kokurikulum" }, { slug: "tingkatan-6" }] }));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, eq: vi.fn((a, b) => ({ eq: [a, b] })), and: vi.fn((...a) => ({ and: a })), desc: vi.fn((a) => ({ desc: a })), count: vi.fn(() => "count") };
});

function makeRequest(method: string, url: string): Request {
  return new Request(`http://localhost${url}`, { method });
}

describe("GET /api/dashboard", () => {
  it("returns counts, health, and recentActivity", async () => {
    const countQ = (n: number) => ({
      from: vi.fn(() => Promise.resolve([{ total: n }])),
    });
    const recentQ = (rows: unknown[]) => ({
      from: vi.fn(() => ({
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve(rows)),
        })),
      })),
    });
    const recentQWhere = (rows: unknown[]) => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ total: rows.length }])),
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve(rows)),
        })),
      })),
    });

    const newsRow = { id: "n1", title: "News", updatedAt: new Date() };
    const teacherRow = { id: "t1", name: "Teacher", updatedAt: new Date() };
    const adRow = { id: "a1", name: "Ad", updatedAt: new Date() };
    const pengRow = { id: 1, tajuk: "Peng", updatedAt: new Date() };
    const contentRow = { id: 1, title: "Content", pageKey: "about", sectionKey: "hero", updatedAt: new Date() };
    const asramaRow = { id: 1, nama: "Pelajar", updatedAt: new Date() };
    const dokRow = { id: 1, label: "Dok", updatedAt: new Date() };

    (db as any).select = vi.fn()
      .mockReturnValueOnce(countQ(5))    // news
      .mockReturnValueOnce(countQ(3))    // galleryAlbums
      .mockReturnValueOnce(countQ(10))   // teachers
      .mockReturnValueOnce(countQ(2))    // advertisements
      .mockReturnValueOnce(countQ(20))   // media
      .mockReturnValueOnce(countQ(4))    // pengumuman
      .mockReturnValueOnce(countQ(6))    // publicContent
      .mockReturnValueOnce(countQ(8))    // unitSections
      // asramaStudents — uses .where()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ total: 150 }])) })) })
      // unitDocuments (dokumen) — uses .where()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ total: 7 }])) })) })
      // carta-org — uses .where()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ total: 3 }])) })) })
      // about sections — uses .where()
      .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ total: 1 }])) })) })
      .mockReturnValueOnce(recentQ([newsRow]))
      .mockReturnValueOnce(recentQ([teacherRow]))
      .mockReturnValueOnce(recentQ([adRow]))
      .mockReturnValueOnce(recentQ([pengRow]))
      .mockReturnValueOnce(recentQ([contentRow]))
      .mockReturnValueOnce(recentQ([asramaRow]))
      .mockReturnValueOnce(recentQ([dokRow]));

    const { GET } = await import("@/app/api/dashboard/route");
    const res = await GET(makeRequest("GET", "/api/dashboard"));
    expect(res.status).toBe(200);

    const body = await res.json();
    const data = body.data;

    expect(data.counts.news).toBe(5);
    expect(data.counts.teachers).toBe(10);
    expect(data.counts.asramaStudents).toBe(150);
    expect(data.counts.unitDocuments).toBe(7);
    expect(typeof data.health.missingUnitCharts).toBe("number");
    expect(typeof data.health.emptyAboutSections).toBe("number");
    expect(Array.isArray(data.recentActivity)).toBe(true);
    expect(data.recentActivity.length).toBeGreaterThan(0);
    expect(data.recentActivity[0]).toHaveProperty("type");
    expect(data.recentActivity[0]).toHaveProperty("title");
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api/error-handler");
    const withAuth = await import("@/lib/api/with-auth");
    vi.mocked(withAuth.requireAdmin).mockRejectedValueOnce(new ApiError("Unauthorized", 401));

    const { GET } = await import("@/app/api/dashboard/route");
    const res = await GET(makeRequest("GET", "/api/dashboard"));
    expect(res.status).toBe(401);
  });
});
