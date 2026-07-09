"use client";

import { useState } from "react";
import Link from "next/link";
import { SchoolLogo } from "@/components/public/school-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { signUp } from "@/lib/auth-client";
import { SCHOOL_NAME, SCHOOL_SHORT_NAME } from "@/lib/brand";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    subject: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Kata laluan tidak sepadan.");
      return;
    }
    if (form.password.length < 8) {
      setError("Kata laluan mestilah sekurang-kurangnya 8 aksara.");
      return;
    }

    setLoading(true);

    try {
      // Better-auth accepts custom additionalFields server-side (configured in lib/auth.ts),
      // but the generated client type doesn't include them — cast the payload to include them.
      const res = await signUp.email({
        name: form.name,
        email: form.email,
        password: form.password,
        teacherPhone: form.phone,
        teacherSubject: form.subject,
        teacherNotes: form.notes,
      } as Parameters<typeof signUp.email>[0] & Record<string, unknown>);

      if (res.error) {
        setError(res.error.message ?? "Pendaftaran gagal. Email mungkin sudah digunakan.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch {
      setError("Pendaftaran gagal. Sila cuba lagi.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6 md:p-10">
        <SchoolLogo className="size-16" />
        <div className="w-full max-w-sm text-center">
          <h1 className="text-xl font-bold">Pendaftaran Berjaya</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Terima kasih! Akaun guru anda telah didaftarkan. Admin sekolah akan menyemak dan
            meluluskan pendaftaran anda sebelum anda boleh log masuk.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link href="/login">Kembali ke Log Masuk</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6 md:p-10">
      <div className="flex flex-col items-center gap-3">
        <SchoolLogo className="size-16" />
        <div className="text-center">
          <p className="font-heading text-lg font-semibold">{SCHOOL_SHORT_NAME}</p>
          <p className="text-xs text-muted-foreground">{SCHOOL_NAME}</p>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-xl font-bold">Daftar Akaun Guru</h1>
              <p className="text-sm text-balance text-muted-foreground">
                Isi maklumat anda. Pendaftaran perlu diluluskan admin sebelum boleh log masuk.
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="name">Nama Penuh</FieldLabel>
              <Input
                id="name"
                placeholder="Nama seperti dalam dokumen rasmi"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="bg-background"
                disabled={loading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="nama@moe.edu.my"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="bg-background"
                disabled={loading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="phone">No. Telefon</FieldLabel>
              <Input
                id="phone"
                placeholder="01x-xxxxxxx"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="bg-background"
                disabled={loading}
              />
              <FieldDescription>Untuk dihubungi oleh admin sekolah.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="subject">Subjek Diajar</FieldLabel>
              <Input
                id="subject"
                placeholder="Contoh: Matematik, Sains, Bahasa Melayu"
                value={form.subject}
                onChange={(e) => update("subject", e.target.value)}
                className="bg-background"
                disabled={loading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="notes">Nota (pilihan)</FieldLabel>
              <Textarea
                id="notes"
                placeholder="Maklumat tambahan untuk admin, contoh: Guru Kanan Matematik"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                className="bg-background"
                rows={3}
                disabled={loading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Kata Laluan</FieldLabel>
              <Input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="bg-background"
                disabled={loading}
              />
              <FieldDescription>Minimum 8 aksara.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">Sahkan Kata Laluan</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                className="bg-background"
                disabled={loading}
              />
            </Field>

            <Field>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Mendaftar..." : "Daftar"}
              </Button>
            </Field>

            <p className="text-center text-sm text-muted-foreground">
              Sudah ada akaun?{" "}
              <Link href="/login" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
                Log masuk
              </Link>
            </p>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}