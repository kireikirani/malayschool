import { getMigrationConfig } from "./config";

export const ROUTES = [
  "/",
  "/about",
  "/news",
  "/gallery",
  "/teachers",
  "/asrama",
  "/dokumen-sekolah",
  "/contact",
] as const;

async function main() {
  const { baseUrl } = getMigrationConfig();
  const results = await Promise.all(
    ROUTES.map(async (route) => {
      const response = await fetch(`${baseUrl}${route}`);
      return {
        route,
        ok: response.ok,
        status: response.status,
      };
    }),
  );

  console.log(JSON.stringify(results, null, 2));

  if (results.some((result) => !result.ok)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
