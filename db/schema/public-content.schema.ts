import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const publicContent = mysqlTable(
  "public_content",
  {
    id: int("id").autoincrement().primaryKey(),
    pageKey: varchar("page_key", { length: 50 }).notNull(),
    sectionKey: varchar("section_key", { length: 100 }).notNull(),
    type: mysqlEnum("type", [
      "hero",
      "text_block",
      "stats",
      "poster",
      "file_list",
      "quick_links",
      "simple_table",
      "card_grid",
      "gallery",
      "jk_table",
    ]).notNull(),
    title: varchar("title", { length: 255 }),
    subtitle: text("subtitle"),
    body: text("body"),
    imageUrl: text("image_url"),
    linkLabel: varchar("link_label", { length: 255 }),
    linkUrl: varchar("link_url", { length: 500 }),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("public_content_page_key_idx").on(table.pageKey),
    index("public_content_section_key_idx").on(table.sectionKey),
  ],
);

export const publicContentItems = mysqlTable(
  "public_content_items",
  {
    id: int("id").autoincrement().primaryKey(),
    contentId: int("content_id").notNull(),
    label: varchar("label", { length: 255 }),
    title: varchar("title", { length: 255 }),
    value: varchar("value", { length: 255 }),
    body: text("body"),
    url: varchar("url", { length: 500 }),
    fileUrl: text("file_url"),
    imageUrl: text("image_url"),
    metaJson: text("meta_json"),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("public_content_items_content_id_idx").on(table.contentId),
  ],
);
