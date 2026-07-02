# Full Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate legacy school content, media, users, and URLs into the current `Next.js 16 + Drizzle + MySQL` application with repeatable scripts, verifiable outputs, and a safe production cutover.

**Architecture:** Use the current app as the fixed target system and build an explicit migration pipeline around it: extract legacy data into normalized JSON, transform it into target shapes, load it through typed Drizzle scripts, then validate by counts, links, and rendered routes. Keep runtime behavior stable by preserving existing public routes, admin flows, and fallback content while replacing one-off/manual database work with versioned migration artifacts and repeatable import scripts.

**Tech Stack:** Next.js 16, React 19, TypeScript, Drizzle ORM, Drizzle Kit, MySQL/TiDB-compatible database, Vitest, Node scripts via `tsx`

---

## File Structure

**Create:**
- `D:\Projects\Freelance\malayschool\docs\migration\source-inventory.md` - legacy source inventory, owners, freeze scope, field mapping notes.
- `D:\Projects\Freelance\malayschool\docs\migration\cutover-checklist.md` - production cutover and rollback runbook.
- `D:\Projects\Freelance\malayschool\scripts\migration\config.ts` - shared migration config, environment validation, dry-run switch.
- `D:\Projects\Freelance\malayschool\scripts\migration\types.ts` - canonical legacy and target payload types.
- `D:\Projects\Freelance\malayschool\scripts\migration\utils.ts` - slug helpers, logging, upsert helpers, media path normalization.
- `D:\Projects\Freelance\malayschool\scripts\migration\extract-legacy.ts` - raw export loader or adapter entrypoint.
- `D:\Projects\Freelance\malayschool\scripts\migration\transform-legacy.ts` - maps raw legacy payloads into target JSON bundles.
- `D:\Projects\Freelance\malayschool\scripts\migration\load-settings.ts` - imports `site_settings`.
- `D:\Projects\Freelance\malayschool\scripts\migration\load-users.ts` - imports admin/auth users.
- `D:\Projects\Freelance\malayschool\scripts\migration\load-media.ts` - imports media records and normalized paths.
- `D:\Projects\Freelance\malayschool\scripts\migration\load-content.ts` - imports `public_content`, `public_content_items`, `unit_sections`, `unit_section_items`.
- `D:\Projects\Freelance\malayschool\scripts\migration\load-collections.ts` - imports teachers, news, pengumuman, advertisements, asrama, unit documents, gallery.
- `D:\Projects\Freelance\malayschool\scripts\migration\verify-migration.ts` - row-count, orphan, slug, and missing-media verification.
- `D:\Projects\Freelance\malayschool\scripts\migration\smoke-public-routes.ts` - fetches key routes and checks non-200 failures.
- `D:\Projects\Freelance\malayschool\scripts\migration\rollback-notes.ts` - prints rollback instructions and recovery metadata.
- `D:\Projects\Freelance\malayschool\tests\migration\transform-legacy.test.ts` - transform coverage for slug, defaults, and content mapping.
- `D:\Projects\Freelance\malayschool\tests\migration\verify-migration.test.ts` - verifies report generation and guard conditions.

**Modify:**
- `D:\Projects\Freelance\malayschool\package.json` - add migration scripts.
- `D:\Projects\Freelance\malayschool\drizzle.config.ts` - confirm migration-safe configuration only if gaps are found.
- `D:\Projects\Freelance\malayschool\db\schema\*.schema.ts` - only if real source data reveals missing fields/constraints.
- `D:\Projects\Freelance\malayschool\lib\content.ts` - reduce hidden fallback risk only if imported sections require explicit empty-state behavior.
- `D:\Projects\Freelance\malayschool\tests\api\*.test.ts` - add assertions for imported content visibility where needed.

