export const dynamic = "force-dynamic";

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap, Info, Mail, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { teachers, user } from "@/db/schema";
import { PhotoLightbox } from "@/components/public/photo-lightbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 5) return "•".repeat(phone.length);
  const head = digits.slice(0, 3);
  const tail = digits.slice(-2);
  return `${head}${"•".repeat(Math.max(digits.length - 5, 3))}${tail}`;
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const shown = local.slice(0, Math.min(2, local.length));
  return `${shown}${"•".repeat(Math.max(local.length - shown.length, 3))}@${domain}`;
}

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
  const [row] = await db
    .select({
      id: teachers.id,
      name: teachers.name,
      position: teachers.position,
      photo: teachers.photo,
      biography: teachers.biography,
      phone: teachers.phone,
      subject: teachers.subject,
      status: teachers.status,
      email: user.email,
    })
    .from(teachers)
    .leftJoin(user, eq(teachers.userId, user.id))
    .where(eq(teachers.id, id))
    .limit(1);

  if (!row || row.status !== "active") notFound();

  const subjects = (row.subject ?? "")
    .split(/[,;/]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const initials = row.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article className="mx-auto max-w-4xl space-y-6 px-4 py-10 md:py-14">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1.5">
          <Link href="/teachers">
            <ArrowLeft className="size-4" />
            Kembali ke Direktori Guru
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Profil Guru</CardTitle>
            <CardDescription>Maklumat pengenalan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative mx-auto size-40 overflow-hidden rounded-full border border-border/70 bg-muted">
              {row.photo ? (
                <PhotoLightbox src={row.photo} alt={row.name} thumbClassName="relative size-40" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-muted-foreground">
                  {initials}
                </div>
              )}
            </div>
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-semibold leading-tight">{row.name}</h1>
              {row.position && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                  <GraduationCap className="size-4 text-primary" />
                  {row.position}
                </p>
              )}
            </div>
            <div className="flex justify-center pt-2">
              <Badge variant="default" className="text-xs px-3 py-1">Guru Aktif</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Maklumat Guru</CardTitle>
            <CardDescription>Subjek diajar, hubungan, dan latar belakang</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  No. Telefon
                </p>
                <p className="text-sm font-medium">
                  {row.phone ? maskPhone(row.phone) : "-"}
                </p>
                {row.phone && (
                  <p className="text-[10px] text-muted-foreground">Sebahagian nombor disembunyikan atas sebab privasi.</p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  E-mel
                </p>
                <p className="text-sm font-medium break-all">
                  {row.email ? maskEmail(row.email) : "-"}
                </p>
                {row.email && (
                  <p className="text-[10px] text-muted-foreground">Sila hubungi melalui pihak sekolah untuk urusan rasmi.</p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="size-3.5" />
                  Subjek Diajar
                </p>
                {subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {subjects.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Belum ditetapkan</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Biografi / Latar Belakang</h3>
              {row.biography ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {row.biography}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic flex items-center gap-1.5">
                  <Info className="size-4" />
                  Belum ada biografi.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </article>
  );
}
