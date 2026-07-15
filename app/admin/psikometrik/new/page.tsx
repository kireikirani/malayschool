import { PsikometrikForm } from "@/app/admin/psikometrik/_components/psikometrik-form";

export default function NewPsikometrikPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Tambah Rekod Psikometrik</h1>
        <p className="text-sm text-muted-foreground">Daftarkan keputusan ITP pelajar secara manual</p>
      </div>
      <PsikometrikForm />
    </div>
  );
}
