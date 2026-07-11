"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTour } from "@/components/admin/tour/page-tour";
import { settingsSteps } from "@/components/admin/tour/tour-steps";
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
        <div className="flex items-center gap-2">
          <PageTour tourKey="settings" steps={settingsSteps} />
          <Button onClick={handleSave} disabled={isSaving} data-tour="settings-save">
            <Save />
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sekolah">
        <TabsList data-tour="settings-tabs">
          <TabsTrigger value="sekolah" data-tour="settings-sekolah">Sekolah</TabsTrigger>
          <TabsTrigger value="hubungi">Hubungi</TabsTrigger>
          <TabsTrigger value="halaman-utama">Halaman Utama</TabsTrigger>
          <TabsTrigger value="statistik" data-tour="settings-statistik">Statistik</TabsTrigger>
          <TabsTrigger value="pibg">PIBG</TabsTrigger>
          <TabsTrigger value="akses">Akses Terhad</TabsTrigger>
          <TabsTrigger value="gdrive">Google Drive</TabsTrigger>
          <TabsTrigger value="tema" data-tour="settings-tema">Tema</TabsTrigger>
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

        <TabsContent value="halaman-utama" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Teks Info & Pengumuman</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Eyebrow</Label>
                  <Input value={val("homeAnnouncementsEyebrow", "Terkini")} onChange={(e) => set("homeAnnouncementsEyebrow", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Label Pautan</Label>
                  <Input value={val("homeAnnouncementsLinkLabel", "Lihat semua berita")} onChange={(e) => set("homeAnnouncementsLinkLabel", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Tajuk Seksyen</Label>
                <Input value={val("homeAnnouncementsTitle", "Info & Pengumuman")} onChange={(e) => set("homeAnnouncementsTitle", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Tajuk Keadaan Kosong</Label>
                <Input value={val("homeAnnouncementsEmptyTitle", "Belum ada poster info terkini")} onChange={(e) => set("homeAnnouncementsEmptyTitle", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Huraian Keadaan Kosong</Label>
                <Textarea rows={2} value={val("homeAnnouncementsEmptyBody", "Admin boleh menambah poster melalui menu Pengumuman.")} onChange={(e) => set("homeAnnouncementsEmptyBody", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Teks Berita Terkini</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Eyebrow</Label>
                  <Input value={val("homeNewsEyebrow", "Berita & Pengumuman")} onChange={(e) => set("homeNewsEyebrow", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Label Pautan</Label>
                  <Input value={val("homeNewsLinkLabel", "Lihat semua berita")} onChange={(e) => set("homeNewsLinkLabel", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Tajuk Seksyen</Label>
                <Input value={val("homeNewsTitle", "Perkembangan Terkini Sekolah")} onChange={(e) => set("homeNewsTitle", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Pesan Bila Tiada Berita</Label>
                <Input value={val("homeNewsEmptyMessage", "Belum ada berita.")} onChange={(e) => set("homeNewsEmptyMessage", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Teks Countdown SPM</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Eyebrow</Label>
                  <Input value={val("homeCountdownEyebrow", "Kiraan Masa")} onChange={(e) => set("homeCountdownEyebrow", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Tajuk Bila Sudah Bermula</Label>
                  <Input value={val("homeCountdownPastTitle", "SPM Telah Bermula")} onChange={(e) => set("homeCountdownPastTitle", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Tajuk Countdown</Label>
                <Input value={val("homeCountdownTitle", "Menghitung Hari ke SPM")} onChange={(e) => set("homeCountdownTitle", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Petikan / Quote</Label>
                <Textarea rows={2} value={val("homeCountdownQuote", "Belajar bersungguh-sungguh. Kejayaan anda adalah kebanggaan kami.")} onChange={(e) => set("homeCountdownQuote", e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <Label>Label Hari</Label>
                  <Input value={val("homeCountdownDaysLabel", "Hari")} onChange={(e) => set("homeCountdownDaysLabel", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Label Jam</Label>
                  <Input value={val("homeCountdownHoursLabel", "Jam")} onChange={(e) => set("homeCountdownHoursLabel", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Label Minit</Label>
                  <Input value={val("homeCountdownMinutesLabel", "Minit")} onChange={(e) => set("homeCountdownMinutesLabel", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Label Saat</Label>
                  <Input value={val("homeCountdownSecondsLabel", "Saat")} onChange={(e) => set("homeCountdownSecondsLabel", e.target.value)} />
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
                  <Input type="number" value={val("statsStudents")} onChange={(e) => set("statsStudents", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Staf Sokongan</Label>
                  <Input type="number" value={val("statsSupportStaff")} onChange={(e) => set("statsSupportStaff", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Bilangan Kelas</Label>
                  <Input type="number" value={val("statsClasses")} onChange={(e) => set("statsClasses", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Bilangan Calon SPM</Label>
                  <Input type="number" value={val("statsSpmCandidates")} onChange={(e) => set("statsSpmCandidates", e.target.value)} />
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
                <Input type="date" value={val("spmDate")} onChange={(e) => set("spmDate", e.target.value)} />
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

        <TabsContent value="akses" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Keselamatan & Akses Halaman</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1.5">
                <Label>Kata Laluan Halaman Pentadbiran</Label>
                <Input type="text" placeholder="Masukkan kata laluan untuk halaman pentadbiran" value={val("pentadbiranPassword")} onChange={(e) => set("pentadbiranPassword", e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  Kata laluan ini diperlukan untuk mengakses halaman Pentadbiran dari bahagian awam.
                </p>
              </div>

              <div className="space-y-1.5 border-t border-border/60 pt-4">
                <Label>Kata Laluan Senarai Pelajar Asrama</Label>
                <Input type="text" placeholder="Masukkan kata laluan untuk senarai pelajar asrama" value={val("asramaPassword")} onChange={(e) => set("asramaPassword", e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  Kata laluan ini diperlukan untuk mengakses halaman Senarai Pelajar Asrama.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gdrive" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Integrasi Google Drive & Apps Script</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sambungkan laman web sekolah terus ke folder Google Drive anda untuk memaparkan fail rasmi secara dinamik seperti peneroka fail di halaman awam.
              </p>

              <div className="space-y-1.5">
                <Label>Google Apps Script Web App URL</Label>
                <Input placeholder="https://script.google.com/macros/s/.../exec" value={val("googleAppsScriptUrl")} onChange={(e) => set("googleAppsScriptUrl", e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  URL Web App yang diperoleh selepas memasang dan melancarkan Apps Script (klik Deploy as Web App di Google Sheets/Docs/Apps Script).
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>Google Drive Folder ID (Pilihan)</Label>
                <Input placeholder="Contoh: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ" value={val("googleDriveFolderId")} onChange={(e) => set("googleDriveFolderId", e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  ID Folder utama Google Drive yang mahu dipaparkan di portal. Jika tidak diisi, folder lalai dari script akan digunakan.
                </p>
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
                      <span className="size-7 shrink-0 rounded-full" style={{ background: preset.primary }} />
                      <span className="text-sm font-medium">{preset.label}</span>
                      {isActive && <span className="ml-auto text-xs text-primary font-medium">Aktif</span>}
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
