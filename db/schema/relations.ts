import { relations } from "drizzle-orm";
import { galleryAlbums, galleryItems } from "./gallery.schema";
import { user } from "./auth.schema";
import { teachers } from "./teacher.schema";
import { asramaPelajar } from "./asrama-pelajar.schema";
import { asramaPermohonan } from "./asrama-permohonan.schema";
import { asramaGuards } from "./asrama-guards.schema";

export const galleryAlbumsRelations = relations(galleryAlbums, ({ many }) => ({
  items: many(galleryItems),
}));

export const galleryItemsRelations = relations(galleryItems, ({ one }) => ({
  album: one(galleryAlbums, { fields: [galleryItems.albumId], references: [galleryAlbums.id] }),
}));

export const userRelations = relations(user, ({ one }) => ({
  teacher: one(teachers, { fields: [user.id], references: [teachers.userId] }),
  guard: one(asramaGuards, { fields: [user.id], references: [asramaGuards.userId] }),
}));

export const teachersRelations = relations(teachers, ({ one }) => ({
  user: one(user, { fields: [teachers.userId], references: [user.id] }),
}));

export const asramaGuardsRelations = relations(asramaGuards, ({ one }) => ({
  user: one(user, { fields: [asramaGuards.userId], references: [user.id] }),
}));

export const asramaPermohonanRelations = relations(asramaPermohonan, ({ one }) => ({
  pelajar: one(asramaPelajar, { fields: [asramaPermohonan.pelajarId], references: [asramaPelajar.id] }),
  approver: one(user, { fields: [asramaPermohonan.approverUserId], references: [user.id], relationName: "permohonan_approver" }),
  guard: one(user, { fields: [asramaPermohonan.guardUserId], references: [user.id], relationName: "permohonan_guard" }),
}));

