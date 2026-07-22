"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TingkatanFormSelect({
  value,
  onValueChange,
  disabled = false,
}: {
  value: string;
  onValueChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [options, setOptions] = useState<string[]>([]);
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    fetch("/api/asrama-pelajar/tingkatan")
      .then((r) => r.json())
      .then((b) => {
        if (Array.isArray(b.data)) setOptions(b.data);
      })
      .catch(() => {});
  }, []);

  const isKnownOption = options.includes(value);

  if (isCustom || (!isKnownOption && value !== "")) {
    return (
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="Contoh: Tingkatan 4A"
          disabled={disabled}
          className="flex-1"
        />
        {options.length > 0 && (
          <button
            type="button"
            onClick={() => setIsCustom(false)}
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground underline"
          >
            Pilih
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Select
        value={value}
        onValueChange={(v) => {
          if (v === "__custom") {
            setIsCustom(true);
            onValueChange("");
          } else {
            onValueChange(v);
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Pilih tingkatan" />
        </SelectTrigger>
        <SelectContent>
          {options.map((t) => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
          <SelectItem value="__custom">Lain-lain...</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
