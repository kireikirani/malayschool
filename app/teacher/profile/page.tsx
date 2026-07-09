import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { teachers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ProfileForm } from "./profile-form";

export default async function TeacherProfileEditPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "teacher") {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch or initialize teacher record
  let [teacher] = await db
    .select()
    .from(teachers)
    .where(eq(teachers.userId, userId))
    .limit(1);

  if (!teacher) {
    const id = crypto.randomUUID();
    const userObj = session.user as any;
    await db.insert(teachers).values({
      id,
      userId,
      name: userObj.name,
      phone: userObj.teacherPhone ?? null,
      subject: userObj.teacherSubject ?? null,
      notes: userObj.teacherNotes ?? null,
      status: "active",
      sortOrder: 0,
    });

    [teacher] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.userId, userId))
      .limit(1);
  }

  return (
    <ProfileForm
      initialData={{
        name: teacher.name,
        position: teacher.position,
        photo: teacher.photo,
        biography: teacher.biography,
        phone: teacher.phone,
        subject: teacher.subject,
        notes: teacher.notes,
      }}
    />
  );
}
