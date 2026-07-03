import type { NextConfig } from "next";

function getRemoteImagePatterns() {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    { protocol: "https", hostname: "*.ufs.sh" },
    { protocol: "https", hostname: "utfs.io" },
    { protocol: "https", hostname: "lh3.googleusercontent.com" },
  ];

  const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  if (r2PublicUrl) {
    try {
      const { protocol, hostname, pathname } = new URL(r2PublicUrl);
      patterns.push({
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        pathname: `${pathname.replace(/\/$/, "") || ""}/**`,
      });
    } catch {
      // Ignore invalid env values so the app can still boot with the static patterns.
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getRemoteImagePatterns(),
  },
};

export default nextConfig;
