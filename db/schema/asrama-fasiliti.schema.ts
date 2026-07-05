import { index, int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const asramaFasiliti = mysqlTable(
  "asrama_fasiliti",
  {
    id: int("id").autoincrement().primaryKey(),
    iconName: varchar("icon_name", { length: 100 }).notNull(),
    label: varchar("label", { length: 200 }).notNull(),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [index("asrama_fasiliti_sort_order_idx").on(table.sortOrder)],
);
