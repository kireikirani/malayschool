"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AsramaPelajarForm } from "@/app/admin/asrama-pelajar/_components/asrama-pelajar-form";

export default function EditAsramaPelajarPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(`/api/asrama-pelajar/${id}`)
      .then((r) => r.json())
      .then((b) => setData(b.data))
      .catch(() => toast.error("Gagal memuat data"));
  }, [id]);

  if (!data) return <p className="text-sm text-muted-foreground">Memuatkan...</p>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Edit Pelajar Asrama</h1>
        <p className="text-sm text-muted-foreground">Kemaskini maklumat pelajar</p>
      </div>
      <AsramaPelajarForm
        pelajarId={Number(id)}
        initialData={{
          jantina: data.jantina as "lelaki" | "perempuan",
          nama: data.nama as string,
          tingkatan: data.tingkatan as string,
          dorm: data.dorm as string,
          namaWaris: (data.namaWaris as string) ?? "",
          noWaris: (data.noWaris as string) ?? "",
          namaWaris2: (data.namaWaris2 as string) ?? "",
          noWaris2: (data.noWaris2 as string) ?? "",
          namaWaris3: (data.namaWaris3 as string) ?? "",
          noWaris3: (data.noWaris3 as string) ?? "",
          foto: (data.foto as string) ?? undefined,
          gdriveFolderLink: (data.gdriveFolderLink as string) ?? "",
          status: data.status as "active" | "inactive",
        }}
      />
    </div>
  );
}
