import { index, int, mysqlTable, timestamp, varchar, mysqlEnum } from "drizzle-orm/mysql-core";
import { user } from "./auth.schema";

export const asramaGuards = mysqlTable(
  "asrama_guards",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .references(() => user.id, { onDelete: "cascade" }),
    nama: varchar("nama", { length: 200 }).notNull(),
    noTelefon: varchar("no_telefon", { length: 50 }),
    status: mysqlEnum("status", ["active", "inactive"]).notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("asrama_guards_user_id_idx").on(table.userId),
  ],
);
