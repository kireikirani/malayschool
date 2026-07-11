"use client";

import { useEffect, useState } from "react";
import { Clock, Lock, LogOut, Unlock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ContentSectionRenderer } from "@/components/public/content-section-renderer";
import { PageHeader } from "@/components/public/page-header";
import { SCHOOL_NAME } from "@/lib/brand";
import type { ContentSection } from "@/lib/content";
import { UNIT_OPERATING_HOURS, UNITS } from "@/lib/units";
import { fetchManagementDataAction } from "@/app/(public)/pentadbiran/actions";

const MANAGEMENT_ACCESS_KEY = "management_pages_password";

type ManagementProtectedPageProps = {
  unitSlug: "pentadbiran" | "kurikulum" | "hem" | "kokurikulum" | "tingkatan-6";
};

type ManagementPageData = {
  unit: {
    slug: string;
    navLabel: string;
    title: string;
    headName: string;
    headPosition: string;
    pencapaian: Array<{ title: string; desc: string }>;
  };
  sections: ContentSection[];
};

export function ManagementProtectedPage({ unitSlug }: ManagementProtectedPageProps) {
  const unitMeta = UNITS.find((unit) => unit.slug === unitSlug)!;
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(() => typeof window !== "undefined" && Boolean(window.sessionStorage.getItem(MANAGEMENT_ACCESS_KEY)));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<ManagementPageData | null>(null);

  useEffect(() => {
    const savedPassword = sessionStorage.getItem(MANAGEMENT_ACCESS_KEY);
    if (!savedPassword) {
      return;
    }
    fetchManagementDataAction(unitSlug, savedPassword)
      .then((result) => {
        if (result.success && result.data) {
          setData(result.data as ManagementPageData);
          setIsAuthenticated(true);
          return;
        }

        sessionStorage.removeItem(MANAGEMENT_ACCESS_KEY);
      })
      .catch(() => {})
      .finally(() => setIsVerifying(false));
  }, [unitSlug]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.trim()) {
      toast.error("Sila masukkan kata laluan");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await fetchManagementDataAction(unitSlug, password);
      if (result.success && result.data) {
        setData(result.data as ManagementPageData);
        setIsAuthenticated(true);
        sessionStorage.setItem(MANAGEMENT_ACCESS_KEY, password);
        toast.success("Akses Pengurusan & Pentadbiran berjaya dinyahkunci");
      } else {
        toast.error(result.error || "Kata laluan salah!");
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
    sessionStorage.removeItem(MANAGEMENT_ACCESS_KEY);
    toast.info("Akses Pengurusan & Pentadbiran dikunci semula");
  };

  if (isVerifying && !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <Lock className="size-8 animate-pulse text-muted-foreground" />
        <p className="animate-pulse text-sm font-medium text-muted-foreground">
          Mengesahkan kata laluan...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !data) {
    return (
      <div>
        <PageHeader
          eyebrow={SCHOOL_NAME}
          title={unitMeta.navLabel}
          description="Akses terhad untuk maklumat pengurusan dan pentadbiran sekolah"
        />
        <div className="mx-auto max-w-md px-4 py-20">
          <Card className="border-border/70 shadow-lg">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-primary/10 bg-primary/5 text-primary">
                <Lock className="size-6" />
              </div>
              <CardTitle className="font-heading text-xl">Akses Halaman Sulit</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Sila masukkan kata laluan sulit untuk melihat maklumat pengurusan dan pentadbiran sekolah.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Kata laluan pentadbiran"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-10 text-center font-sans tracking-widest"
                />
                <Button type="submit" className="h-10 w-full gap-2" disabled={isVerifying}>
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

  const { unit, sections } = data;

  return (
    <div>
      <PageHeader
        eyebrow={SCHOOL_NAME}
        title={unit.title}
        description={`${unit.headName} - ${unit.headPosition}`}
      />

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 md:py-16">
        <div className="flex items-center justify-between border border-border/70 bg-muted/20 px-6 py-4">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Lock className="size-3.5" />
            Akses Dibenarkan
          </span>
          <Button variant="outline" size="sm" onClick={handleLock} className="h-8 gap-2">
            <LogOut className="size-3.5" />
            Kunci Halaman
          </Button>
        </div>

        {sections.map((section) => (
          <ContentSectionRenderer key={`${section.sectionKey}-${section.sortOrder}`} section={section} />
        ))}

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
