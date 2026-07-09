import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "mysql", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "visitor",
        input: false,
      },
      teacherPhone: {
        type: "string",
        required: false,
        input: true,
      },
      teacherSubject: {
        type: "string",
        required: false,
        input: true,
      },
      teacherNotes: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Sign-ups via the public register page are teacher requests by default.
          // Admin accounts must be seeded/promoted manually via `npm run db:seed-admin`.
          return {
            data: {
              ...user,
              role: "teacher",
              isApproved: false,
            },
          };
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          // Block session creation for unapproved teacher accounts.
          const [u] = await db
            .select({
              role: schema.user.role,
              isApproved: schema.user.isApproved,
              rejectionReason: schema.user.rejectionReason,
            })
            .from(schema.user)
            .where(eq(schema.user.id, session.userId))
            .limit(1);

          if (u && u.role === "teacher" && !u.isApproved) {
            if (u.rejectionReason) {
              throw new Error(`Pendaftaran guru anda telah ditolak: ${u.rejectionReason}`);
            }
            throw new Error("Akaun guru anda belum diluluskan oleh admin. Sila tunggu kelulusan.");
          }
          return { data: session };
        },
      },
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
  },
  secret: (() => {
    let secret = (process.env.BETTER_AUTH_SECRET || "").trim();
    if (secret.startsWith('"') && secret.endsWith('"')) secret = secret.slice(1, -1).trim();
    else if (secret.startsWith("'") && secret.endsWith("'")) secret = secret.slice(1, -1).trim();
    return secret || undefined;
  })(),
  baseURL: (() => {
    let url = (process.env.BETTER_AUTH_URL || "").trim();
    if (url.startsWith('"') && url.endsWith('"')) url = url.slice(1, -1).trim();
    else if (url.startsWith("'") && url.endsWith("'")) url = url.slice(1, -1).trim();
    return url || undefined;
  })(),
});

/**
 * Block sign-in for teacher accounts that haven't been approved by an admin yet.
 * Admin accounts bypass this check (they are approved implicitly).
 * Returns an error message string if the user is not allowed to sign in, otherwise null.
 */
export async function checkTeacherApproval(email: string): Promise<string | null> {
  const [row] = await db
    .select({
      role: schema.user.role,
      isApproved: schema.user.isApproved,
      rejectionReason: schema.user.rejectionReason,
    })
    .from(schema.user)
    .where(eq(schema.user.email, email))
    .limit(1);

  if (!row) {
    return null; // let better-auth handle the "invalid credentials" path
  }

  // Admins are always allowed
  if (row.role === "admin") {
    return null;
  }

  // Teachers must be approved
  if (row.role === "teacher") {
    if (!row.isApproved) {
      if (row.rejectionReason) {
        return `Pendaftaran guru anda telah ditolak: ${row.rejectionReason}`;
      }
      return "Akaun guru anda belum diluluskan oleh admin. Sila tunggu kelulusan.";
    }
    return null;
  }

  return null;
}

export type Session = typeof auth.$Infer.Session;