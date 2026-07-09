import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { teachers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Edit, Phone, Mail, GraduationCap, Info, BookOpen } from "lucide-react";

export default async function TeacherDashboardPage() {
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

  const initials = teacher.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Guru</h1>
          <p className="text-muted-foreground">
            Selamat kembali, Cikgu {teacher.name}. Urus profil awam anda di sini.
          </p>
        </div>
        <Button asChild>
          <Link href="/teacher/profile" className="flex items-center gap-2">
            <Edit className="size-4" />
            Kemaskini Profil
          </Link>
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Status visibility Card */}
        <Card className="md:col-span-1 border border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Status Paparan Direktori</CardTitle>
            <CardDescription>
              Status keterlihatan profil anda di laman web sekolah.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant={teacher.status === "active" ? "default" : "secondary"} className="text-sm px-3 py-1">
                {teacher.status === "active" ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {teacher.status === "active"
                ? "Profil anda kini dipaparkan dalam direktori guru awam. Ibu bapa dan pelajar boleh melihat biografi dan maklumat subjek anda."
                : "Profil anda sedang disembunyikan daripada direktori awam. Hanya admin boleh menukar status ini."}
            </p>
          </CardContent>
        </Card>

        {/* Detailed Profile View Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Profil Awam Anda</CardTitle>
            <CardDescription>
              Maklumat terkini profil guru anda yang dipaparkan kepada umum.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upper profile info */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="size-20 border">
                <AvatarImage src={teacher.photo ?? undefined} alt={teacher.name} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{teacher.name}</h2>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap className="size-4 text-primary" />
                  {teacher.position || "Jawatan Belum Ditetapkan"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Grid of details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="size-3.5" />
                  No. Telefon
                </p>
                <p className="text-sm font-medium">{teacher.phone || "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="size-3.5" />
                  Email Akaun
                </p>
                <p className="text-sm font-medium">{session.user.email}</p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <BookOpen className="size-3.5" />
                  Subjek Diajar
                </p>
                <p className="text-sm font-medium">{teacher.subject || "-"}</p>
              </div>
            </div>

            <Separator />

            {/* Biography */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Biografi / Latar Belakang</h3>
              {teacher.biography ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {teacher.biography}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic flex items-center gap-1">
                  <Info className="size-4" />
                  Belum ada biografi ditulis. Klik 'Kemaskini Profil' untuk menulis biografi anda.
                </p>
              )}
            </div>

            {teacher.notes && (
              <>
                <Separator />
                <div className="rounded-lg bg-muted/50 p-4 space-y-1">
                  <h4 className="text-xs font-semibold text-muted-foreground">Nota Tambahan (Admin)</h4>
                  <p className="text-xs text-muted-foreground">{teacher.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
