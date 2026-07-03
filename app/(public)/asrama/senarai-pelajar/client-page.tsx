"use client";

import { useEffect, useState, useMemo } from "react";
import { Lock, Search, FileText, Unlock, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fetchStudentsAction } from "./actions";
import { toast } from "sonner";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

type Student = {
  id: number;
  nama: string;
  jantina: string;
  tingkatan: string;
  dorm: string;
  noWaris: string | null;
};

const ITEMS_PER_PAGE = 20;

function PaginatedStudentTable({
  title,
  students,
  search,
}: {
  title: string;
  students: Student[];
  search: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter based on search query
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.nama.toLowerCase().includes(q) ||
        s.tingkatan.toLowerCase().includes(q) ||
        s.dorm.toLowerCase().includes(q)
    );
  }, [students, search]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Adjust page number if items change
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const paginated = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      <div className="overflow-x-auto border border-border/70 bg-card">
        <div className="border-b border-border/70 bg-muted/40 px-5 py-3">
          <span className="font-heading text-sm font-semibold">{title}</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="w-8 px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">#</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">Nama</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">Tingkatan</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Dorm</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">No. Waris</th>
            </tr>
          </thead>
          <tbody>
            {totalItems === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                  Tiada rekod pelajar dijumpai.
                </td>
              </tr>
            ) : (
              paginated.map((row, index) => (
                <tr key={row.id} className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-5 py-3.5 font-medium">{row.nama}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{row.tingkatan}</td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{row.dorm}</td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">{row.noWaris ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-border/40 px-5 py-3 bg-muted/10">
            <p className="text-xs text-muted-foreground">
              Memapar <span className="font-medium text-foreground">{startIndex}</span> sehingga{" "}
              <span className="font-medium text-foreground">{endIndex}</span> dari{" "}
              <span className="font-medium text-foreground">{totalItems}</span> pelajar
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="size-4" />
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = pageNum === currentPage;
                return (
                  <Button
                    key={pageNum}
                    variant={isCurrent ? "default" : "outline"}
                    size="icon-sm"
                    className="w-8 h-8 text-xs"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
        
        {totalPages <= 1 && totalItems > 0 && (
          <div className="border-t border-border/40 px-5 py-3 text-center bg-muted/10">
            <p className="text-xs text-muted-foreground">
              Menunjukkan kesemua {totalItems} pelajar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function AsramaStudentSubpage() {
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [search, setSearch] = useState("");

  // Check if session has stored password
  useEffect(() => {
    const savedPassword = sessionStorage.getItem("asrama_page_password");
    if (savedPassword) {
      setIsVerifying(true);
      fetchStudentsAction(savedPassword)
        .then((res) => {
          if (res.success && res.data) {
            setStudents(res.data);
            setIsAuthenticated(true);
          } else {
            sessionStorage.removeItem("asrama_page_password");
          }
        })
        .catch(() => {})
        .finally(() => setIsVerifying(false));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Sila masukkan kata laluan");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetchStudentsAction(password);
      if (res.success && res.data) {
        setStudents(res.data);
        setIsAuthenticated(true);
        sessionStorage.setItem("asrama_page_password", password);
        toast.success("Halaman berjaya dinyahkunci");
      } else {
        toast.error(res.error || "Kata laluan salah!");
      }
    } catch {
      toast.error("Ralat rangkaian semasa pengesahan");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    setStudents([]);
    setPassword("");
    sessionStorage.removeItem("asrama_page_password");
    toast.info("Halaman dikunci semula");
  };

  // Filter boys and girls
  const boys = useMemo(() => students.filter((s) => s.jantina === "lelaki"), [students]);
  const girls = useMemo(() => students.filter((s) => s.jantina === "perempuan"), [students]);

  if (isVerifying && !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <Lock className="size-8 animate-pulse text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Mengesahkan kata laluan...
        </p>
      </div>
    );
  }

  // PASSWORD PROMPT VIEW
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <Card className="border-border/70 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/5 text-primary border border-primary/10">
              <Lock className="size-6" />
            </div>
            <CardTitle className="font-heading text-xl">Akses Halaman Sulit</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Masukkan kata laluan sulit asrama untuk melihat senarai penuh pelajar asrama.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Input
                  type="password"
                  placeholder="Kata laluan asrama"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-center h-10 tracking-widest font-sans"
                />
              </div>
              <Button type="submit" className="w-full h-10 gap-2" disabled={isVerifying}>
                <Unlock className="size-4" />
                Nyahkunci Senarai
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // STUDENT LISTS VIEW
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16 space-y-10">
      {/* Header and Controls */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-semibold uppercase tracking-wider text-xs">
            <Lock className="size-3.5 text-primary" />
            <span>Data Pelajar</span>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Senarai Pelajar Asrama
          </h1>
          <p className="text-sm text-muted-foreground">
            Senarai penghuni asrama yang dikemaskini melalui dashboard admin.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/75" />
            <Input
              type="text"
              placeholder="Carian nama, kelas, dorm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleLock} className="gap-2">
            <LogOut className="size-4" />
            Kunci Halaman
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 grid-cols-3 max-w-2xl">
        {[
          { label: "Jumlah Pelajar", value: students.length },
          { label: "Aspura (Lelaki)", value: boys.length },
          { label: "Aspuri (Perempuan)", value: girls.length },
        ].map((stat) => (
          <div key={stat.label} className="border border-border/70 bg-card p-4 text-center">
            <p className="font-heading text-2xl font-semibold text-primary">{stat.value}</p>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Tables section */}
      <div className="space-y-12">
        <PaginatedStudentTable title="Aspura (Pelajar Lelaki)" students={boys} search={search} />
        <PaginatedStudentTable title="Aspuri (Pelajar Perempuan)" students={girls} search={search} />
      </div>
    </div>
  );
}
