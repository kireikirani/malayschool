"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

type StudentOption = {
  id: number;
  nama: string;
  tingkatan: string;
  dorm: string;
  noWaris: string | null;
  noWaris2: string | null;
  noWaris3: string | null;
};

export function StudentSearchInput({
  tingkatanFilter,
  value,
  onSelect,
  placeholder = "Cari nama pelajar...",
  disabled = false,
}: {
  tingkatanFilter?: string;
  value?: string;
  onSelect: (student: StudentOption) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<StudentOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchStudents = useCallback(async (q: string, tingkatan: string) => {
    if (q.length < 1 && !tingkatan) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (tingkatan) params.set("tingkatan", tingkatan);
      const res = await fetch(`/api/asrama-pelajar/search?${params}`);
      const body = await res.json();
      if (res.ok) setResults(body.data ?? []);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents(debouncedQuery, tingkatanFilter ?? "");
  }, [debouncedQuery, tingkatanFilter, fetchStudents]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(student: StudentOption) {
    setQuery(student.nama);
    setOpen(false);
    onSelect(student);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-9 pr-9"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
          {results.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => handleSelect(student)}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent",
                query === student.nama && "bg-accent"
              )}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{student.nama}</p>
                <p className="text-xs text-muted-foreground">
                  {student.tingkatan} · {student.dorm}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && debouncedQuery.length >= 1 && results.length === 0 && !isSearching && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg px-3 py-4 text-center text-sm text-muted-foreground">
          Tiada pelajar dijumpai
        </div>
      )}
    </div>
  );
}
