export const dynamic = "force-dynamic";

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { advertisements } from "@/db/schema";
import { AdvertisementForm } from "../../_components/advertisement-form";

export default async function EditAdvertisementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);

  if (!row) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Edit Iklan</h1>
      <AdvertisementForm
        adId={row.id}
        initialData={{
          name: row.name,
          type: row.type,
          placement: row.placement,
          content: row.content,
          status: row.status,
          startDate: row.startDate ?? undefined,
          endDate: row.endDate ?? undefined,
        }}
      />
    </div>
  );
}
