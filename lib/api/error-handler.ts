import { ZodError } from "zod";
import { fail } from "./response";

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string[]>;

  constructor(message: string, status = 400, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function isMysqlDuplicateError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "ER_DUP_ENTRY";
}

export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".") || "_root";
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    return fail("Validation failed", 400, fieldErrors);
  }

  if (err instanceof ApiError) {
    return fail(err.message, err.status, err.fieldErrors);
  }

  if (isMysqlDuplicateError(err)) {
    return fail("A record with this value already exists", 409);
  }

  console.error(err);
  return fail("Internal server error", 500);
}
