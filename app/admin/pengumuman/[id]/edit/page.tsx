"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { PengumumanForm } from "@/app/admin/pengumuman/_components/pengumuman-form";

export default function EditPengumumanPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(`/api/pengumuman/${id}`)
      .then((r) => r.json())
      .then((b) => setData(b.data))
      .catch(() => toast.error("Gagal memuat data"));
  }, [id]);

  if (!data) return <p className="text-sm text-muted-foreground">Memuatkan...</p>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Edit Pengumuman</h1>
        <p className="text-sm text-muted-foreground">Kemaskini butiran pengumuman</p>
      </div>
      <PengumumanForm
        pengumumanId={Number(id)}
        initialData={{
          tajuk: data.tajuk as string,
          deskripsi: (data.deskripsi as string) ?? "",
          imageUrl: data.imageUrl as string,
          linkUrl: (data.linkUrl as string) ?? "",
          aktif: data.aktif as boolean,
          tamatPada: data.tamatPada ? new Date(data.tamatPada as string).toISOString().slice(0, 16) : "",
          sortOrder: data.sortOrder as number,
        }}
      />
    </div>
  );
}
