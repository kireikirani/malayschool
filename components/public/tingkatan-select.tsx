"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TingkatanSelect({
  value,
  onValueChange,
  placeholder = "Semua Tingkatan",
  includeAll = true,
  disabled = false,
  className,
}: {
  value: string;
  onValueChange: (v: string) => void;
  placeholder?: string;
  includeAll?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/asrama-pelajar/tingkatan")
      .then((r) => r.json())
      .then((b) => {
        if (Array.isArray(b.data)) setOptions(b.data);
      })
      .catch(() => {});
  }, []);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAll && <SelectItem value="all">{placeholder}</SelectItem>}
        {options.map((t) => (
          <SelectItem key={t} value={t}>
            {t}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
