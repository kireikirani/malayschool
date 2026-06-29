"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TeacherCard } from "@/components/public/teacher-card";
import { PaginationControls } from "@/components/public/pagination-controls";
import { PageHeader } from "@/components/public/page-header";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

type TeacherRow = {
  id: string;
  name: string;
  position: string | null;
  photo: string | null;
};

export default function TeacherDirectoryPage() {
  const [rows, setRows] = useState<TeacherRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "12" });
    if (search) params.set("q", search);

    fetch(`/api/teachers?${params.toString()}`)
      .then((res) => res.json())
      .then((body) => {
        setRows(body.data ?? []);
        setTotalPages(body.pagination?.totalPages ?? 1);
      })
      .finally(() => setIsLoading(false));
  }, [page, search]);

  return (
    <div>
      <PageHeader eyebrow="Tenaga Pengajar" title="Direktori Guru" description="Kenali guru dan staf yang berdedikasi membimbing pelajar kami." />

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Senarai Guru</h2>
        <Input
          placeholder="Cari nama guru..."
          value={search}
          onChange={(e) => {
            setIsLoading(true);
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs bg-card"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading && Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}
        {!isLoading && rows.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">Belum ada data guru.</p>
        )}
        {!isLoading &&
          rows.map((row, i) => (
            <ScrollAnimation key={row.id} direction="up" delay={(i % 8) * 0.05}>
              <TeacherCard id={row.id} name={row.name} position={row.position} photo={row.photo} />
            </ScrollAnimation>
          ))}
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={(nextPage) => {
          setIsLoading(true);
          setPage(nextPage);
        }}
      />
      </div>
    </div>
  );
}
