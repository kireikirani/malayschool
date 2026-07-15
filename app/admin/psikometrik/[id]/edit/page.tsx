"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { PsikometrikForm } from "@/app/admin/psikometrik/_components/psikometrik-form";

type RecordData = {
  noPengenalan: string;
  namaMurid: string;
  kodSekolah?: string;
  namaSekolah?: string;
  namaKelas?: string;
  tarikh?: string;
  scores: Record<string, number>;
};

export default function EditPsikometrikPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RecordData | null>(null);

  useEffect(() => {
    fetch(`/api/admin/psikometrik/${id}`)
      .then((r) => r.json())
      .then((b) => setData(b.data))
      .catch(() => toast.error("Gagal memuat rekod"));
  }, [id]);

  if (!data) return <p className="text-sm text-muted-foreground">Memuatkan...</p>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Edit Rekod Psikometrik</h1>
        <p className="text-sm text-muted-foreground">Kemaskini keputusan ITP pelajar</p>
      </div>
      <PsikometrikForm recordId={Number(id)} initialData={data} />
    </div>
  );
}
