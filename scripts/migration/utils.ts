import { randomUUID } from "node:crypto";
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { ensureMigrationDataDir, getMigrationConfig } from "./config";

export function normalizeOptionalText(value: string | null | undefined) {
  if (!value) return null;
  const normalized = value.trim();
  return normalized.length ? normalized : null;
}

export function makeDeterministicSlug(value: string | null | undefined, prefix: string, fallbackId: number | string) {
  const base = value
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (base && base.length) return base;

  const idStr = String(fallbackId);
  if (idStr.startsWith(`${prefix}-`)) {
    return idStr;
  }
  return `${prefix}-${fallbackId}`;
}

export function makeStableId(value?: string | null) {
  const normalized = value?.trim();
  return normalized && normalized.length ? normalized : randomUUID();
}

export function normalizeMediaPath(value: string | null | undefined) {
  if (!value) return "";
  return value.replace(/\\/g, "/").replace(/^https?:\/\/[^/]+/i, "");
}

export function normalizeMediaFolder(value: string | null | undefined) {
  const normalized = normalizeOptionalText(value)?.toLowerCase().replace(/[^a-z0-9/_-]+/g, "-");
  return normalized || "general";
}

export function fileNameFromPath(value: string) {
  return path.basename(value);
}

export function fileKeyFromPath(value: string) {
  const normalized = normalizeMediaPath(value).replace(/^\/+/, "");
  return normalized || fileNameFromPath(value);
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as T;
}

export async function writeJsonFile(filePath: string, payload: unknown) {
  await ensureMigrationDataDir();
  await writeFile(filePath, JSON.stringify(payload, null, 2));
}

export function getRawPayloadPath() {
  return path.join(getMigrationConfig().dataDir, "legacy-raw.json");
}

export function getTransformedPayloadPath() {
  return path.join(getMigrationConfig().dataDir, "legacy-transformed.json");
}

export function logDryRun(prefix: string, payload: unknown) {
  console.log(`[dry-run] ${prefix}`, JSON.stringify(payload));
}
