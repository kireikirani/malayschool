import { relations } from "drizzle-orm";
import { galleryAlbums, galleryItems } from "./gallery.schema";
import { user } from "./auth.schema";
import { teachers } from "./teacher.schema";

export const galleryAlbumsRelations = relations(galleryAlbums, ({ many }) => ({
  items: many(galleryItems),
}));

export const galleryItemsRelations = relations(galleryItems, ({ one }) => ({
  album: one(galleryAlbums, { fields: [galleryItems.albumId], references: [galleryAlbums.id] }),
}));

export const userRelations = relations(user, ({ one }) => ({
  teacher: one(teachers, { fields: [user.id], references: [teachers.userId] }),
}));

export const teachersRelations = relations(teachers, ({ one }) => ({
  user: one(user, { fields: [teachers.userId], references: [user.id] }),
}));
