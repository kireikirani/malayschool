import { boolean, index, int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const pengumuman = mysqlTable(
  "pengumuman",
  {
    id: int("id").autoincrement().primaryKey(),
    tajuk: varchar("tajuk", { length: 200 }).notNull(),
    deskripsi: text("deskripsi"),
    imageUrl: text("image_url").notNull(),
    linkUrl: varchar("link_url", { length: 500 }),
    aktif: boolean("aktif").notNull().default(true),
    tamatPada: timestamp("tamat_pada"),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("pengumuman_aktif_idx").on(table.aktif),
    index("pengumuman_sort_order_idx").on(table.sortOrder),
  ],
);
