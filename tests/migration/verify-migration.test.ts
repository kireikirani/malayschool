import { describe, expect, it } from "vitest";
import { buildVerificationSummary } from "@/scripts/migration/verify-migration";

describe("buildVerificationSummary", () => {
  it("reports missing media and slug conflicts", () => {
    const summary = buildVerificationSummary({
      missingMedia: ["a.jpg"],
      duplicateSlugs: ["news/alpha"]
    });

    expect(summary.ok).toBe(false);
    expect(summary.errors).toContain("Missing media: a.jpg");
    expect(summary.errors).toContain("Duplicate slug: news/alpha");
  });
});
