export const dynamic = "force-dynamic";

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { teachers } from "@/db/schema";
import { TeacherForm } from "../../_components/teacher-form";

export default async function EditTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);

  if (!row) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Edit Guru</h1>
      <TeacherForm
        teacherId={row.id}
        initialData={{
          name: row.name,
          position: row.position ?? undefined,
          photo: row.photo ?? undefined,
          biography: row.biography ?? undefined,
          sortOrder: row.sortOrder,
          status: row.status,
        }}
      />
    </div>
  );
}
