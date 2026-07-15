import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const ubkLinks = mysqlTable("ubk_links", {
  id: int("id").autoincrement().primaryKey(),
  tingkatan: varchar("tingkatan", { length: 50 }).notNull(),
  label: varchar("label", { length: 200 }),
  sheetUrl: text("sheet_url").notNull(),
  lastImportedAt: timestamp("last_imported_at"),
  lastImportCount: int("last_import_count"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});
