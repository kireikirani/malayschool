import type { advertisements, asramaPelajar, galleryAlbums, galleryItems, media, news, pengumuman, publicContent, publicContentItems, siteSettings, teachers, unitDocuments, unitSectionItems, unitSections, user } from "@/db/schema";

type InferInsert<T> = T extends { $inferInsert: infer I } ? I : never;

export type SiteSettingRow = Pick<InferInsert<typeof siteSettings>, "key" | "value">;
export type UserRow = Pick<InferInsert<typeof user>, "id" | "name" | "email" | "role" | "emailVerified" | "image">;
export type MediaRow = Pick<InferInsert<typeof media>, "id" | "fileName" | "filePath" | "fileKey" | "fileType" | "fileSize" | "folder" | "uploadedBy">;
export type TeacherRow = Pick<InferInsert<typeof teachers>, "id" | "name" | "position" | "photo" | "biography" | "status">;
export type AdvertisementRow = Pick<InferInsert<typeof advertisements>, "id" | "name" | "type" | "placement" | "content" | "status" | "startDate" | "endDate">;
export type PengumumanRow = Pick<InferInsert<typeof pengumuman>, "tajuk" | "deskripsi" | "imageUrl" | "linkUrl" | "aktif" | "tamatPada" | "sortOrder">;
export type NewsRow = Pick<InferInsert<typeof news>, "id" | "title" | "slug" | "content" | "thumbnail" | "status" | "publishDate" | "metaTitle" | "metaDescription" | "ogImage" | "authorId">;
export type GalleryAlbumRow = Pick<InferInsert<typeof galleryAlbums>, "id" | "name" | "description" | "coverImage">;
export type GalleryItemRow = Pick<InferInsert<typeof galleryItems>, "id" | "albumId" | "image" | "caption" | "order">;
export type AsramaRow = Pick<InferInsert<typeof asramaPelajar>, "jantina" | "nama" | "tingkatan" | "dorm" | "namaWaris" | "noWaris" | "foto" | "status">;
export type UnitDocumentRow = Pick<InferInsert<typeof unitDocuments>, "unitSlug" | "type" | "label" | "fileUrl" | "fileType" | "tahun" | "sortOrder">;
export type PublicContentRow = Pick<InferInsert<typeof publicContent>, "pageKey" | "sectionKey" | "type" | "title" | "subtitle" | "body" | "imageUrl" | "linkLabel" | "linkUrl" | "isActive" | "sortOrder">;
export type PublicContentItemRow = Pick<InferInsert<typeof publicContentItems>, "label" | "title" | "value" | "body" | "url" | "fileUrl" | "imageUrl" | "metaJson" | "sortOrder">;
export type UnitSectionRow = Pick<InferInsert<typeof unitSections>, "unitSlug" | "sectionKey" | "type" | "title" | "subtitle" | "body" | "imageUrl" | "linkLabel" | "linkUrl" | "isActive" | "sortOrder">;
export type UnitSectionItemRow = Pick<InferInsert<typeof unitSectionItems>, "label" | "title" | "value" | "body" | "url" | "fileUrl" | "imageUrl" | "metaJson" | "sortOrder">;

export type ContentSectionBundle<TSection, TItem> = {
  section: TSection;
  items: TItem[];
};

export type LegacyPayload = {
  exportedAt: string;
  settings: SiteSettingRow[];
  users: UserRow[];
  media: MediaRow[];
  teachers: TeacherRow[];
  advertisements: AdvertisementRow[];
  pengumuman: PengumumanRow[];
  news: NewsRow[];
  gallery: Array<{
    album: GalleryAlbumRow;
    items: GalleryItemRow[];
  }>;
  asrama: AsramaRow[];
  unitDocuments: UnitDocumentRow[];
  publicContent: Array<ContentSectionBundle<PublicContentRow, PublicContentItemRow>>;
  unitSections: Array<ContentSectionBundle<UnitSectionRow, UnitSectionItemRow>>;
};
