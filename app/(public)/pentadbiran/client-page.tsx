"use client";

import { useEffect, useState } from "react";
import { Lock, Unlock, LogOut, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fetchPentadbiranDataAction } from "./actions";
import { toast } from "sonner";
import { PageHeader } from "@/components/public/page-header";
import { ContentSectionRenderer } from "@/components/public/content-section-renderer";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { UNIT_OPERATING_HOURS } from "@/lib/units";
import { SCHOOL_NAME } from "@/lib/brand";

type UnitData = {
  title: string;
  headName: string;
  headPosition: string;
  pencapaian: Array<{ title: string; desc: string }>;
};

type ContentSection = any; // Will match dynamic ContentSection type

export function PentadbiranClientPage() {
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [data, setData] = useState<{ unit: UnitData; sections: ContentSection[] } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if session has stored password
  useEffect(() => {
    const savedPassword = sessionStorage.getItem("pentadbiran_page_password");
    if (savedPassword) {
      setIsVerifying(true);
      fetchPentadbiranDataAction(savedPassword)
        .then((res) => {
          if (res.success && res.data) {
            setData(res.data);
            setIsAuthenticated(true);
          } else {
            sessionStorage.removeItem("pentadbiran_page_password");
          }
        })
        .catch(() => {})
        .finally(() => setIsVerifying(false));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Sila masukkan kata laluan");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetchPentadbiranDataAction(password);
      if (res.success && res.data) {
        setData(res.data);
        setIsAuthenticated(true);
        sessionStorage.setItem("pentadbiran_page_password", password);
        toast.success("Halaman Pentadbiran berjaya dinyahkunci");
      } else {
        toast.error(res.error || "Kata laluan salah!");
      }
    } catch {
      toast.error("Ralat rangkaian semasa pengesahan");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    setData(null);
    setPassword("");
    sessionStorage.removeItem("pentadbiran_page_password");
    toast.info("Halaman Pentadbiran dikunci semula");
  };

  if (isVerifying && !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <Lock className="size-8 animate-pulse text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Mengesahkan kata laluan...
        </p>
      </div>
    );
  }

  // PASSWORD PROMPT VIEW
  if (!isAuthenticated || !data) {
    return (
      <div>
        <PageHeader
          eyebrow={SCHOOL_NAME}
          title="Pentadbiran"
          description="Akses terhad untuk maklumat pengurusan dan pentadbiran sekolah"
        />
        <div className="mx-auto max-w-md px-4 py-20">
          <Card className="border-border/70 shadow-lg">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/5 text-primary border border-primary/10">
                <Lock className="size-6" />
              </div>
              <CardTitle className="font-heading text-xl">Akses Halaman Sulit</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Sila masukkan kata laluan sulit untuk melihat maklumat pentadbiran sekolah.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Input
                    type="password"
                    placeholder="Kata laluan pentadbiran"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-center h-10 tracking-widest font-sans"
                  />
                </div>
                <Button type="submit" className="w-full h-10 gap-2" disabled={isVerifying}>
                  <Unlock className="size-4" />
                  Nyahkunci Halaman
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // AUTHENTICATED PENTADBIRAN VIEW
  const { unit, sections } = data;

  return (
    <div>
      <PageHeader
        eyebrow={SCHOOL_NAME}
        title={unit.title}
        description={`${unit.headName} - ${unit.headPosition}`}
      />

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 md:py-16">
        {/* Access Bar */}
        <div className="flex items-center justify-between border border-border/70 bg-muted/20 px-6 py-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Lock className="size-3.5" />
            Akses Dibenarkan
          </span>
          <Button variant="outline" size="sm" onClick={handleLock} className="gap-2 h-8">
            <LogOut className="size-3.5" />
            Kunci Halaman
          </Button>
        </div>

        {/* CMS-managed content sections */}
        {sections.map((section) => (
          <ContentSectionRenderer key={`${section.sectionKey}-${section.sortOrder}`} section={section} />
        ))}

        {/* Pencapaian / Achievements */}
        {unit.pencapaian && unit.pencapaian.length > 0 && (
          <section>
            <ScrollAnimation direction="up">
              <span className="text-sm font-semibold tracking-wide text-primary uppercase">Pencapaian</span>
              <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight md:text-3xl">Pencapaian & Program</h2>
            </ScrollAnimation>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {unit.pencapaian.map((item, i) => (
                <ScrollAnimation key={item.title} direction="up" delay={i * 0.06}>
                  <div className="border border-border/70 bg-card p-5">
                    <h3 className="font-heading text-base font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </section>
        )}

        {/* Operating Hours */}
        <section className="grid gap-6 border border-border/70 bg-card px-6 py-8 sm:grid-cols-[1fr_1fr] md:px-10">
          <div>
            <h3 className="font-heading text-lg font-semibold">Maklumat Umum</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Semua pelajar tertakluk kepada Buku Peraturan Sekolah. Kehadiran adalah wajib dan pemakaian seragam sekolah hendaklah sentiasa kemas mengikut ketetapan Kementerian Pendidikan Malaysia.
            </p>
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-heading text-lg font-semibold">
              <Clock className="size-4 text-primary" />
              Waktu Operasi {unit.title}
            </h3>
            <dl className="mt-2 space-y-1 text-sm">
              {UNIT_OPERATING_HOURS.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 text-muted-foreground">
                  <dt>{row.label}</dt>
                  <dd className="text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}
