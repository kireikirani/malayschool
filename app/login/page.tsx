"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SchoolLogo } from "@/components/public/school-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { signIn } from "@/lib/auth-client";
import { SCHOOL_NAME, SCHOOL_SHORT_NAME } from "@/lib/brand";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn.email({ email, password });
      if (res.error) {
        setError(res.error.message ?? "Log masuk gagal. Semak email dan kata laluan anda.");
        setLoading(false);
        return;
      }

      // Fetch session to determine redirect based on role
      const sessionRes = await fetch("/api/auth/get-session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      if (role === "admin") {
        router.push("/admin/dashboard");
      } else if (role === "teacher") {
        router.push("/teacher");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Log masuk gagal. Sila cuba lagi.");
      setLoading(false);
    }
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
              <h1 className="text-xl font-bold">Selamat Kembali</h1>
              <p className="text-sm text-balance text-muted-foreground">
                Log masuk ke akaun guru anda
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="nama@moe.edu.my"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
                disabled={loading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Kata Laluan</FieldLabel>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background"
                disabled={loading}
              />
            </Field>

            <Field>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sedang log masuk..." : "Log Masuk"}
              </Button>
            </Field>

            <p className="text-center text-sm text-muted-foreground">
              Belum ada akaun?{" "}
              <Link href="/register" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
                Daftar di sini
              </Link>
            </p>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}