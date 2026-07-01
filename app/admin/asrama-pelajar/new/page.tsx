import { AsramaPelajarForm } from "@/app/admin/asrama-pelajar/_components/asrama-pelajar-form";

export default function NewAsramaPelajarPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Tambah Pelajar Asrama</h1>
        <p className="text-sm text-muted-foreground">Daftarkan aspura atau aspuri baru</p>
      </div>
      <AsramaPelajarForm />
    </div>
  );
}
