"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, User, BedDouble, Phone, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TingkatanSelect } from "@/components/public/tingkatan-select";
import { toast } from "sonner";

type Student = {
  id: number;
  nama: string;
  jantina: string;
  tingkatan: string;
  dorm: string;
  noWaris: string | null;
  namaWaris: string | null;
  foto: string | null;
};

export default function GuardSenaraiPelajarPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tingkatanFilter, setTingkatanFilter] = useState("all");

  async function fetchStudents() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/asrama-pelajar/search?q=&tingkatan=");
      const body = await res.json();
      if (res.ok) setStudents(body.data ?? []);
    } catch {
      toast.error("Gagal memuat data pelajar");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return students.filter(
      (s) =>
        (tingkatanFilter === "all" || s.tingkatan === tingkatanFilter) &&
        (!q || s.nama.toLowerCase().includes(q) || s.dorm.toLowerCase().includes(q))
    );
  }, [students, search, tingkatanFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Senarai Pelajar Asrama</h1>
        <p className="text-sm text-muted-foreground">Senarai pelajar aktif untuk rujukan pengawal.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            placeholder="Cari nama pelajar atau dorm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <TingkatanSelect
          value={tingkatanFilter}
          onValueChange={setTingkatanFilter}
          placeholder="Semua Tingkatan"
          className="w-full sm:w-48"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <RefreshCw className="mx-auto size-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Memuatkan data...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg bg-muted/20">
          <User className="mx-auto size-10 text-muted-foreground/50 mb-3" />
          <p className="font-semibold text-muted-foreground">Tiada pelajar dijumpai</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((student) => (
            <Card key={student.id} className="border border-border/50 shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {student.foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={student.foto} alt={student.nama} className="size-10 rounded-full object-cover border" />
                    ) : (
                      <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="size-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">{student.nama}</p>
                      <p className="text-xs text-muted-foreground">{student.tingkatan}</p>
                    </div>
                  </div>
                  <Badge variant={student.jantina === "lelaki" ? "default" : "secondary"} className="text-[10px]">
                    {student.jantina === "lelaki" ? "Aspura" : "Aspuri"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BedDouble className="size-3" />
                    {student.dorm}
                  </span>
                  {student.noWaris && (
                    <span className="flex items-center gap-1">
                      <Phone className="size-3" />
                      {student.noWaris}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
