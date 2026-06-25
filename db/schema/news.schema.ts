import { index, longtext, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { user } from "./auth.schema";

export const news = mysqlTable(
  "news",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    content: longtext("content").notNull(),
    thumbnail: varchar("thumbnail", { length: 2048 }),
    status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
    publishDate: timestamp("publish_date"),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: varchar("meta_description", { length: 500 }),
    ogImage: varchar("og_image", { length: 2048 }),
    authorId: varchar("author_id", { length: 36 }).references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("news_slug_idx").on(table.slug),
    index("news_status_idx").on(table.status),
    index("news_publish_date_idx").on(table.publishDate),
  ],
);
