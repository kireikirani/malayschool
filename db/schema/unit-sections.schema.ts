import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const unitSections = mysqlTable(
  "unit_sections",
  {
    id: int("id").autoincrement().primaryKey(),
    unitSlug: varchar("unit_slug", { length: 50 }).notNull(),
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
    index("unit_sections_unit_slug_idx").on(table.unitSlug),
    index("unit_sections_section_key_idx").on(table.sectionKey),
  ],
);

export const unitSectionItems = mysqlTable(
  "unit_section_items",
  {
    id: int("id").autoincrement().primaryKey(),
    sectionId: int("section_id").notNull(),
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
    index("unit_section_items_section_id_idx").on(table.sectionId),
  ],
);
