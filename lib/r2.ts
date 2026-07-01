import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.CLOUDFLARE_R2_ACCOUNT_ID) {
  console.warn("WARNING: CLOUDFLARE_R2_ACCOUNT_ID environment variable is not defined.");
}

export const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID || "dummy"}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "dummy",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "dummy",
  },
});