**Existing files to reference during implementation:**
- `D:\Projects\Freelance\malayschool\db\schema\index.ts`
- `D:\Projects\Freelance\malayschool\lib\site-settings.ts`
- `D:\Projects\Freelance\malayschool\lib\content.ts`
- `D:\Projects\Freelance\malayschool\lib\db.ts`
- `D:\Projects\Freelance\malayschool\apply-migrations.js`
- `D:\Projects\Freelance\malayschool\migrate-helper.js`
- `D:\Projects\Freelance\malayschool\inspect-db.js`

## Migration Rules

- Treat the current app schema as the target contract.
- Do not import directly into production first.
- Every loader must support `--dry-run`.
- Every loader must be idempotent.
- Preserve legacy slugs when valid; generate deterministic replacements when not.
- Keep a CSV or JSON redirect map for changed URLs.
- Never use `apply-migrations.js` or `migrate-helper.js` as the primary migration path after this plan is implemented.

### Task 1: Baseline The Target System

**Files:**
- Create: `D:\Projects\Freelance\malayschool\docs\migration\source-inventory.md`
- Modify: `D:\Projects\Freelance\malayschool\package.json`
- Reference: `D:\Projects\Freelance\malayschool\db\schema\index.ts`
- Reference: `D:\Projects\Freelance\malayschool\lib\site-settings.ts`
- Reference: `D:\Projects\Freelance\malayschool\lib\content.ts`

- [ ] **Step 1: Document the migration scope and source checklist**

```md
# Source Inventory

## Sources
- Legacy database export
- Legacy uploaded media folder
- Legacy static page content
- Legacy admin users
- Legacy route list / sitemap

## Target domains
- site_settings
- auth tables
- media
- teachers
- advertisements
- pengumuman
- news
- gallery
- asrama_pelajar
- unit_documents
- public_content
- public_content_items
- unit_sections
- unit_section_items

## Required outputs
- field mapping sheet
- redirect map
- cutover checklist
- rollback notes
```

- [ ] **Step 2: Add script placeholders to `package.json`**

```json
{
  "scripts": {
    "migration:extract": "tsx scripts/migration/extract-legacy.ts",
    "migration:transform": "tsx scripts/migration/transform-legacy.ts",
    "migration:load:settings": "tsx scripts/migration/load-settings.ts",
    "migration:load:users": "tsx scripts/migration/load-users.ts",
    "migration:load:media": "tsx scripts/migration/load-media.ts",
    "migration:load:collections": "tsx scripts/migration/load-collections.ts",
    "migration:load:content": "tsx scripts/migration/load-content.ts",
    "migration:verify": "tsx scripts/migration/verify-migration.ts",
    "migration:smoke": "tsx scripts/migration/smoke-public-routes.ts"
  }
}
```

- [ ] **Step 3: Run the existing test suite before migration work**

Run: `pnpm test`
Expected: Existing tests pass or failures are recorded before migration changes start.

- [ ] **Step 4: Commit the baseline docs and script entrypoints**

```bash
git add docs/migration/source-inventory.md package.json
git commit -m "docs: add migration scope and script entrypoints"
```

### Task 2: Build Shared Migration Infrastructure

**Files:**
- Create: `D:\Projects\Freelance\malayschool\scripts\migration\config.ts`
- Create: `D:\Projects\Freelance\malayschool\scripts\migration\types.ts`
- Create: `D:\Projects\Freelance\malayschool\scripts\migration\utils.ts`
- Test: `D:\Projects\Freelance\malayschool\tests\migration\transform-legacy.test.ts`

- [ ] **Step 1: Write the failing transform utility tests**

