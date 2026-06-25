import { index, longtext, mysqlEnum, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const advertisements = mysqlTable(
  "advertisements",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    type: mysqlEnum("type", ["adsense_code", "html_script", "banner_image", "external_link"]).notNull(),
    placement: mysqlEnum("placement", [
      "homepage_top",
      "homepage_sidebar",
      "news_detail",
      "footer",
    ]).notNull(),
    content: longtext("content").notNull(),
    status: mysqlEnum("status", ["active", "inactive"]).notNull().default("inactive"),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("advertisements_placement_status_idx").on(table.placement, table.status),
    index("advertisements_schedule_idx").on(table.startDate, table.endDate),
  ],
);
