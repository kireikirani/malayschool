export const dynamic = "force-dynamic";

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { teachers } from "@/db/schema";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const [row] = await db.select({ name: teachers.name, position: teachers.position }).from(teachers).where(eq(teachers.id, id)).limit(1);
  if (!row) return {};
  return {
    title: row.name,
    description: row.position ?? undefined,
    openGraph: { title: row.name },
  };
}

export default async function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);

  if (!row || row.status !== "active") notFound();

  return (
    <article className="mx-auto max-w-2xl space-y-4 px-4 py-10 md:py-14">
      <div className="flex items-center gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden border border-border/70 bg-muted">
          {row.photo && <Image src={row.photo} alt={row.name} fill className="object-cover" />}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{row.name}</h1>
          {row.position && <p className="text-muted-foreground">{row.position}</p>}
        </div>
      </div>
      {row.biography && <p className="whitespace-pre-line text-sm leading-relaxed">{row.biography}</p>}
    </article>
  );
}
