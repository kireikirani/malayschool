"use client";

import { useEffect, useState, useMemo } from "react";
import { Lock, Search, Unlock, LogOut, ChevronLeft, ChevronRight, User, Phone, BookOpen, BedDouble, ZoomIn, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchStudentsAction, type StudentData } from "./actions";
import { GdriveCarousel } from "@/components/public/gdrive-carousel";
import { toast } from "sonner";

type Student = StudentData;

type GenderFilter = "all" | "lelaki" | "perempuan";

const ITEMS_PER_PAGE = 20;

const COLOR_SCHEMES = {
  blue: {
    headerBg: "bg-blue-600/10 border-blue-200/60",
    headerText: "text-blue-700",
    rowHover: "hover:bg-blue-50/60",
    nameColor: "text-blue-700 hover:text-blue-900",
  },
  pink: {
    headerBg: "bg-pink-500/10 border-pink-200/60",
    headerText: "text-pink-700",
    rowHover: "hover:bg-pink-50/60",
    nameColor: "text-pink-700 hover:text-pink-900",
  },
} as const;

function WarisCard({
  label,
  nama,
  no,
  isLelaki,
}: {
  label: string;
  nama: string | null;
  no: string | null;
  isLelaki: boolean;
}) {
  if (!nama && !no) return null;
  return (
    <div className="rounded-xl border border-border/60 p-3 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Phone className="size-3.5 text-muted-foreground" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
      {nama && <p className="text-sm font-medium">{nama}</p>}
      {no && (
        <a
          href={`https://wa.me/6${no.replace(/^0/, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm underline-offset-2 hover:underline ${isLelaki ? "text-blue-600" : "text-pink-600"}`}
        >
          {no}
        </a>
      )}
    </div>
  );
}

