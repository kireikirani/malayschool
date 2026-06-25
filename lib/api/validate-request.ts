import type { ZodType } from "zod";
import { ApiError } from "./error-handler";

export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new ApiError("Invalid JSON body", 400);
  }
  return schema.parse(json);
}

export function parseQuery<T>(searchParams: URLSearchParams, schema: ZodType<T>): T {
  return schema.parse(Object.fromEntries(searchParams.entries()));
}