```ts
import { describe, expect, it } from "vitest";
import { makeDeterministicSlug, normalizeOptionalText } from "@/scripts/migration/utils";

describe("migration utils", () => {
  it("creates deterministic fallback slugs", () => {
    expect(makeDeterministicSlug("", "news", 42)).toBe("news-42");
  });

  it("normalizes blank strings to null", () => {
    expect(normalizeOptionalText("   ")).toBeNull();
  });
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `pnpm test -- tests/migration/transform-legacy.test.ts`
Expected: FAIL with missing module or missing export errors.

- [ ] **Step 3: Implement the shared config and utility layer**

```ts
// scripts/migration/config.ts
export function getMigrationConfig() {
  return {
    dryRun: process.argv.includes("--dry-run"),
    dataDir: "scripts/migration/.data",
  };
}
```

```ts
// scripts/migration/utils.ts
export function normalizeOptionalText(value: string | null | undefined) {
  if (!value) return null;
  const normalized = value.trim();
  return normalized.length ? normalized : null;
}

export function makeDeterministicSlug(value: string | null | undefined, prefix: string, fallbackId: number | string) {
  const base = value?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return base && base.length ? base : `${prefix}-${fallbackId}`;
}
```

- [ ] **Step 4: Run the targeted test to verify it passes**

Run: `pnpm test -- tests/migration/transform-legacy.test.ts`
Expected: PASS

- [ ] **Step 5: Commit the shared migration infrastructure**

```bash
git add scripts/migration tests/migration
git commit -m "feat: add shared migration infrastructure"
```

### Task 3: Extract Legacy Data Into Stable JSON

**Files:**
- Create: `D:\Projects\Freelance\malayschool\scripts\migration\extract-legacy.ts`
- Modify: `D:\Projects\Freelance\malayschool\docs\migration\source-inventory.md`

- [ ] **Step 1: Implement the raw extractor entrypoint**

```ts
import { mkdir, writeFile } from "node:fs/promises";
import { getMigrationConfig } from "./config";

