"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GalleryAlbumCard } from "@/components/public/gallery-album-card";
import { PaginationControls } from "@/components/public/pagination-controls";
import { PageHeader } from "@/components/public/page-header";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

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
    fetch(`/api/gallery/albums?page=${page}&limit=12`)
      .then((res) => res.json())
      .then((body) => {
        setRows(body.data ?? []);
        setTotalPages(body.pagination?.totalPages ?? 1);
      })
      .finally(() => setIsLoading(false));
  }, [page]);

  return (
    <div>
      <PageHeader eyebrow="Galeri" title="Galeri Sekolah" description="Detik-detik dan kenangan sepanjang sesi persekolahan." />

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:py-14">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-video w-full" />)}
        {!isLoading && rows.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">Belum ada album.</p>
        )}
        {!isLoading &&
          rows.map((row, i) => (
            <ScrollAnimation key={row.id} direction="up" delay={(i % 6) * 0.06}>
              <GalleryAlbumCard
                id={row.id}
                name={row.name}
                coverImage={row.coverImage}
                itemCount={row.itemCount}
              />
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
