import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const unitJkDocuments = mysqlTable(
  "unit_jk_documents",
  {
    id: int("id").autoincrement().primaryKey(),
    unitSlug: varchar("unit_slug", { length: 50 }).notNull(),
    jkCode: varchar("jk_code", { length: 100 }).notNull(),
    label: varchar("label", { length: 200 }).notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: mysqlEnum("file_type", ["pdf", "image", "doc", "link"]).notNull().default("pdf"),
    tahun: varchar("tahun", { length: 10 }),
    isVisible: boolean("is_visible").notNull().default(true),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("unit_jk_docs_unit_slug_idx").on(table.unitSlug),
    index("unit_jk_docs_jk_code_idx").on(table.jkCode),
    index("unit_jk_docs_compound_idx").on(table.unitSlug, table.jkCode),
  ],
);
