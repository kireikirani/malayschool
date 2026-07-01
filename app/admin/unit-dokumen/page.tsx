"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { FileText, ImageIcon, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { UploadButton } from "@/lib/uploadthing-client";
import { apiSend } from "@/lib/fetcher";
import { UNITS } from "@/lib/units";

type DocRow = {
  id: number;
  unitSlug: string;
  type: "carta-org" | "dokumen";
  label: string;
  fileUrl: string;
  fileType: "pdf" | "image" | "doc";
};

async function fetchDocs(unitSlug: string): Promise<DocRow[]> {
  const res = await fetch(`/api/unit-dokumen?unitSlug=${unitSlug}&limit=100`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
  return body.data;
}

function UnitDokumenTab({ unit }: { unit: typeof UNITS[0] }) {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchDocs(unit.slug)
      .then(setDocs)
      .catch((err) => toast.error(err.message));
  }, [unit.slug]);

  useEffect(() => { load(); }, [load]);

  const cartaOrg = docs.find((d) => d.type === "carta-org");

  async function uploadDoc(fileUrl: string, label: string, type: "carta-org" | "dokumen", fileType: "pdf" | "image") {
    try {
      // Remove existing entry of same type+label before inserting new one
      const existing = docs.find((d) => d.type === type && d.label === label);
      if (existing) await apiSend(`/api/unit-dokumen/${existing.id}`, "DELETE");

      await apiSend("/api/unit-dokumen", "POST", {
        unitSlug: unit.slug,
        type,
        label,
        fileUrl,
        fileType,
        sortOrder: unit.dokumen?.findIndex((d) => d.label === label) ?? 0,
      });
      toast.success("Fail berjaya dimuat naik");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiSend(`/api/unit-dokumen/${id}`, "DELETE");
      toast.success("Fail dipadam");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memadam");
    }
  }

  return (
    <div className="space-y-8">
      {/* Carta Organisasi */}
      <section>
        <h3 className="mb-4 text-sm font-semibold">Carta Organisasi</h3>
        {cartaOrg ? (
          <div className="flex items-start gap-4 border border-border/70 bg-card p-4">
            <div className="relative aspect-video w-48 overflow-hidden border bg-muted">
              <Image src={cartaOrg.fileUrl} alt="Carta Organisasi" fill className="object-contain" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Carta Organisasi {unit.title}</p>
              <p className="mt-1 text-xs text-muted-foreground truncate max-w-xs">{cartaOrg.fileUrl}</p>
              <div className="mt-3 flex gap-2">
                <UploadButton
                  endpoint="mediaUploader"
                  onClientUploadComplete={(res) => {
                    if (res[0]) uploadDoc(res[0].ufsUrl, `Carta Organisasi ${unit.title}`, "carta-org", "image");
                  }}
                  onUploadError={(err) => { toast.error(err.message); }}
                  appearance={{ button: "text-xs px-3 py-1.5 h-auto", allowedContent: "hidden" }}
                />
                <DeleteConfirmDialog
                  trigger={
                    <Button variant="outline" size="sm">
                      <Trash2 className="size-3.5" />
                      Padam
                    </Button>
                  }
                  onConfirm={() => handleDelete(cartaOrg.id)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 border border-dashed border-border bg-muted/30 py-8 text-center">
            <ImageIcon className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Belum ada carta organisasi</p>
            <UploadButton
              endpoint="mediaUploader"
              onUploadBegin={() => setUploading("carta-org")}
              onClientUploadComplete={(res) => {
                setUploading(null);
                if (res[0]) uploadDoc(res[0].ufsUrl, `Carta Organisasi ${unit.title}`, "carta-org", "image");
              }}
              onUploadError={(err) => { setUploading(null); toast.error(err.message); }}
              appearance={{ button: "text-xs", allowedContent: "hidden" }}
            />
            {uploading === "carta-org" && <p className="text-xs text-muted-foreground">Memuat naik...</p>}
          </div>
        )}
      </section>

      {/* Dokumen PDF */}
      {unit.dokumen && unit.dokumen.length > 0 && (
        <section>
          <h3 className="mb-4 text-sm font-semibold">Dokumen PDF</h3>
          <div className="space-y-3">
            {unit.dokumen.map((dokItem, idx) => {
              const uploaded = docs.find((d) => d.type === "dokumen" && d.label === dokItem.label);
              return (
                <div key={dokItem.label} className="flex items-center gap-4 border border-border/70 bg-card px-4 py-3">
                  <span className="flex size-8 shrink-0 items-center justify-center bg-primary/8 text-primary">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{dokItem.label}</p>
                    {dokItem.desc && <p className="text-xs text-muted-foreground">{dokItem.desc}</p>}
                    {uploaded && (
                      <a href={uploaded.fileUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <FileText className="size-3" />
                        Lihat fail
                      </a>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {uploaded ? (
                      <>
                        <UploadButton
                          endpoint="documentUploader"
                          onClientUploadComplete={(res) => {
                            if (res[0]) uploadDoc(res[0].ufsUrl, dokItem.label, "dokumen", "pdf");
                          }}
                          onUploadError={(err) => { toast.error(err.message); }}
                          appearance={{ button: "text-xs px-2 py-1 h-auto", allowedContent: "hidden" }}
                        />
                        <DeleteConfirmDialog
                          trigger={
                            <Button variant="ghost" size="icon-sm">
                              <Trash2 className="size-3.5 text-muted-foreground" />
                            </Button>
                          }
                          onConfirm={() => handleDelete(uploaded.id)}
                        />
                      </>
                    ) : (
                      <UploadButton
                        endpoint="documentUploader"
                        onUploadBegin={() => setUploading(`dok-${idx}`)}
                        onClientUploadComplete={(res) => {
                          setUploading(null);
                          if (res[0]) uploadDoc(res[0].ufsUrl, dokItem.label, "dokumen", "pdf");
                        }}
                        onUploadError={(err) => { setUploading(null); toast.error(err.message); }}
                        appearance={{ button: "text-xs px-2 py-1 h-auto", allowedContent: "hidden" }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default function UnitDokumenPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Dokumen Unit</h1>
        <p className="text-sm text-muted-foreground">Carta organisasi dan dokumen PDF bagi setiap unit pengurusan</p>
      </div>

      <Tabs defaultValue={UNITS[0].slug}>
        <TabsList className="flex-wrap h-auto gap-1">
          {UNITS.map((unit) => (
            <TabsTrigger key={unit.slug} value={unit.slug} className="text-xs">
              {unit.navLabel}
            </TabsTrigger>
          ))}
        </TabsList>

        {UNITS.map((unit) => (
          <TabsContent key={unit.slug} value={unit.slug} className="mt-6">
            <UnitDokumenTab unit={unit} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
