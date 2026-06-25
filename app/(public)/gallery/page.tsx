"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GalleryAlbumCard } from "@/components/public/gallery-album-card";
import { PaginationControls } from "@/components/public/pagination-controls";

type AlbumRow = {
  id: string;
  name: string;
  coverImage: string | null;
  itemCount: number;
};

export default function GalleryListPage() {
  const [rows, setRows] = useState<AlbumRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/gallery/albums?page=${page}&limit=12`)
      .then((res) => res.json())
      .then((body) => {
        setRows(body.data ?? []);
        setTotalPages(body.pagination?.totalPages ?? 1);
      })
      .finally(() => setIsLoading(false));
  }, [page]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">Galeri Sekolah</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-video w-full" />)}
        {!isLoading && rows.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">Belum ada album.</p>
        )}
        {!isLoading &&
          rows.map((row) => (
            <GalleryAlbumCard
              key={row.id}
              id={row.id}
              name={row.name}
              coverImage={row.coverImage}
              itemCount={row.itemCount}
            />
          ))}
      </div>

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
