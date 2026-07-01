import { index, int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const unitJkMembers = mysqlTable(
  "unit_jk_members",
  {
    id: int("id").autoincrement().primaryKey(),
    unitSlug: varchar("unit_slug", { length: 50 }).notNull(),
    jkCode: varchar("jk_code", { length: 20 }).notNull(),
    jkTitle: varchar("jk_title", { length: 200 }).notNull(),
    nama: varchar("nama", { length: 200 }).notNull(),
    jawatan: varchar("jawatan", { length: 200 }).notNull(),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("unit_jk_members_unit_slug_idx").on(table.unitSlug),
    index("unit_jk_members_jk_code_idx").on(table.jkCode),
  ],
);
