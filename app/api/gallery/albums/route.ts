import { count, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { galleryAlbums, galleryItems } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { created, fail, paginated } from "@/lib/api/response";
import { parseBody, parseQuery } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { albumQuerySchema, createAlbumSchema } from "@/lib/validations/gallery.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const { page, limit, q } = parseQuery(new URL(req.url).searchParams, albumQuerySchema);
    const where = q ? sql`LOWER(${galleryAlbums.name}) LIKE ${`%${q.toLowerCase()}%`}` : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: galleryAlbums.id,
          name: galleryAlbums.name,
          description: galleryAlbums.description,
          coverImage: sql<string | null>`COALESCE(${galleryAlbums.coverImage}, (SELECT image FROM gallery_items WHERE album_id = ${galleryAlbums.id} ORDER BY \`order\` ASC LIMIT 1))`,
          createdAt: galleryAlbums.createdAt,
          updatedAt: galleryAlbums.updatedAt,
          itemCount: count(galleryItems.id),
        })
        .from(galleryAlbums)
        .leftJoin(galleryItems, eq(galleryItems.albumId, galleryAlbums.id))
        .where(where)
        .groupBy(galleryAlbums.id)
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(galleryAlbums).where(where),
    ]);

    return paginated(rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:gallery:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const body = await parseBody(req, createAlbumSchema);
    const id = crypto.randomUUID();
    await db.insert(galleryAlbums).values({ id, ...body });

    const [row] = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, id)).limit(1);
    return created(row);
  } catch (err) {
    return handleApiError(err);
  }
}