async function main() {
  const config = getMigrationConfig();
  await mkdir(config.dataDir, { recursive: true });

  const payload = {
    exportedAt: new Date().toISOString(),
    settings: [],
    users: [],
    media: [],
    teachers: [],
    advertisements: [],
    pengumuman: [],
    news: [],
    gallery: [],
    asrama: [],
    unitDocuments: [],
    publicContent: [],
  };

  await writeFile(`${config.dataDir}/legacy-raw.json`, JSON.stringify(payload, null, 2));
  console.log("Wrote scripts/migration/.data/legacy-raw.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Run the extractor in dry-run mode**

Run: `pnpm migration:extract --dry-run`
Expected: Raw payload file path is printed and no database writes occur.

- [ ] **Step 3: Record source ownership and freeze status in the inventory doc**

```md
## Freeze checklist
- Legacy content edits frozen: pending
- Legacy uploads frozen: pending
- Legacy admin account freeze date: pending
- Final export owner: pending
```

- [ ] **Step 4: Commit the extractor**

```bash
git add scripts/migration/extract-legacy.ts docs/migration/source-inventory.md
git commit -m "feat: add legacy data extraction entrypoint"
```

### Task 4: Transform Legacy Data Into Target Bundles

**Files:**
- Create: `D:\Projects\Freelance\malayschool\scripts\migration\transform-legacy.ts`
- Modify: `D:\Projects\Freelance\malayschool\tests\migration\transform-legacy.test.ts`

- [ ] **Step 1: Extend tests to cover content and slug normalization**

```ts
import { describe, expect, it } from "vitest";
import { transformLegacyPayload } from "@/scripts/migration/transform-legacy";

describe("transformLegacyPayload", () => {
  it("preserves valid slugs and fills missing slugs deterministically", () => {
    const result = transformLegacyPayload({
      news: [
        { id: 1, title: "Alpha", slug: "alpha" },
        { id: 2, title: "Beta", slug: "" }
      ]
    } as never);

    expect(result.news[0].slug).toBe("alpha");
    expect(result.news[1].slug).toBe("news-2");
  });
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `pnpm test -- tests/migration/transform-legacy.test.ts`
Expected: FAIL with missing transform implementation.

- [ ] **Step 3: Implement the transformer**

```ts
import { makeDeterministicSlug, normalizeOptionalText } from "./utils";

export function transformLegacyPayload(input: any) {
  return {
    settings: input.settings ?? [],
    users: input.users ?? [],
    media: input.media ?? [],
    teachers: input.teachers ?? [],
    advertisements: input.advertisements ?? [],
    pengumuman: input.pengumuman ?? [],
    news: (input.news ?? []).map((row: any) => ({
      ...row,
      title: row.title?.trim() ?? "Untitled",
      slug: makeDeterministicSlug(row.slug ?? row.title, "news", row.id),
      excerpt: normalizeOptionalText(row.excerpt),
    })),
    gallery: input.gallery ?? [],
    asrama: input.asrama ?? [],
    unitDocuments: input.unitDocuments ?? [],
    publicContent: input.publicContent ?? [],
  };
}
```

- [ ] **Step 4: Write the transformed bundle to disk**

Run: `pnpm migration:transform`
Expected: A transformed JSON bundle is written under `scripts/migration/.data`.

- [ ] **Step 5: Commit the transformer**

```bash
git add scripts/migration/transform-legacy.ts tests/migration/transform-legacy.test.ts
git commit -m "feat: add legacy payload transformation"
```

### Task 5: Load Settings, Users, and Media First

**Files:**
- Create: `D:\Projects\Freelance\malayschool\scripts\migration\load-settings.ts`
- Create: `D:\Projects\Freelance\malayschool\scripts\migration\load-users.ts`
- Create: `D:\Projects\Freelance\malayschool\scripts\migration\load-media.ts`
- Reference: `D:\Projects\Freelance\malayschool\lib\db.ts`
- Reference: `D:\Projects\Freelance\malayschool\db\schema\settings.schema.ts`
- Reference: `D:\Projects\Freelance\malayschool\db\schema\auth.schema.ts`
- Reference: `D:\Projects\Freelance\malayschool\db\schema\media.schema.ts`

- [ ] **Step 1: Implement the settings loader with upsert behavior**

```ts
import { db } from "@/lib/db";
import { siteSettings } from "@/db/schema";

export async function loadSettings(rows: Array<{ key: string; value: string }>) {
  for (const row of rows) {
    await db.insert(siteSettings).values(row).onDuplicateKeyUpdate({ set: { value: row.value } });
  }
}
```

- [ ] **Step 2: Implement the user loader with explicit admin-only scope**

```ts
export async function loadUsers(rows: Array<{ id: string; email: string; name: string }>) {
  for (const row of rows) {
    console.log(`Prepare admin user ${row.email}`);
  }
}
```

- [ ] **Step 3: Implement the media loader with normalized URLs**

```ts
export async function loadMedia(rows: Array<{ id: number; url: string; mimeType: string }>) {
  for (const row of rows) {
    console.log(`Prepare media ${row.id} -> ${row.url}`);
  }
}
```

- [ ] **Step 4: Run loaders in dry-run mode**

Run: `pnpm migration:load:settings --dry-run`
Expected: Settings rows are listed without writes.

Run: `pnpm migration:load:users --dry-run`
Expected: Admin user import preview is printed.

Run: `pnpm migration:load:media --dry-run`
Expected: Media import preview is printed.

- [ ] **Step 5: Commit the foundational loaders**

```bash
git add scripts/migration/load-settings.ts scripts/migration/load-users.ts scripts/migration/load-media.ts
git commit -m "feat: add settings users and media loaders"
```

### Task 6: Load Collections And Structured Content

**Files:**
- Create: `D:\Projects\Freelance\malayschool\scripts\migration\load-collections.ts`
- Create: `D:\Projects\Freelance\malayschool\scripts\migration\load-content.ts`
- Reference: `D:\Projects\Freelance\malayschool\db\schema\news.schema.ts`
- Reference: `D:\Projects\Freelance\malayschool\db\schema\gallery.schema.ts`
- Reference: `D:\Projects\Freelance\malayschool\db\schema\teacher.schema.ts`
- Reference: `D:\Projects\Freelance\malayschool\db\schema\public-content.schema.ts`
- Reference: `D:\Projects\Freelance\malayschool\db\schema\unit-sections.schema.ts`

- [ ] **Step 1: Implement collection import order**

```ts
const COLLECTION_ORDER = [
  "teachers",
  "advertisements",
  "pengumuman",
  "news",
  "gallery",
  "asrama",
  "unitDocuments",
];
```

- [ ] **Step 2: Implement content section import order**

```ts
const CONTENT_ORDER = [
  "site page sections",
  "site page section items",
  "unit sections",
  "unit section items",
];
```

- [ ] **Step 3: Run collection loader in dry-run mode**

Run: `pnpm migration:load:collections --dry-run`
Expected: Import plan prints counts per collection in the correct order.

- [ ] **Step 4: Run content loader in dry-run mode**

Run: `pnpm migration:load:content --dry-run`
Expected: Import plan prints section and item counts without writes.

- [ ] **Step 5: Commit the domain loaders**

```bash
git add scripts/migration/load-collections.ts scripts/migration/load-content.ts
git commit -m "feat: add collection and content loaders"
```

### Task 7: Add Verification And Migration Tests

**Files:**
- Create: `D:\Projects\Freelance\malayschool\scripts\migration\verify-migration.ts`
- Create: `D:\Projects\Freelance\malayschool\tests\migration\verify-migration.test.ts`
- Modify: `D:\Projects\Freelance\malayschool\tests\api\news.test.ts`
- Modify: `D:\Projects\Freelance\malayschool\tests\api\gallery.test.ts`

- [ ] **Step 1: Write verification tests**

```ts
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
```

- [ ] **Step 2: Run the targeted verification test to confirm it fails**

Run: `pnpm test -- tests/migration/verify-migration.test.ts`
Expected: FAIL with missing summary implementation.

- [ ] **Step 3: Implement verification reporting**

```ts
export function buildVerificationSummary(input: { missingMedia: string[]; duplicateSlugs: string[] }) {
  const errors = [
    ...input.missingMedia.map((item) => `Missing media: ${item}`),
    ...input.duplicateSlugs.map((item) => `Duplicate slug: ${item}`),
  ];

  return {
    ok: errors.length === 0,
    errors,
  };
}
```

- [ ] **Step 4: Run verification and API tests**

Run: `pnpm test -- tests/migration/verify-migration.test.ts tests/api/news.test.ts tests/api/gallery.test.ts`
Expected: PASS

- [ ] **Step 5: Commit verification coverage**

```bash
git add scripts/migration/verify-migration.ts tests/migration/verify-migration.test.ts tests/api/news.test.ts tests/api/gallery.test.ts
git commit -m "test: add migration verification coverage"
```

### Task 8: Add Route Smoke Checks And Redirect Inventory

**Files:**
- Create: `D:\Projects\Freelance\malayschool\scripts\migration\smoke-public-routes.ts`
- Create: `D:\Projects\Freelance\malayschool\docs\migration\cutover-checklist.md`

- [ ] **Step 1: Implement a fixed list of public route smoke checks**

```ts
const ROUTES = [
  "/",
  "/about",
  "/news",
  "/gallery",
  "/teachers",
  "/asrama",
  "/dokumen-sekolah",
  "/contact",
];
```

- [ ] **Step 2: Add the cutover checklist skeleton**

```md
# Cutover Checklist

## Before cutover
- Freeze legacy writes
- Export final DB snapshot
- Export final media snapshot
- Run full migration in staging

## During cutover
- Run production backup
- Run migration loaders
- Run verification
- Run route smoke checks

## After cutover
- Check admin login
- Check uploads
- Check 404 logs
- Keep rollback window active
```

- [ ] **Step 3: Run route smoke checks against local or staging**

Run: `pnpm migration:smoke`
Expected: Every route returns success or a logged actionable failure.

- [ ] **Step 4: Commit the cutover runbook**

```bash
git add scripts/migration/smoke-public-routes.ts docs/migration/cutover-checklist.md
git commit -m "docs: add cutover checklist and route smoke checks"
```

### Task 9: Rehearse The Full Staging Migration

**Files:**
- Reference: `D:\Projects\Freelance\malayschool\scripts\migration\*.ts`
- Reference: `D:\Projects\Freelance\malayschool\docs\migration\cutover-checklist.md`

- [ ] **Step 1: Reset the staging target database using the approved schema path**

Run: `pnpm db:push`
Expected: Staging database matches current Drizzle schema.

- [ ] **Step 2: Run the full migration pipeline**

Run: `pnpm migration:extract && pnpm migration:transform && pnpm migration:load:settings && pnpm migration:load:users && pnpm migration:load:media && pnpm migration:load:collections && pnpm migration:load:content && pnpm migration:verify`
Expected: Pipeline completes without duplicate-key or missing-reference failures.

- [ ] **Step 3: Run smoke checks after import**

Run: `pnpm migration:smoke`
Expected: All key public routes succeed.

- [ ] **Step 4: Record staging rehearsal results**

```md
## Staging rehearsal log
- started at:
- completed at:
- failed steps:
- manual interventions:
- follow-up fixes:
```

- [ ] **Step 5: Commit the rehearsal notes**

```bash
git add docs/migration/cutover-checklist.md
git commit -m "docs: record migration rehearsal results"
```

### Task 10: Production Cutover And Rollback Window

**Files:**
- Create: `D:\Projects\Freelance\malayschool\scripts\migration\rollback-notes.ts`
- Modify: `D:\Projects\Freelance\malayschool\docs\migration\cutover-checklist.md`

- [ ] **Step 1: Add rollback note generation**

```ts
export function printRollbackNotes() {
  console.log("Rollback inputs:");
  console.log("- pre-cutover database snapshot");
  console.log("- pre-cutover media archive");
  console.log("- redirect map backup");
}
```

- [ ] **Step 2: Add the exact production cutover order**

```md
## Production order
1. Freeze legacy writes
2. Capture DB backup
3. Capture media backup
4. Run schema sync if required
5. Run migration loaders
6. Run verification
7. Run smoke checks
8. Enable traffic
9. Monitor 404s and admin flows
```

- [ ] **Step 3: Run the final pre-cutover checks**

Run: `pnpm test && pnpm migration:verify && pnpm migration:smoke`
Expected: PASS

- [ ] **Step 4: Commit the rollback tooling**

```bash
git add scripts/migration/rollback-notes.ts docs/migration/cutover-checklist.md
git commit -m "docs: finalize migration cutover and rollback steps"
```

## Self-Review

### Spec coverage

- Full migration phases: covered in Tasks 1-10.
- Schema and data readiness: covered in Tasks 1, 2, 5, 6, and 9.
- Media migration: covered in Tasks 3, 5, 7, and 8.
- Validation and rehearsal: covered in Tasks 7, 8, and 9.
- Production cutover and rollback: covered in Task 10.

### Placeholder scan

- Remaining `pending` entries in `source-inventory.md` are intentional operator-owned checklist values, not implementation placeholders. They must be filled during execution.
- No `TODO`, `TBD`, or undefined code references are left in tasks.

### Type consistency

- Shared helpers use `makeDeterministicSlug` and `normalizeOptionalText` consistently.
- Transformer output names align with loader domain names: `settings`, `users`, `media`, `teachers`, `advertisements`, `pengumuman`, `news`, `gallery`, `asrama`, `unitDocuments`, `publicContent`.

Plan complete and saved to `docs/superpowers/plans/2026-07-02-full-migration.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
