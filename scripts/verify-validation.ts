import { createAdvertisementSchema } from "@/lib/validations/advertisement.schema";
import {
  createAlbumSchema,
  createGalleryItemsSchema,
  strictReorderItemsSchema,
} from "@/lib/validations/gallery.schema";
import { mediaQuerySchema } from "@/lib/validations/media.schema";
import { createNewsSchema, newsQuerySchema } from "@/lib/validations/news.schema";
import { createTeacherSchema } from "@/lib/validations/teacher.schema";

function expectPass(label: string, fn: () => void) {
  fn();
  console.log(`PASS ${label}`);
}

function expectFail(label: string, fn: () => void) {
  try {
    fn();
    throw new Error(`Expected failure for ${label}`);
  } catch {
    console.log(`PASS ${label}`);
  }
}

function main() {
  expectPass("album trims optional description", () => {
    createAlbumSchema.parse({ name: "Album", description: "   " });
  });

  expectFail("gallery rejects duplicate images", () => {
    createGalleryItemsSchema.parse([
      { image: "/a.jpg" },
      { image: "/a.jpg" },
    ]);
  });

  expectFail("gallery reorder rejects duplicate order", () => {
    strictReorderItemsSchema.parse([
      { itemId: "1", order: 0 },
      { itemId: "2", order: 0 },
    ]);
  });

  expectFail("news requires publish date when published", () => {
    createNewsSchema.parse({
      title: "News",
      content: "<p>Isi</p>",
      status: "published",
    });
  });

  expectFail("news rejects empty rich text shell", () => {
    createNewsSchema.parse({
      title: "News",
      content: "<p><br></p>",
      status: "draft",
    });
  });

  expectFail("news query rejects inverted date range", () => {
    newsQuerySchema.parse({ from: "2026-07-01", to: "2026-06-01" });
  });

  expectPass("teacher trims empty optional fields", () => {
    createTeacherSchema.parse({ name: "Teacher", position: "   ", biography: "   " });
  });

  expectFail("advertisement external link requires valid URL", () => {
    createAdvertisementSchema.parse({
      name: "Ad",
      type: "external_link",
      placement: "footer",
      content: "notaurl",
      status: "active",
    });
  });

  expectFail("advertisement banner requires valid path", () => {
    createAdvertisementSchema.parse({
      name: "Ad",
      type: "banner_image",
      placement: "footer",
      content: "invalid-banner",
      status: "inactive",
    });
  });

  expectFail("media query folder is restricted", () => {
    mediaQuerySchema.parse({ folder: "secret" });
  });
}

main();
