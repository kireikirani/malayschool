import { index, int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const galleryAlbums = mysqlTable("gallery_albums", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  coverImage: varchar("cover_image", { length: 2048 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const galleryItems = mysqlTable(
  "gallery_items",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    albumId: varchar("album_id", { length: 36 })
      .notNull()
      .references(() => galleryAlbums.id, { onDelete: "cascade" }),
    image: varchar("image", { length: 2048 }).notNull(),
    caption: varchar("caption", { length: 500 }),
    order: int("order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("gallery_items_album_id_idx").on(table.albumId),
    index("gallery_items_album_order_idx").on(table.albumId, table.order),
  ],
);
