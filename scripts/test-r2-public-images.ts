import "dotenv/config";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getR2Client, getR2Config } from "../lib/r2";

const IMAGE_FILES = [
  "public/brand/logo.png",
  "public/gallery/sekolah/bangunan-sekolah.jpg",
  "public/gallery/sekolah/hero-mace.jpg",
  "public/gallery/pentadbiran/gpk-hem-norliza.png",
  "public/gallery/pentadbiran/gpk-kokurikulum-masroha.png",
  "public/gallery/pentadbiran/gpk-pentadbiran-sharul.png",
  "public/gallery/pentadbiran/gpk-tingkatan-6-awaludin.png",
  "public/gallery/pentadbiran/pengetua-hanizam.png",
] as const;

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

async function main() {
  const r2 = getR2Config();
  const client = getR2Client();
  const uploaded: string[] = [];

  for (const relativePath of IMAGE_FILES) {
    const absolutePath = path.join(process.cwd(), relativePath);
    const ext = path.extname(relativePath).toLowerCase();
    const contentType = MIME_TYPES[ext];

    if (!contentType) {
      throw new Error(`Unsupported image extension for ${relativePath}`);
    }

    const buffer = await readFile(absolutePath);
    const objectKey = `general/smoke-test/${relativePath.replace(/^public\//, "").replaceAll("\\", "/")}`;

    await client.send(
      new PutObjectCommand({
        Bucket: r2.bucketName,
        Key: objectKey,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    const publicUrl = `${r2.publicUrl}/${objectKey}`;
    uploaded.push(`${relativePath} -> ${publicUrl}`);
  }

  console.log("R2 smoke upload passed:");
  for (const line of uploaded) {
    console.log(line);
  }
}

main().catch((error) => {
  console.error("R2 smoke upload failed.");
  console.error(error);
  process.exitCode = 1;
});