function StudentDetailDialog({
  student,
  open,
  onOpenChange,
}: {
  student: Student | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [photoOpen, setPhotoOpen] = useState(false);
  const [carouselOpen, setCarouselOpen] = useState(false);

  if (!student) return null;
  const isLelaki = student.jantina === "lelaki";

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        {/* Top colored banner */}
        <div className={`h-24 w-full ${isLelaki ? "bg-blue-600" : "bg-pink-500"}`} />

        {/* Avatar overlapping banner */}
        <div className="px-6 -mt-12">
          {student.foto ? (
            <button
              type="button"
              onClick={() => setPhotoOpen(true)}
              className={`group relative size-20 rounded-full overflow-hidden border-4 border-white shadow-md ${isLelaki ? "bg-blue-100" : "bg-pink-100"} flex items-center justify-center cursor-zoom-in`}
              aria-label="Lihat foto penuh"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={student.foto} alt={student.nama} className="w-full h-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors rounded-full">
                <ZoomIn className="size-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </button>
          ) : (
            <div className={`size-20 rounded-full overflow-hidden border-4 border-white shadow-md ${isLelaki ? "bg-blue-100" : "bg-pink-100"} flex items-center justify-center`}>
              <User className={`size-9 ${isLelaki ? "text-blue-400" : "text-pink-400"}`} />
            </div>
          )}
        </div>

        <DialogHeader className="px-6 pt-2 pb-1">
          <DialogTitle className="text-lg font-heading font-bold leading-tight">{student.nama}</DialogTitle>
          <p className={`text-sm font-medium ${isLelaki ? "text-blue-600" : "text-pink-500"}`}>
            {isLelaki ? "Aspura (Pelajar Lelaki)" : "Aspuri (Pelajar Perempuan)"}
          </p>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl p-3 ${isLelaki ? "bg-blue-50" : "bg-pink-50"}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <BookOpen className={`size-3.5 ${isLelaki ? "text-blue-500" : "text-pink-500"}`} />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tingkatan</span>
              </div>
              <p className="text-sm font-semibold">{student.tingkatan}</p>
            </div>
            <div className={`rounded-xl p-3 ${isLelaki ? "bg-blue-50" : "bg-pink-50"}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <BedDouble className={`size-3.5 ${isLelaki ? "text-blue-500" : "text-pink-500"}`} />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Dorm</span>
              </div>
              <p className="text-sm font-semibold">{student.dorm}</p>
            </div>
          </div>

          {/* Waris 1 */}
          <WarisCard
            label="Waris 1"
            nama={student.namaWaris}
            no={student.noWaris}
            isLelaki={isLelaki}
          />

          {/* Waris 2 */}
          <WarisCard
            label="Waris 2"
            nama={student.namaWaris2}
            no={student.noWaris2}
            isLelaki={isLelaki}
          />

          {/* Waris 3 */}
          <WarisCard
            label="Waris 3"
            nama={student.namaWaris3}
            no={student.noWaris3}
            isLelaki={isLelaki}
          />

          {/* Google Drive Carousel Button */}
          {student.gdriveFolderLink && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setCarouselOpen(true)}
            >
              <ImageIcon className="size-4" />
              Lihat Gambar ({student.nama})
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Full-size photo lightbox */}
    {student.foto && (
      <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
        <DialogContent className="max-w-md p-2 bg-black/90 border-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{student.nama}</DialogTitle>
          </DialogHeader>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={student.foto}
            alt={student.nama}
            className="w-full h-auto rounded object-contain max-h-[80vh]"
          />
        </DialogContent>
      </Dialog>
    )}

    {/* Google Drive Carousel */}
    {student.gdriveFolderLink && (
      <GdriveCarousel
        folderLink={student.gdriveFolderLink}
        studentName={student.nama}
        open={carouselOpen}
        onOpenChange={setCarouselOpen}
      />
    )}
    </>
  );
}

function PaginatedStudentTable({
  title,
  students,
  search,
  onSelectStudent,
  colorScheme,
}: {
  title: string;
  students: Student[];
  search: string;
  onSelectStudent: (student: Student) => void;
  colorScheme: "blue" | "pink";
}) {
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, students]);

  const paginated = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  const { headerBg, headerText, rowHover, nameColor } = COLOR_SCHEMES[colorScheme];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-border/70 bg-card shadow-sm">
        <div className={`border-b px-5 py-3 ${headerBg}`}>
          <span className={`font-heading text-sm font-semibold ${headerText}`}>{title}</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/20">
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
                <tr
                  key={row.id}
                  className={`border-b border-border/40 last:border-0 transition-colors cursor-pointer ${rowHover}`}
                  onClick={() => onSelectStudent(row)}
                >
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`font-medium underline-offset-2 hover:underline ${nameColor}`}>
                      {row.nama}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{row.tingkatan}</td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{row.dorm}</td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">{row.noWaris ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

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
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [tingkatanFilter, setTingkatanFilter] = useState<string>("all");
  const [dormFilter, setDormFilter] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const savedPassword = sessionStorage.getItem("asrama_page_password");
    if (savedPassword) {
      setIsVerifying(true);
      fetchStudentsAction(savedPassword)
        .then((res) => {
          if (res.success) {
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
      if (res.success) {
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
    setGenderFilter("all");
    setTingkatanFilter("all");
    setDormFilter("all");
    sessionStorage.removeItem("asrama_page_password");
    toast.info("Halaman dikunci semula");
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
  };

  const { boys, girls, tingkatanOptions, dormOptions } = useMemo(() => {
    const boys: Student[] = [];
    const girls: Student[] = [];
    const tingkatanSet = new Set<string>();
    const dormSet = new Set<string>();
    for (const s of students) {
      if (s.jantina === "lelaki") boys.push(s);
      else girls.push(s);
      if (s.tingkatan) tingkatanSet.add(s.tingkatan);
      if (s.dorm) dormSet.add(s.dorm);
    }
    const collator = new Intl.Collator("ms", { numeric: true, sensitivity: "base" });
    const tingkatanOptions = Array.from(tingkatanSet).sort((a, b) => collator.compare(a, b));
    const dormOptions = Array.from(dormSet).sort((a, b) => collator.compare(a, b));
    return { boys, girls, tingkatanOptions, dormOptions };
  }, [students]);

  const toggleFilter = (f: GenderFilter) => {
    setGenderFilter((prev) => (prev === f ? "all" : f));
  };

  const isAllActive =
    genderFilter === "all" && tingkatanFilter === "all" && dormFilter === "all";

  const resetAllFilters = () => {
    setGenderFilter("all");
    setTingkatanFilter("all");
    setDormFilter("all");
  };

  const applyExtraFilters = (list: Student[]) =>
    list.filter(
      (s) =>
        (tingkatanFilter === "all" || s.tingkatan === tingkatanFilter) &&
        (dormFilter === "all" || s.dorm === dormFilter),
    );

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

      {/* Stats / Filter Cards */}
      <div className="grid gap-4 grid-cols-3 max-w-2xl">
        {/* Total - klik untuk reset semua filter */}
        <button
          type="button"
          onClick={resetAllFilters}
          className={`border p-4 text-center rounded-sm transition-all ${
            isAllActive
              ? "bg-blue-700 border-blue-700 shadow-md shadow-blue-200"
              : "bg-blue-50 border-blue-200 hover:bg-blue-100"
          }`}
        >
          <p className={`font-heading text-2xl font-semibold ${isAllActive ? "text-white" : "text-blue-700"}`}>
            {students.length}
          </p>
          <p className={`mt-1 text-[11px] font-medium uppercase tracking-wide ${isAllActive ? "text-blue-100" : "text-blue-500"}`}>
            Jumlah Pelajar
          </p>
        </button>

        {/* Lelaki filter card */}
        <button
          type="button"
          onClick={() => toggleFilter("lelaki")}
          className={`border p-4 text-center rounded-sm transition-all ${
            genderFilter === "lelaki"
              ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-200"
              : "bg-sky-50 border-sky-200 hover:bg-sky-100"
          }`}
        >
          <p className={`font-heading text-2xl font-semibold ${genderFilter === "lelaki" ? "text-white" : "text-sky-700"}`}>
            {boys.length}
          </p>
          <p className={`mt-1 text-[11px] font-medium uppercase tracking-wide ${genderFilter === "lelaki" ? "text-blue-100" : "text-sky-500"}`}>
            Aspura (Lelaki)
          </p>
        </button>

        {/* Perempuan filter card */}
        <button
          type="button"
          onClick={() => toggleFilter("perempuan")}
          className={`border p-4 text-center rounded-sm transition-all ${
            genderFilter === "perempuan"
              ? "bg-pink-500 border-pink-500 shadow-md shadow-pink-200"
              : "bg-pink-50 border-pink-200 hover:bg-pink-100"
          }`}
        >
          <p className={`font-heading text-2xl font-semibold ${genderFilter === "perempuan" ? "text-white" : "text-pink-700"}`}>
            {girls.length}
          </p>
          <p className={`mt-1 text-[11px] font-medium uppercase tracking-wide ${genderFilter === "perempuan" ? "text-pink-100" : "text-pink-400"}`}>
            Aspuri (Perempuan)
          </p>
        </button>
      </div>

      {/* Tingkatan & Dorm filters */}
      <div className="flex flex-wrap gap-3 -mt-4">
        <Select value={tingkatanFilter} onValueChange={setTingkatanFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Semua Tingkatan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tingkatan</SelectItem>
            {tingkatanOptions.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dormFilter} onValueChange={setDormFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Semua Dorm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Dorm</SelectItem>
            {dormOptions.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tables section */}
      <div className="space-y-12">
        {(genderFilter === "all" || genderFilter === "lelaki") && (
          <PaginatedStudentTable
            title="Aspura (Pelajar Lelaki)"
            students={applyExtraFilters(boys)}
            search={search}
            onSelectStudent={handleSelectStudent}
            colorScheme="blue"
          />
        )}
        {(genderFilter === "all" || genderFilter === "perempuan") && (
          <PaginatedStudentTable
            title="Aspuri (Pelajar Perempuan)"
            students={applyExtraFilters(girls)}
            search={search}
            onSelectStudent={handleSelectStudent}
            colorScheme="pink"
          />
        )}
      </div>

      {/* Student detail dialog */}
      <StudentDetailDialog
        student={selectedStudent}
        open={selectedStudent !== null}
        onOpenChange={(v) => { if (!v) setSelectedStudent(null); }}
      />
    </div>
  );
}
