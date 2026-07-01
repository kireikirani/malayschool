import { PengumumanForm } from "@/app/admin/pengumuman/_components/pengumuman-form";

export default function NewPengumumanPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Tambah Pengumuman</h1>
        <p className="text-sm text-muted-foreground">Poster atau info terkini untuk laman utama</p>
      </div>
      <PengumumanForm />
    </div>
  );
}
