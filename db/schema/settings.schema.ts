import { mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const siteSettings = mysqlTable("site_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});
