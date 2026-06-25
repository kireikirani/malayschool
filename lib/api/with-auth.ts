import { auth } from "@/lib/auth";
import { ApiError } from "./error-handler";

export async function getSession(req: Request) {
  return auth.api.getSession({ headers: req.headers });
}

export async function getSessionOrThrow(req: Request) {
  const session = await getSession(req);
  if (!session) {
    throw new ApiError("Unauthorized", 401);
  }
  return session;
}

export async function requireAdmin(req: Request) {
  const session = await getSessionOrThrow(req);
  if (session.user.role !== "admin") {
    throw new ApiError("Forbidden", 403);
  }
  return session;
}
