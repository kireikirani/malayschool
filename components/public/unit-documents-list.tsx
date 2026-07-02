"use client";

import { useState, useMemo } from "react";
import { Search, FileText, ChevronLeft, ChevronRight, LayoutGrid, List, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DocItem = {
  id?: number;
  label?: string | null;
  title?: string | null;
  value?: string | null;
  body?: string | null;
  url?: string | null;
  fileUrl?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  createdAt?: string | Date | null;
};

const ITEMS_PER_PAGE = 10;

const formatDate = (dateInput: Date | string | null | undefined) => {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";
  
  const day = date.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
};

export function UnitDocumentsList({
  items,
  title,
  subtitle,
}: {
  items: DocItem[];
  title?: string | null;
  subtitle?: string | null;
}) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaginated, setIsPaginated] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const label = item.label || item.title || "";
      const dateStr = item.createdAt ? formatDate(item.createdAt) : "";
      const body = item.body || "";
      const searchLower = search.toLowerCase();
      return (
        label.toLowerCase().includes(searchLower) ||
        dateStr.toLowerCase().includes(searchLower) ||
        body.toLowerCase().includes(searchLower)
      );
    });
  }, [items, search]);

  // Pagination logic
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    if (!isPaginated) return filteredItems;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage, isPaginated]);

  // Adjust current page if search filters out items
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title ? (
            <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        {/* Toolbar: View mode, Search, and Toggle Pagination */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-border/70 p-0.5 bg-muted/20">
            <Button
              variant="ghost"
              size="icon-sm"
              className={`rounded-none ${viewMode === "table" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
              onClick={() => setViewMode("table")}
              title="Paparan Jadual"
            >
              <List className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className={`rounded-none ${viewMode === "card" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
              onClick={() => setViewMode("card")}
              title="Paparan Kad"
            >
              <LayoutGrid className="size-4" />
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative w-full max-w-xs sm:w-64">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/75" />
            <Input
              type="text"
              placeholder="Carian..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-9"
            />
          </div>

          {/* View All Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsPaginated(!isPaginated);
              setCurrentPage(1);
            }}
          >
            {isPaginated ? "Lihat Semua" : "Lihat Berhalaman"}
          </Button>
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="flex min-h-32 flex-col items-center justify-center border border-dashed border-border/70 bg-muted/10 p-8 text-center">
          <FileText className="size-8 text-muted-foreground/40" />
          <p className="mt-2 text-sm font-medium">Tiada dokumen dijumpai</p>
          <p className="text-xs text-muted-foreground">Cuba carian dengan kata kunci lain.</p>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW (as requested in the green boxed image) */
        <div className="overflow-x-auto border border-border/70 bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tajuk
                </th>
                <th className="w-40 px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tarikh
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item, idx) => {
                const docName = item.label || item.title || "Dokumen";
                const isAvailable = !!item.fileUrl;

                return (
                  <tr
                    key={item.id || idx}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      {isAvailable ? (
                        <a
                          href={item.fileUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline hover:text-primary/95 flex items-center gap-2"
                        >
                          <FileText className="size-4 shrink-0 text-primary/70" />
                          {docName}
                        </a>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground/70">
                          <FileText className="size-4 shrink-0 text-muted-foreground/45" />
                          <span>{docName}</span>
                          <span className="text-[10px] bg-muted/60 px-1.5 py-0.5 rounded border">
                            Belum dimuat naik
                          </span>
                        </div>
                      )}
                      {item.body && <p className="mt-1 text-xs text-muted-foreground/80 pl-6">{item.body}</p>}
                    </td>
                    <td className="px-5 py-4 text-right text-muted-foreground tabular-nums">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedItems.map((item, idx) => {
            const docName = item.label || item.title || "Dokumen";
            const isAvailable = !!item.fileUrl;

            return (
              <div
                key={item.id || idx}
                className="flex flex-col border border-border/70 bg-card p-5 hover:border-primary/45 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <FileText className="size-7 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-sm font-semibold truncate-2-lines" title={docName}>
                      {docName}
                    </h3>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
                {item.body && (
                  <p className="mt-3 flex-1 text-xs text-muted-foreground line-clamp-3">
                    {item.body}
                  </p>
                )}
                <div className="mt-4 pt-3 border-t border-border/40 flex justify-end">
                  {isAvailable ? (
                    <Button variant="outline" size="sm" asChild className="w-full gap-2">
                      <a href={item.fileUrl!} target="_blank" rel="noopener noreferrer">
                        <Download className="size-3.5" />
                        Muat Turun
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled className="w-full gap-2">
                      Belum tersedia
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {isPaginated && totalPages > 1 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border/50">
          {/* Memapar X sehingga Y dari Z dokumen */}
          <p className="text-xs text-muted-foreground">
            Memapar <span className="font-medium text-foreground">{startIndex}</span> sehingga{" "}
            <span className="font-medium text-foreground">{endIndex}</span> dari{" "}
            <span className="font-medium text-foreground">{totalItems}</span> dokumen
          </p>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="size-4" />
            </Button>

            {/* Generated Page Numbers */}
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isCurrent = pageNum === currentPage;
              
              // Only show first, last, current, and surrounding page numbers
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                Math.abs(pageNum - currentPage) <= 1
              ) {
                return (
                  <Button
                    key={pageNum}
                    variant={isCurrent ? "default" : "outline"}
                    size="icon-sm"
                    className="w-8 h-8 text-xs font-medium"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              }
              
              // Ellipses rendering
              if (
                pageNum === 2 ||
                pageNum === totalPages - 1
              ) {
                return (
                  <span key={pageNum} className="px-1 text-xs text-muted-foreground">
                    ...
                  </span>
                );
              }
              
              return null;
            })}

            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              title="Halaman Seterusnya"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
