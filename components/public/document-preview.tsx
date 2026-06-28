"use client";

import { useEffect, useState } from "react";
import { FileWarning, TableProperties } from "lucide-react";
import { getExtension, isPdfLink, isSpreadsheetLink, isTextPreviewLink } from "@/lib/file-type";
import { parseTextPreviewFromUrl, parseXlsxFromUrl, type SheetTable } from "@/lib/xlsx-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function SheetGrid({ sheet }: { sheet: SheetTable }) {
  if (sheet.headers.length === 0) {
    return (
      <EmptyState
        compact
        icon={TableProperties}
        title="Helaian kosong"
        description="Spreadsheet ini berjaya dibaca, tetapi helaian yang dipilih tidak mempunyai data."
      />
    );
  }

  return (
    <div className="overflow-x-auto border border-border/70 bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {sheet.headers.map((header, i) => (
              <TableHead key={i} className="bg-muted/70">
                {header || `Lajur ${i + 1}`}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sheet.rows.map((row, ri) => (
            <TableRow key={ri}>
              {row.map((cell, ci) => (
                <TableCell key={ci}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function DocumentPreview({ url }: { url: string }) {
  const [sheets, setSheets] = useState<SheetTable[] | null>(null);
  const [textLines, setTextLines] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(null);
        if (isSpreadsheetLink(url)) {
          const nextSheets = await parseXlsxFromUrl(url);
          if (!cancelled) setSheets(nextSheets);
          return;
        }

        if (isTextPreviewLink(url)) {
          const nextLines = await parseTextPreviewFromUrl(url);
          if (!cancelled) setTextLines(nextLines);
          return;
        }
      } catch {
        if (!cancelled) setError("Pratinjau fail tidak dapat dimuatkan.");
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (isPdfLink(url)) {
    return (
      <div className="overflow-hidden border border-border/70 bg-card">
        <iframe
          src={url}
          title="Pratinjau PDF"
          className="h-[480px] w-full"
        />
      </div>
    );
  }

  if (isSpreadsheetLink(url)) {
    if (error) {
      return <EmptyState compact icon={FileWarning} title="Pratinjau gagal dimuatkan" description={error} />;
    }
    if (!sheets) {
      return <div className="h-32 animate-pulse border border-border/70 bg-muted" />;
    }
    if (sheets.length === 0) return null;
    if (sheets.length === 1) return <SheetGrid sheet={sheets[0]} />;

    return (
      <Tabs defaultValue={sheets[0].name}>
        <TabsList>
          {sheets.map((sheet) => (
            <TabsTrigger key={sheet.name} value={sheet.name}>
              {sheet.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {sheets.map((sheet) => (
          <TabsContent key={sheet.name} value={sheet.name}>
            <SheetGrid sheet={sheet} />
          </TabsContent>
        ))}
      </Tabs>
    );
  }

  if (isTextPreviewLink(url)) {
    if (error) {
      return <EmptyState compact icon={FileWarning} title="Pratinjau gagal dimuatkan" description={error} />;
    }
    if (!textLines) {
      return <div className="h-32 animate-pulse border border-border/70 bg-muted" />;
    }

    return (
      <pre className="overflow-x-auto border border-border/70 bg-card p-4 text-xs leading-6 whitespace-pre-wrap text-foreground">
        {textLines.join("\n")}
      </pre>
    );
  }

  const ext = getExtension(url);

  return (
    <EmptyState
      compact
      icon={FileWarning}
      title="Pratinjau belum tersedia"
      description={
        ext ? `Pratinjau inline untuk fail .${ext} belum tersedia.` : "Pratinjau inline untuk fail ini belum tersedia."
      }
    />
  );
}
