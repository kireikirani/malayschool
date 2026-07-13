import { index, int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const psikometrikResults = mysqlTable(
  "psikometrik_results",
  {
    id: int("id").autoincrement().primaryKey(),
    noPengenalan: varchar("no_pengenalan", { length: 20 }).notNull().unique(),
    namaMurid: varchar("nama_murid", { length: 200 }).notNull(),
    kodSekolah: varchar("kod_sekolah", { length: 20 }),
    namaSekolah: varchar("nama_sekolah", { length: 200 }),
    namaKelas: varchar("nama_kelas", { length: 50 }),
    tarikh: varchar("tarikh", { length: 30 }),
    scoresJson: text("scores_json").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [index("psikometrik_no_pengenalan_idx").on(table.noPengenalan)],
);
