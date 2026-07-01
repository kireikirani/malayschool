import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const asramaPelajar = mysqlTable(
  "asrama_pelajar",
  {
    id: int("id").autoincrement().primaryKey(),
    jantina: mysqlEnum("jantina", ["lelaki", "perempuan"]).notNull(),
    nama: varchar("nama", { length: 200 }).notNull(),
    tingkatan: varchar("tingkatan", { length: 10 }).notNull(),
    dorm: varchar("dorm", { length: 100 }).notNull(),
    namaWaris: varchar("nama_waris", { length: 200 }),
    noWaris: varchar("no_waris", { length: 20 }),
    foto: text("foto"),
    status: mysqlEnum("status", ["active", "inactive"]).notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("asrama_pelajar_jantina_idx").on(table.jantina),
    index("asrama_pelajar_status_idx").on(table.status),
    index("asrama_pelajar_tingkatan_idx").on(table.tingkatan),
  ],
);
