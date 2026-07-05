import { index, int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const asramaWardens = mysqlTable(
  "asrama_wardens",
  {
    id: int("id").autoincrement().primaryKey(),
    nama: varchar("nama", { length: 200 }).notNull(),
    jawatan: varchar("jawatan", { length: 200 }).notNull(),
    telefon: varchar("telefon", { length: 50 }),
    foto: varchar("foto", { length: 2048 }),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [index("asrama_wardens_sort_order_idx").on(table.sortOrder)],
);
