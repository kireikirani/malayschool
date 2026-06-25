"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { NewsCard } from "@/components/public/news-card";
import { PaginationControls } from "@/components/public/pagination-controls";

type NewsRow = {
  id: string;
  title: string;
  thumbnail: string | null;
  publishDate: string | null;
};

export default function PublicNewsListPage() {
  const [rows, setRows] = useState<NewsRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "12" });
    if (search) params.set("q", search);

    fetch(`/api/news?${params.toString()}`)
      .then((res) => res.json())
      .then((body) => {
        setRows(body.data ?? []);
        setTotalPages(body.pagination?.totalPages ?? 1);
      })
      .finally(() => setIsLoading(false));
  }, [page, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Berita Sekolah</h1>
        <Input
          placeholder="Cari berita..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] w-full" />)}
        {!isLoading && rows.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">Belum ada berita.</p>
        )}
        {!isLoading &&
          rows.map((row) => (
            <NewsCard key={row.id} id={row.id} title={row.title} thumbnail={row.thumbnail} publishDate={row.publishDate} />
          ))}
      </div>

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
