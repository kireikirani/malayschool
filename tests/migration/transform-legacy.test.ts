import { describe, expect, it } from "vitest";
import type { LegacyPayload } from "@/scripts/migration/types";
import { transformLegacyPayload } from "@/scripts/migration/transform-legacy";
import { makeDeterministicSlug, normalizeOptionalText } from "@/scripts/migration/utils";

describe("migration utils", () => {
  it("creates deterministic fallback slugs", () => {
    expect(makeDeterministicSlug("", "news", 42)).toBe("news-42");
  });

  it("normalizes blank strings to null", () => {
    expect(normalizeOptionalText("   ")).toBeNull();
  });
});

describe("transformLegacyPayload", () => {
  it("preserves valid slugs and fills missing slugs deterministically", () => {
    const result = transformLegacyPayload({
      exportedAt: new Date().toISOString(),
      settings: [],
      users: [],
      media: [],
      teachers: [],
      advertisements: [],
      pengumuman: [],
      news: [
        {
          id: "news-1",
          title: "Alpha",
          slug: "alpha",
          content: "<p>Alpha</p>",
          thumbnail: undefined,
          status: "published",
          publishDate: undefined,
          metaTitle: undefined,
          metaDescription: undefined,
          ogImage: undefined,
          authorId: undefined
        },
        {
          id: "news-2",
          title: "Beta",
          slug: "",
          content: "<p>Beta</p>",
          thumbnail: undefined,
          status: "draft",
          publishDate: undefined,
          metaTitle: undefined,
          metaDescription: undefined,
          ogImage: undefined,
          authorId: undefined
        }
      ],
      gallery: [],
      asrama: [],
      unitDocuments: [],
      publicContent: [],
      unitSections: []
    } satisfies LegacyPayload);

    expect(result.news[0].slug).toBe("alpha");
    expect(result.news[1].slug).toBe("news-2");
  });
});
