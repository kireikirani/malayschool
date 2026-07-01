/**
 * Auth mock helpers.
 * Import and call inside vi.mock() overrides.
 */
import { vi } from "vitest";

export const adminSession = {
  user: { id: "user-1", name: "Admin", email: "admin@test.com", role: "admin" },
  session: { id: "sess-1" },
};

export const publicSession = null;

/** Makes requireAdmin resolve (admin user). */
export function mockRequireAdmin() {
  return vi.fn().mockResolvedValue(adminSession);
}

/** Makes requireAdmin throw 401. */
export function mockRequireAdminUnauth() {
  const { ApiError } = require("@/lib/api/error-handler");
  return vi.fn().mockRejectedValue(new ApiError("Unauthorized", 401));
}

/** getSession returning admin session */
export function mockGetSessionAdmin() {
  return vi.fn().mockResolvedValue(adminSession);
}

/** getSession returning null (public) */
export function mockGetSessionPublic() {
  return vi.fn().mockResolvedValue(null);
}
