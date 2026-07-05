import { S3Client } from "@aws-sdk/client-s3";
import { ApiError } from "@/lib/api/error-handler";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
};

let cachedClient: S3Client | null = null;
let cachedConfig: R2Config | null = null;

function readEnv(name: keyof NodeJS.ProcessEnv) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new ApiError(`Missing required R2 environment variable: ${name}`, 500);
  }

  return value;
}

export function getR2Config(): R2Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  const publicUrl = readEnv("CLOUDFLARE_R2_PUBLIC_URL").replace(/\/$/, "");

  try {
    const parsedUrl = new URL(publicUrl);
    if (parsedUrl.protocol !== "https:") {
      throw new Error("R2 public URL must use https");
    }
  } catch {
    throw new ApiError("CLOUDFLARE_R2_PUBLIC_URL must be a valid https URL", 500);
  }

  cachedConfig = {
    accountId: readEnv("CLOUDFLARE_R2_ACCOUNT_ID"),
    accessKeyId: readEnv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
    secretAccessKey: readEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
    bucketName: readEnv("CLOUDFLARE_R2_BUCKET_NAME"),
    publicUrl,
  };

  return cachedConfig;
}

export function getR2Client() {
  if (cachedClient) {
    return cachedClient;
  }

  const config = getR2Config();

  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return cachedClient;
}
