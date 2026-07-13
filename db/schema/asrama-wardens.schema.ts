import { index, int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { teachers } from "./teacher.schema";

export const asramaWardens = mysqlTable(
  "asrama_wardens",
  {
    id: int("id").autoincrement().primaryKey(),
    teacherId: varchar("teacher_id", { length: 36 })
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    jawatan: varchar("jawatan", { length: 200 }).notNull(),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("asrama_wardens_teacher_id_idx").on(table.teacherId),
    index("asrama_wardens_sort_order_idx").on(table.sortOrder),
  ],
);
