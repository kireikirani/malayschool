import { boolean, index, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const user = mysqlTable(
  "user",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: varchar("image", { length: 2048 }),
    role: mysqlEnum("role", ["admin", "teacher", "visitor"]).notNull().default("visitor"),
    isApproved: boolean("is_approved").notNull().default(false),
    rejectionReason: text("rejection_reason"),
    // Teacher registration metadata (captured at sign-up, used by admin during approval)
    teacherPhone: varchar("teacher_phone", { length: 50 }),
    teacherSubject: varchar("teacher_subject", { length: 255 }),
    teacherNotes: text("teacher_notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("user_email_idx").on(table.email),
    index("user_role_idx").on(table.role),
    index("user_is_approved_idx").on(table.isApproved),
  ],
);

export const session = mysqlTable(
  "session",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: varchar("ip_address", { length: 100 }),
    userAgent: varchar("user_agent", { length: 500 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("session_user_id_idx").on(table.userId),
    uniqueIndex("session_token_idx").on(table.token),
  ],
);

export const account = mysqlTable(
  "account",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: varchar("account_id", { length: 255 }).notNull(),
    providerId: varchar("provider_id", { length: 100 }).notNull(),
    password: varchar("password", { length: 255 }),
    accessToken: varchar("access_token", { length: 2048 }),
    refreshToken: varchar("refresh_token", { length: 2048 }),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: varchar("scope", { length: 500 }),
    idToken: varchar("id_token", { length: 2048 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = mysqlTable("verification", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: varchar("value", { length: 500 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});
