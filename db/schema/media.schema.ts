import { index, int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { user } from "./auth.schema";

export const media = mysqlTable(
  "media",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    filePath: varchar("file_path", { length: 2048 }).notNull(),
    fileKey: varchar("file_key", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 50 }),
    fileSize: int("file_size"),
    folder: varchar("folder", { length: 255 }).notNull().default("general"),
    uploadedBy: varchar("uploaded_by", { length: 36 }).references(() => user.id, { onDelete: "set null" }),
    uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  },
  (table) => [index("media_folder_idx").on(table.folder)],
);
