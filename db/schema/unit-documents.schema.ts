import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const unitDocuments = mysqlTable(
  "unit_documents",
  {
    id: int("id").autoincrement().primaryKey(),
    unitSlug: varchar("unit_slug", { length: 50 }).notNull(),
    type: mysqlEnum("type", ["carta-org", "dokumen"]).notNull().default("dokumen"),
    label: varchar("label", { length: 200 }).notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: mysqlEnum("file_type", ["pdf", "image", "doc"]).notNull().default("pdf"),
    tahun: varchar("tahun", { length: 10 }),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("unit_documents_unit_slug_idx").on(table.unitSlug),
    index("unit_documents_type_idx").on(table.type),
  ],
);
