"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/admin/data-table";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { apiSend } from "@/lib/fetcher";

type PermohonanRow = {
  id: number;
  pelajarId: number;
  namaPelajar: string;
  tingkatan: string;
  dorm: string;
  jenis: "pulang_bermalam" | "outing" | "mc_sakit";
  tarikhKeluar: string;
  tarikhPulang: string | null;
  sebab: string;
  status: "menunggu" | "diluluskan" | "ditolak" | "mc";
  noWarisPengirim: string;
  diluluskanOleh: string | null;
  approverUserId: string | null;
  tarikhKelulusan: string | null;
  catatan: string | null;
  pengambil: string | null;
  noPendaftaran: string | null;
  guardNama: string | null;
  tarikhDiambil: string | null;
  createdAt: string;
};

type StudentOption = {
  id: number;
  nama: string;
  tingkatan: string;
  dorm: string;
};

export default function AdminPermohonanPage() {
  const [rows, setRows] = useState<PermohonanRow[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jenisFilter, setJenisFilter] = useState("all");
  const [stats, setStats] = useState({ menunggu: 0, diluluskan: 0, ditolak: 0, mc: 0 });

  // Dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<PermohonanRow | null>(null);

  const [approveOpen, setApproveOpen] = useState(false);
  const [approveStatus, setApproveStatus] = useState<"diluluskan" | "ditolak">("diluluskan");
  const [catatan, setCatatan] = useState("");

  const [mcOpen, setMcOpen] = useState(false);
  const [mcPelajarId, setMcPelajarId] = useState("");
  const [mcTarikhKeluar, setMcTarikhKeluar] = useState("");
  const [mcSebab, setMcSebab] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    jenis: "outing",
    tarikhKeluar: "",
    tarikhPulang: "",
    sebab: "",
    pengambil: "",
    noPendaftaran: "",
  });

  async function loadData() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { q: search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(jenisFilter !== "all" && { jenis: jenisFilter }),
      });

      const res = await fetch(`/api/admin/asrama-permohonan?${params.toString()}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");

      setRows(body.data.rows);
      setStats(body.data.stats);
      setTotalPages(body.data.pagination.totalPages);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ralat memuat data");
    } finally {
      setIsLoading(false);
    }
  }

  // Load students for MC creation dropdown
  async function loadStudents() {
    try {
      const res = await fetch("/api/asrama-pelajar?limit=200&status=active");
      const body = await res.json();
      if (res.ok) {
        setStudents(body.data);
      }
    } catch (err) {
      console.error("Gagal memuat senarai pelajar:", err);
    }
  }

  useEffect(() => {
    loadData(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [page, statusFilter, jenisFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadStudents(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadData();
  }

  async function handleApproveSubmit() {
    if (!selectedRow) return;
    try {
      await apiSend(`/api/admin/asrama-permohonan/${selectedRow.id}/approve`, "POST", {
        status: approveStatus,
        catatan: catatan || null,
      });
      toast.success(`Permohonan telah ${approveStatus === "diluluskan" ? "diluluskan" : "ditolak"}`);
      setApproveOpen(false);
      setCatatan("");
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengemaskini kelulusan");
    }
  }

  async function handleMcSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mcPelajarId || !mcTarikhKeluar || !mcSebab) {
      toast.error("Sila lengkapkan semua maklumat");
      return;
    }
    try {
      await apiSend("/api/admin/asrama-permohonan", "POST", {
        pelajarId: Number(mcPelajarId),
        tarikhKeluar: mcTarikhKeluar,
        sebab: mcSebab,
      });
      toast.success("Rekod sakit/MC berjaya dicipta");
      setMcOpen(false);
      setMcPelajarId("");
      setMcTarikhKeluar("");
      setMcSebab("");
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mencipta rekod MC");
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRow) return;
    try {
      await apiSend(`/api/admin/asrama-permohonan/${selectedRow.id}`, "PATCH", {
        jenis: editForm.jenis,
        tarikhKeluar: editForm.tarikhKeluar,
        tarikhPulang: editForm.jenis === "pulang_bermalam" ? editForm.tarikhPulang : null,
        sebab: editForm.sebab,
        pengambil: editForm.pengambil || null,
        noPendaftaran: editForm.noPendaftaran || null,
      });
      toast.success("Permohonan berjaya dikemaskini");
      setEditOpen(false);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengemaskini permohonan");
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiSend(`/api/admin/asrama-permohonan/${id}`, "DELETE");
      toast.success("Permohonan berjaya dipadam");
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memadam permohonan");
    }
  }

  const openApproveDialog = (row: PermohonanRow, status: "diluluskan" | "ditolak") => {
    setSelectedRow(row);
    setApproveStatus(status);
    setCatatan("");
    setApproveOpen(true);
  };

  const openEditDialog = (row: PermohonanRow) => {
    setSelectedRow(row);
    setEditForm({
      jenis: row.jenis,
      tarikhKeluar: row.tarikhKeluar ? new Date(row.tarikhKeluar).toISOString().split("T")[0] : "",
      tarikhPulang: row.tarikhPulang ? new Date(row.tarikhPulang).toISOString().split("T")[0] : "",
      sebab: row.sebab,
      pengambil: row.pengambil ?? "",
      noPendaftaran: row.noPendaftaran ?? "",
    });
    setEditOpen(true);
  };

  const openDetailDialog = (row: PermohonanRow) => {
    setSelectedRow(row);
    setDetailOpen(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("ms-MY", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("ms-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns: ColumnDef<PermohonanRow, unknown>[] = [
    {
      id: "pelajar",
      header: "Pelajar",
      cell: ({ row }) => (
        <div>
          <span className="font-bold block">{row.original.namaPelajar}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.tingkatan} • Dorm {row.original.dorm}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "jenis",
      header: "Jenis",
      cell: ({ row }) => {
        const j = row.original.jenis;
        return (
          <Badge variant={j === "pulang_bermalam" ? "secondary" : j === "outing" ? "outline" : "destructive"}>
            {j === "pulang_bermalam" ? "Pulang Bermalam" : j === "outing" ? "Outing" : "MC / Sakit"}
          </Badge>
        );
      },
    },
    {
      id: "tarikh",
      header: "Tarikh Keluar / Pulang",
      cell: ({ row }) => (
        <div className="text-xs space-y-0.5">
          <p><span className="text-muted-foreground font-medium">Keluar:</span> {formatDate(row.original.tarikhKeluar)}</p>
          {row.original.jenis !== "mc_sakit" && (
            <p><span className="text-muted-foreground font-medium">Pulang:</span> {formatDate(row.original.tarikhPulang)}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge
            variant="outline"
            className={
              s === "menunggu"
                ? "bg-amber-100 text-amber-800 border-amber-200"
                : s === "diluluskan"
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : s === "ditolak"
                ? "bg-rose-100 text-rose-800 border-rose-200"
                : "bg-blue-100 text-blue-800 border-blue-200"
            }
          >
            {s === "menunggu" ? "Menunggu" : s === "diluluskan" ? "Diluluskan" : s === "ditolak" ? "Ditolak" : "MC/Sakit"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openDetailDialog(row.original)}>Lihat Detail</DropdownMenuItem>
            {row.original.status === "menunggu" && (
              <>
                <DropdownMenuItem onClick={() => openApproveDialog(row.original, "diluluskan")}>
                  Luluskan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openApproveDialog(row.original, "ditolak")}>
                  Tolak
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={() => openEditDialog(row.original)}>Edit</DropdownMenuItem>
            <DeleteConfirmDialog
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} variant="destructive">
                  Padam
                </DropdownMenuItem>
              }
              onConfirm={() => handleDelete(row.original.id)}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Permohonan Keluar Asrama</h1>
          <p className="text-sm text-muted-foreground">Kawal permohonan keluar bermalam, outing dan MC pelajar asrama.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/api/admin/asrama-permohonan/export">
              <FileSpreadsheet className="mr-2 size-4" />
              Eksport CSV
            </a>
          </Button>
          <Button onClick={() => setMcOpen(true)}>
            <Plus className="mr-2 size-4" />
            Rekod MC / Sakit
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Menunggu", value: stats.menunggu, color: "border-amber-200 bg-amber-50/20 text-amber-700" },
          { label: "Diluluskan", value: stats.diluluskan, color: "border-emerald-200 bg-emerald-50/20 text-emerald-700" },
          { label: "Ditolak", value: stats.ditolak, color: "border-rose-200 bg-rose-50/20 text-rose-700" },
          { label: "MC / Sakit", value: stats.mc, color: "border-blue-200 bg-blue-50/20 text-blue-700" },
        ].map((s) => (
          <div key={s.label} className={`border px-5 py-4 shadow-sm rounded-lg ${s.color}`}>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-85">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage="Tiada permohonan keluar ditemui."
        toolbar={
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2.5">
            <Input
              placeholder="Cari pelajar atau kelas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs bg-background"
            />
            <Select value={statusFilter} onValueChange={(v) => { setPage(1); setStatusFilter(v); }}>
              <SelectTrigger className="w-[150px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="menunggu">Menunggu</SelectItem>
                <SelectItem value="diluluskan">Diluluskan</SelectItem>
                <SelectItem value="ditolak">Ditolak</SelectItem>
                <SelectItem value="mc">MC / Sakit</SelectItem>
              </SelectContent>
            </Select>

            <Select value={jenisFilter} onValueChange={(v) => { setPage(1); setJenisFilter(v); }}>
              <SelectTrigger className="w-[165px] bg-background">
                <SelectValue placeholder="Jenis Keluar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="outing">Outing</SelectItem>
                <SelectItem value="pulang_bermalam">Pulang Bermalam</SelectItem>
                <SelectItem value="mc_sakit">MC / Sakit</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary" size="sm">Cari</Button>
          </form>
        }
      />

      {/* 1. Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Permohonan Keluar</DialogTitle>
          </DialogHeader>
          {selectedRow && (
            <div className="space-y-4 text-sm">
              <div className="bg-muted/40 p-3 rounded-lg border space-y-1.5">
                <p><strong>Nama Pelajar:</strong> {selectedRow.namaPelajar}</p>
                <p><strong>Kelas & Dorm:</strong> {selectedRow.tingkatan} • Dorm {selectedRow.dorm}</p>
                <p><strong>Jenis Keluar:</strong> <span className="capitalize">{selectedRow.jenis.replace("_", " ")}</span></p>
                <p><strong>Sebab:</strong> {selectedRow.sebab}</p>
                <p><strong>Waris Pengirim:</strong> {selectedRow.noWarisPengirim}</p>
                <p><strong>Tarikh Mohon:</strong> {formatDateTime(selectedRow.createdAt)}</p>
              </div>

              <div className="border-t pt-3 space-y-1.5">
                <h4 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Maklumat Kelulusan</h4>
                <p><strong>Status:</strong> <span className="uppercase font-semibold">{selectedRow.status}</span></p>
                {selectedRow.diluluskanOleh && (
                  <>
                    <p><strong>Diluluskan Oleh:</strong> {selectedRow.diluluskanOleh}</p>
                    <p><strong>Masa Kelulusan:</strong> {formatDateTime(selectedRow.tarikhKelulusan)}</p>
                    <p><strong>Catatan Warden:</strong> {selectedRow.catatan || "—"}</p>
                  </>
                )}
              </div>

              {(selectedRow.status === "diluluskan" || selectedRow.status === "mc") && (
                <div className="border-t pt-3 space-y-1.5">
                  <h4 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Maklumat Pengambilan (Satpam/Guard)</h4>
                  {selectedRow.tarikhDiambil ? (
                    <>
                      <p><strong>Pengambil (Ibu Bapa):</strong> {selectedRow.pengambil}</p>
                      <p><strong>No. Plat Kenderaan:</strong> {selectedRow.noPendaftaran}</p>
                      <p><strong>Masa Pengambilan:</strong> {formatDateTime(selectedRow.tarikhDiambil)}</p>
                      <p><strong>Pengawal Bertugas:</strong> {selectedRow.guardNama || "Satpam"}</p>
                    </>
                  ) : (
                    <p className="text-amber-600 font-medium flex items-center gap-1.5">
                      <AlertTriangle className="size-4" /> Pelajar belum diambil dari asrama.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. Approve/Reject Dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{approveStatus === "diluluskan" ? "Luluskan Permohonan" : "Tolak Permohonan"}</DialogTitle>
            <DialogDescription>
              Tulis catatan atau arahan tambahan kepada waris / pelajar (pilihan).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Catatan / Komen</label>
              <Input
                placeholder="Contoh: Sila bawa slip pengesahan doktor."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setApproveOpen(false)}>Batal</Button>
              <Button
                variant={approveStatus === "diluluskan" ? "default" : "destructive"}
                onClick={handleApproveSubmit}
              >
                {approveStatus === "diluluskan" ? "Luluskan" : "Tolak"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 3. Create MC Dialog */}
      <Dialog open={mcOpen} onOpenChange={setMcOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rekod MC / Sakit Pelajar</DialogTitle>
            <DialogDescription>
              Buat permit keluar automatik bertaraf MC untuk pelajar sakit.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMcSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Pelajar Sakit</label>
              <Select value={mcPelajarId} onValueChange={setMcPelajarId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih pelajar asrama" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {students.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.nama} ({s.tingkatan} • Dorm {s.dorm})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Tarikh Keluar (Mula Sakit)</label>
              <Input
                type="date"
                value={mcTarikhKeluar}
                onChange={(e) => setMcTarikhKeluar(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Sebab / Jenis Sakit</label>
              <Input
                placeholder="Contoh: Demam Panas / Sakit Gigi"
                value={mcSebab}
                onChange={(e) => setMcSebab(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setMcOpen(false)}>Batal</Button>
              <Button type="submit">Cipta Rekod MC</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Permohonan Keluar</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Jenis Keluar</label>
              <Select
                value={editForm.jenis}
                onValueChange={(v) => setEditForm({ ...editForm, jenis: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outing">Outing</SelectItem>
                  <SelectItem value="pulang_bermalam">Pulang Bermalam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Tarikh Keluar</label>
                <Input
                  type="date"
                  value={editForm.tarikhKeluar}
                  onChange={(e) => setEditForm({ ...editForm, tarikhKeluar: e.target.value })}
                />
              </div>

              {editForm.jenis === "pulang_bermalam" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Tarikh Pulang</label>
                  <Input
                    type="date"
                    value={editForm.tarikhPulang}
                    onChange={(e) => setEditForm({ ...editForm, tarikhPulang: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Sebab</label>
              <Input
                value={editForm.sebab}
                onChange={(e) => setEditForm({ ...editForm, sebab: e.target.value })}
              />
            </div>

            {selectedRow && (selectedRow.status === "diluluskan" || selectedRow.status === "mc") && (
              <div className="border-t pt-3 space-y-3">
                <h4 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Maklumat Pengambilan</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Nama Pengambil</label>
                    <Input
                      value={editForm.pengambil}
                      placeholder="Nama Ibu Bapa"
                      onChange={(e) => setEditForm({ ...editForm, pengambil: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">No Plat Kenderaan</label>
                    <Input
                      value={editForm.noPendaftaran}
                      placeholder="Contoh: WXX 1234"
                      onChange={(e) => setEditForm({ ...editForm, noPendaftaran: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
              <Button type="submit">Simpan Kemaskini</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
