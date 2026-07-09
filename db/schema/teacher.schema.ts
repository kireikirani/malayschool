import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { user } from "./auth.schema";

export const teachers = mysqlTable(
  "teachers",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).references(() => user.id, { onDelete: "set null" }),
    name: varchar("name", { length: 255 }).notNull(),
    position: varchar("position", { length: 255 }),
    photo: varchar("photo", { length: 2048 }),
    biography: text("biography"),
    phone: varchar("phone", { length: 50 }),
    subject: varchar("subject", { length: 255 }),
    notes: text("notes"),
    sortOrder: int("sort_order").notNull().default(0),
    status: mysqlEnum("status", ["active", "inactive"]).notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("teachers_status_idx").on(table.status),
    index("teachers_name_idx").on(table.name),
    index("teachers_sort_order_idx").on(table.sortOrder),
    uniqueIndex("teachers_user_id_idx").on(table.userId),
  ],
);
