import { date, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { asramaPelajar } from "./asrama-pelajar.schema";
import { user } from "./auth.schema";

/**
 * Permohonan keluar asrama — replikasi 4-tab Canva prototype
 * (Borang / Semak Status / Guard / Admin).
 *
 * jenis:
 *  - pulang_bermalam: balik rumah bermalam (tarikhKeluar + tarikhPulang)
 *  - outing: keluar sebentar (tarikhKeluar = tarikhPulang hari sama)
 *  - mc_sakit: MC / sakit (hanya dicipta oleh warden/admin; tarikhPulang null)
 *
 * status (mesin keadaan):
 *  - menunggu: baru dihantar, menunggu kelulusan warden
 *  - diluluskan: warden luluskan (outing/pulang_bermalam)
 *  - ditolak: warden tolak
 *  - mc: rekod MC/Sakit (auto-masuk guard panel, langkau approval)
 */
export const asramaPermohonan = mysqlTable(
  "asrama_permohonan",
  {
    id: int("id").autoincrement().primaryKey(),
    pelajarId: int("pelajar_id")
      .notNull()
      .references(() => asramaPelajar.id, { onDelete: "cascade" }),

    // Snapshot maklumat pelajar saat permohonan dibuat (asramaPelajar boleh berubah)
    namaPelajar: varchar("nama_pelajar", { length: 200 }).notNull(),
    tingkatan: varchar("tingkatan", { length: 10 }).notNull(),
    dorm: varchar("dorm", { length: 100 }).notNull(),

    jenis: mysqlEnum("jenis", ["pulang_bermalam", "outing", "mc_sakit"]).notNull(),
    tarikhKeluar: date("tarikh_keluar").notNull(),
    tarikhPulang: date("tarikh_pulang"), // null untuk mc_sakit
    sebab: text("sebab").notNull(),

    status: mysqlEnum("status", ["menunggu", "diluluskan", "ditolak", "mc"])
      .notNull()
      .default("menunggu"),

    // Pengecam waris saat menghantar borang publik (divalidasi vs asramaPelajar)
    noWarisPengirim: varchar("no_waris_pengirim", { length: 20 }).notNull(),

    // Kelulusan (diisi warden/admin)
    diluluskanOleh: varchar("diluluskan_oleh", { length: 200 }), // snapshot nama approver
    approverUserId: varchar("approver_user_id", { length: 36 })
      .references(() => user.id, { onDelete: "set null" }),
    tarikhKelulusan: timestamp("tarikh_kelulusan"),
    catatan: text("catatan"),

    // Checkout guard (diisi warden bertugas dari panel Guard)
    pengambil: varchar("pengambil", { length: 200 }),
    noPendaftaran: varchar("no_pendaftaran", { length: 20 }), // plat kenderaan
    guardUserId: varchar("guard_user_id", { length: 36 })
      .references(() => user.id, { onDelete: "set null" }),
    guardNama: varchar("guard_nama", { length: 200 }), // snapshot nama guard
    tarikhDiambil: timestamp("tarikh_diambil"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("asrama_permohonan_status_idx").on(table.status),
    index("asrama_permohonan_jenis_idx").on(table.jenis),
    index("asrama_permohonan_pelajar_id_idx").on(table.pelajarId),
    index("asrama_permohonan_tarikh_keluar_idx").on(table.tarikhKeluar),
  ],
);
