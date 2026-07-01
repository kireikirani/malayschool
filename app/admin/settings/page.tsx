"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { THEME_PRESETS, type ThemeColor } from "@/lib/theme";

type Settings = Record<string, string>;

const THEME_COLORS = Object.entries(THEME_PRESETS) as [ThemeColor, (typeof THEME_PRESETS)[ThemeColor]][];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((body) => setSettings(body.data ?? {}))
      .catch(() => toast.error("Gagal memuat tetapan"))
      .finally(() => setIsLoading(false));
  }, []);

  function set(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function val(key: string, fallback = "") {
    return settings[key] ?? fallback;
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message ?? "Gagal menyimpan");
      toast.success("Tetapan berjaya disimpan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold">Tetapan Laman</h1>
        <p className="text-sm text-muted-foreground">Memuatkan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tetapan Laman</h1>
          <p className="text-sm text-muted-foreground">Maklumat sekolah, statistik, dan tema warna</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save />
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>

      <Tabs defaultValue="sekolah">
        <TabsList>
          <TabsTrigger value="sekolah">Sekolah</TabsTrigger>
          <TabsTrigger value="hubungi">Hubungi</TabsTrigger>
          <TabsTrigger value="statistik">Statistik</TabsTrigger>
          <TabsTrigger value="pibg">PIBG</TabsTrigger>
          <TabsTrigger value="tema">Tema</TabsTrigger>
        </TabsList>

        <TabsContent value="sekolah" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Maklumat Utama</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nama Sekolah</Label>
                <Input value={val("schoolName")} onChange={(e) => set("schoolName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Tagline</Label>
                <Input value={val("schoolTagline")} onChange={(e) => set("schoolTagline", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Visi</Label>
                <Textarea rows={2} value={val("schoolVision")} onChange={(e) => set("schoolVision", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Misi</Label>
                <Textarea rows={3} value={val("schoolMission")} onChange={(e) => set("schoolMission", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hubungi" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Maklumat Hubungi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Alamat</Label>
                <Textarea rows={3} value={val("schoolAddress")} onChange={(e) => set("schoolAddress", e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Telefon</Label>
                  <Input value={val("schoolPhone")} onChange={(e) => set("schoolPhone", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Faks</Label>
                  <Input value={val("schoolFax")} onChange={(e) => set("schoolFax", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>E-mel</Label>
                  <Input type="email" value={val("schoolEmail")} onChange={(e) => set("schoolEmail", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>URL WhatsApp</Label>
                  <Input value={val("schoolWhatsapp")} onChange={(e) => set("schoolWhatsapp", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistik" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Angka Statistik Sekolah</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Jumlah Pelajar</Label>
                  <Input
                    type="number"
                    value={val("statsStudents")}
                    onChange={(e) => set("statsStudents", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Staf Sokongan</Label>
                  <Input
                    type="number"
                    value={val("statsSupportStaff")}
                    onChange={(e) => set("statsSupportStaff", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Bilangan Kelas</Label>
                  <Input
                    type="number"
                    value={val("statsClasses")}
                    onChange={(e) => set("statsClasses", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Bilangan Calon SPM</Label>
                  <Input
                    type="number"
                    value={val("statsSpmCandidates")}
                    onChange={(e) => set("statsSpmCandidates", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Peperiksaan SPM</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Tarikh Mula SPM</Label>
                <Input
                  type="date"
                  value={val("spmDate")}
                  onChange={(e) => set("spmDate", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Digunakan untuk widget kiraan masa undur di laman utama.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pibg" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Maklumat Akaun PIBG</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nama Akaun</Label>
                <Input value={val("pibgAccountName")} onChange={(e) => set("pibgAccountName", e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Nama Bank</Label>
                  <Input value={val("pibgBankName")} onChange={(e) => set("pibgBankName", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Nombor Akaun</Label>
                  <Input value={val("pibgAccountNumber")} onChange={(e) => set("pibgAccountNumber", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tema" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Warna Tema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Pilih warna utama laman web. Perubahan akan dikemas kini selepas halaman dimuat semula.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {THEME_COLORS.map(([key, preset]) => {
                  const isActive = val("themeColor", "navy") === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set("themeColor", key)}
                      className={`flex items-center gap-3 rounded-md border p-3 text-left transition-colors hover:bg-muted/50 ${isActive ? "border-primary ring-1 ring-primary" : "border-border"}`}
                    >
                      <span
                        className="size-7 shrink-0 rounded-full"
                        style={{ background: preset.primary }}
                      />
                      <span className="text-sm font-medium">{preset.label}</span>
                      {isActive && (
                        <span className="ml-auto text-xs text-primary font-medium">Aktif</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

