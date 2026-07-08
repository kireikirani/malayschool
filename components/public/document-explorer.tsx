"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  FileCode,
  FileArchive,
  FileUp,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Search,
  RefreshCw,
  ExternalLink,
  Download,
  Eye,
  Info,
  X,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Define Types
export type FileItem = {
  id: string | number;
  name: string;
  mimeType: string;
  size: string;
  dateCreated: string;
  url: string;
  downloadUrl?: string;
};

export type FolderItem = {
  id: string;
  name: string;
  files: FileItem[];
  folders: FolderItem[];
};

// Map file types to icons and styles
const getFileMeta = (mimeType: string, fileName: string) => {
  const nameLower = fileName.toLowerCase();
  if (mimeType.includes("pdf") || nameLower.endsWith(".pdf")) {
    return {
      icon: <FileText className="size-4 shrink-0 text-red-500" />,
      badge: "PDF",
      badgeColor: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
    };
  }
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    nameLower.endsWith(".xlsx") ||
    nameLower.endsWith(".xls") ||
    nameLower.endsWith(".csv")
  ) {
    return {
      icon: <FileSpreadsheet className="size-4 shrink-0 text-emerald-600" />,
      badge: "EXCEL",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    };
  }
  if (
    mimeType.includes("word") ||
    mimeType.includes("document") ||
    nameLower.endsWith(".docx") ||
    nameLower.endsWith(".doc")
  ) {
    return {
      icon: <FileText className="size-4 shrink-0 text-blue-500" />,
      badge: "WORD",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
    };
  }
  if (mimeType.includes("image") || /\.(png|jpg|jpeg|gif|webp|svg)/.test(nameLower)) {
    return {
      icon: <FileImage className="size-4 shrink-0 text-indigo-500" />,
      badge: "IMEJ",
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
    };
  }
  return {
    icon: <FileCode className="size-4 shrink-0 text-muted-foreground" />,
    badge: "FAIL",
    badgeColor: "bg-muted/10 text-muted-foreground border-muted/20"
  };
};

// Formats Google Drive link into embedding-friendly URL
function getDrivePreviewUrl(url: string): string {
  if (!url.includes("drive.google.com")) return url;
  const fileMatch = url.match(/\/file\/d\/([^/?#]+)/);
  if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
  const idMatch = url.match(/[?&]id=([^&#]+)/);
  if (idMatch) return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
  return url;
}

// Check if a URL is an image
function isImageUrl(url: string, fileName: string): boolean {
  return (
    /\.(jpg|jpeg|png|webp|gif|svg)/.test(fileName.toLowerCase()) ||
    url.includes("uploadthing") ||
    url.includes("ufs.sh")
  );
}

// Tree view Node component
interface FolderNodeProps {
  folder: FolderItem;
  level: number;
  selectedId: string;
  expandedIds: Record<string, boolean>;
  onSelect: (folder: FolderItem) => void;
  onToggleExpand: (id: string) => void;
}

function FolderNode({
  folder,
  level,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand
}: FolderNodeProps) {
  const isExpanded = !!expandedIds[folder.id];
  const isSelected = selectedId === folder.id;
  const hasSubfolders = folder.folders && folder.folders.length > 0;

  return (
    <div className="select-none">
      <div
        className={cn(
          "group flex items-center gap-1.5 py-1.5 px-2 cursor-pointer hover:bg-accent/40 rounded transition-colors text-sm",
          isSelected && "bg-primary/10 text-primary hover:bg-primary/15 font-medium"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onSelect(folder)}
      >
        <span
          className="p-0.5 hover:bg-accent rounded transition-colors"
          onClick={(e) => {
            if (hasSubfolders) {
              e.stopPropagation();
              onToggleExpand(folder.id);
            }
          }}
        >
          {hasSubfolders ? (
            isExpanded ? (
              <ChevronDown className="size-3.5 text-muted-foreground/80" />
            ) : (
              <ChevronRight className="size-3.5 text-muted-foreground/80" />
            )
          ) : (
            <span className="size-3.5 block" />
          )}
        </span>

        {isExpanded ? (
          <FolderOpen className={cn("size-4 text-amber-500 shrink-0", isSelected && "text-primary")} />
        ) : (
          <Folder className={cn("size-4 text-amber-500 shrink-0", isSelected && "text-primary")} />
        )}

        <span className="truncate text-xs sm:text-sm">{folder.name}</span>
      </div>

      {isExpanded && hasSubfolders && (
        <div className="mt-0.5">
          {folder.folders.map((subFolder) => (
            <FolderNode
              key={subFolder.id}
              folder={subFolder}
              level={level + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DocumentExplorerProps {
  title?: string;
  scopedUnitSlug?: string; // e.g. "hem"
}

export function DocumentExplorer({ title = "PORTAL DOKUMEN SEKOLAH", scopedUnitSlug }: DocumentExplorerProps) {
  const [rootFolder, setRootFolder] = useState<FolderItem | null>(null);
  const [activeFolder, setActiveFolder] = useState<FolderItem | null>(null);
  const [activeFile, setActiveFile] = useState<FileItem | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Load documents structure from API
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/school-documents");
      if (!res.ok) {
        throw new Error("Gagal mengambil data dari pelayan");
      }
      const data: FolderItem = await res.json();
      setRootFolder(data);

      // Auto expand root folder
      const initialExpanded: Record<string, boolean> = { root: true };
      
      // Auto expand subfolders if they exist
      if (data.folders) {
        data.folders.forEach((f) => {
          initialExpanded[f.id] = true;
        });
      }
      setExpandedIds(initialExpanded);

      // Scoping logic: if scopedUnitSlug is set, search and select that folder
      let selectedFolder: FolderItem = data;
      if (scopedUnitSlug && data.folders) {
        const matched = data.folders.find((f) =>
          f.name.toLowerCase().includes(scopedUnitSlug.toLowerCase())
        );
        if (matched) {
          selectedFolder = matched;
        }
      } else if (data.folders && data.folders.length > 0) {
        // Default to first subfolder
        selectedFolder = data.folders[0];
      }

      setActiveFolder(selectedFolder);
      
      // Set first file as active if exists
      if (selectedFolder.files && selectedFolder.files.length > 0) {
        setActiveFile(selectedFolder.files[0]);
      } else {
        setActiveFile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ralat tidak diketahui");
    } finally {
      setLoading(false);
    }
  }, [scopedUnitSlug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle folder expansion toggle
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Handle folder selection
  const handleSelectFolder = (folder: FolderItem) => {
    setActiveFolder(folder);
    if (folder.files && folder.files.length > 0) {
      setActiveFile(folder.files[0]);
    } else {
      setActiveFile(null);
    }
  };

  // Helper to flat map all files in a folder recursively (for search or category filter)
  const getAllFilesFromFolder = (folder: FolderItem): FileItem[] => {
    let list = [...folder.files];
    if (folder.folders) {
      folder.folders.forEach((sub) => {
        list = [...list, ...getAllFilesFromFolder(sub)];
      });
    }
    return list;
  };

  // Filter files based on search input
  const filteredFiles = useMemo(() => {
    if (!activeFolder) return [];
    
    // If search term is present, search all files in current folder and its subfolders
    const filesToSearch = search.trim() !== "" 
      ? getAllFilesFromFolder(activeFolder) 
      : activeFolder.files;

    return filesToSearch.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeFolder, search]);

  // Helper for quick categories dropdown
  const categoriesList = useMemo(() => {
    if (!rootFolder) return [];
    return rootFolder.folders || [];
  }, [rootFolder]);

  // Formatted date string helper
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("ms-MY", {
        day: "numeric",
        month: "2-digit",
        year: "numeric"
      });
    } catch {
      return "-";
    }
  };

  // Renders the preview frame URL
  const previewUrl = activeFile ? getDrivePreviewUrl(activeFile.url) : "";
  const isImg = activeFile ? isImageUrl(activeFile.url, activeFile.name) : false;

  return (
    <div className="w-full flex flex-col border border-border bg-card shadow-lg rounded-lg overflow-hidden min-h-[500px]">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-border bg-muted/30 px-5 py-4 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <FolderOpen className="size-4" />
          </div>
          <div>
            <h2 className="font-heading text-base font-semibold tracking-tight text-foreground uppercase">
              {title}
            </h2>
            <p className="text-[11px] text-muted-foreground font-sans">
              Google Drive Cloud File Integration
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              type="text"
              placeholder="Cari nama dokumen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-foreground text-muted-foreground/60 text-xs"
              >
                Reset
              </button>
            )}
          </div>

          {/* Quick Category Filter */}
          {categoriesList.length > 0 && (
            <select
              value={activeFolder?.id || ""}
              onChange={(e) => {
                const target = categoriesList.find((c) => c.id === e.target.value);
                if (target) handleSelectFolder(target);
              }}
              className="h-9 px-3 text-xs bg-background border border-input rounded-md max-w-[150px] focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="" disabled>Pilih Kategori</option>
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}

          {/* Refresh Action */}
          <Button
            variant="outline"
            size="icon"
            onClick={loadData}
            disabled={loading}
            className="size-9"
            title="Segarkan data"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          </Button>

          {/* Info Modal Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowInfo(!showInfo)}
            className={cn("size-9", showInfo && "bg-accent")}
            title="Informasi integrasi"
          >
            <Info className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="bg-blue-50/50 dark:bg-blue-950/20 px-5 py-4 border-b border-border text-xs leading-relaxed text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
          <Info className="size-4 shrink-0 text-blue-500 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Tentang Integrasi Google Drive & Apps Script</p>
            <p>
              Portal dokumen ini disambung secara telus ke awan (Google Drive) sekolah. Admin boleh memuat naik fail di dalam Google Drive dan ia akan terpapar secara langsung di sini tanpa had storan pelayan tempatan. Previu interaktif disediakan menggunakan penonton dokumen Google Docs.
            </p>
          </div>
          <button onClick={() => setShowInfo(false)} className="ml-auto text-muted-foreground hover:text-foreground">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* 2. Main Content Grid */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Mengambil struktur dokumen...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
          <AlertCircle className="size-10 text-destructive/80" />
          <div>
            <h3 className="font-semibold text-foreground text-base">Gagal memuat portal dokumen</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">{error}</p>
          </div>
          <Button onClick={loadData} variant="outline" size="sm" className="mt-2">
            Cuba Lagi
          </Button>
        </div>
      ) : !rootFolder ? (
        <div className="flex-1 flex items-center justify-center py-20 text-muted-foreground text-sm">
          Tiada folder dijumpai.
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border min-h-[500px]">
          {/* Lajur 1: KATEGORI / FOLDER TREE (col-span-3) */}
          <div className="col-span-1 md:col-span-3 bg-muted/5 py-4 px-3 overflow-y-auto max-h-[250px] md:max-h-[500px]">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
              <Folder className="size-3 text-amber-500" />
              Struktur Folder
            </h3>
            <div className="space-y-0.5">
              {/* Root Node */}
              <div
                className={cn(
                  "flex items-center gap-2 py-1.5 px-2 cursor-pointer hover:bg-accent/40 rounded transition-colors text-xs font-bold text-foreground",
                  activeFolder?.id === rootFolder.id && "bg-primary/10 text-primary"
                )}
                onClick={() => handleSelectFolder(rootFolder)}
              >
                <FolderOpen className="size-4 text-amber-500 shrink-0" />
                <span>{rootFolder.name}</span>
              </div>
              
              {/* Subfolders list recursively */}
              {rootFolder.folders?.map((folder) => (
                <FolderNode
                  key={folder.id}
                  folder={folder}
                  level={1}
                  selectedId={activeFolder?.id || ""}
                  expandedIds={expandedIds}
                  onSelect={handleSelectFolder}
                  onToggleExpand={toggleExpand}
                />
              ))}
            </div>
          </div>

          {/* Lajur 2: FILE TABLE (col-span-5) */}
          <div className="col-span-1 md:col-span-5 flex flex-col bg-background max-h-[500px]">
            <div className="border-b border-border/60 bg-muted/10 px-4 py-2.5 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
                <FolderOpen className="size-3.5 text-amber-500 shrink-0" />
                <span>{activeFolder?.name || "Semua Dokumen"}</span>
              </h3>
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                {filteredFiles.length} Fail
              </Badge>
            </div>

            <div className="flex-1 overflow-auto max-h-[350px] md:max-h-full">
              {filteredFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center px-4">
                  <FileText className="size-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs font-medium">Tiada dokumen tersedia</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                    {search ? "Tiada fail sepadan dengan carian." : "Tiada fail dimuat naik di folder ini."}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/20 sticky top-0 z-10 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Nama</th>
                      <th className="px-2 py-3 hidden sm:table-cell w-20">Jenis</th>
                      <th className="px-2 py-3 hidden sm:table-cell w-16">Saiz</th>
                      <th className="px-4 py-3 text-right w-24">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map((file) => {
                      const isSelected = activeFile?.id === file.id;
                      const fileMeta = getFileMeta(file.mimeType, file.name);

                      return (
                        <tr
                          key={file.id}
                          className={cn(
                            "border-b border-border/40 hover:bg-muted/30 transition-colors cursor-pointer last:border-b-0",
                            isSelected && "bg-primary/5 hover:bg-primary/5"
                          )}
                          onClick={() => setActiveFile(file)}
                        >
                          <td className="px-4 py-3 min-w-0">
                            <div className="flex items-start gap-2.5">
                              {fileMeta.icon}
                              <div className="min-w-0">
                                <p className={cn("font-medium line-clamp-2 leading-snug", isSelected && "text-primary font-semibold")}>
                                  {file.name}
                                </p>
                                <span className="text-[9px] text-muted-foreground/80 block sm:hidden mt-0.5">
                                  {fileMeta.badge} • {file.size} • {formatDate(file.dateCreated)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-3 hidden sm:table-cell">
                            <Badge variant="outline" className={cn("text-[9px] font-semibold py-0.5 px-1 border-opacity-30 rounded-sm uppercase", fileMeta.badgeColor)}>
                              {fileMeta.badge}
                            </Badge>
                          </td>
                          <td className="px-2 py-3 hidden sm:table-cell text-muted-foreground tabular-nums">
                            {file.size}
                          </td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Open Preview Panel */}
                              <Button
                                variant={isSelected ? "default" : "ghost"}
                                size="icon-sm"
                                onClick={() => setActiveFile(file)}
                                className="size-7 rounded-sm"
                                title="Lihat Previu"
                              >
                                <Eye className="size-3.5" />
                              </Button>

                              {/* External Open / Download Link */}
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                asChild
                                className="size-7 rounded-sm"
                                title="Muat Turun / Buka Baru"
                              >
                                <a
                                  href={file.downloadUrl || file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="size-3.5 text-muted-foreground hover:text-foreground" />
                                </a>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            {filteredFiles.length > 0 && (
              <div className="border-t border-border bg-muted/10 px-4 py-2 text-[10px] text-muted-foreground font-sans">
                Memaparkan {filteredFiles.length} daripada {activeFolder?.files?.length || 0} fail dalam folder ini
              </div>
            )}
          </div>

          {/* Lajur 3: PREVIEW PANEL (col-span-4) */}
          <div className="col-span-1 md:col-span-4 flex flex-col bg-muted/5 max-h-[500px]">
            {activeFile ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="border-b border-border px-4 py-2.5 bg-background flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Eye className="size-3.5 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-foreground truncate uppercase">
                      Previu Dokumen
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-6 text-muted-foreground hover:text-foreground"
                    onClick={() => setActiveFile(null)}
                    title="Tutup panel previu"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>

                <div className="p-3 bg-background border-b border-border shrink-0">
                  <p className="text-xs font-medium text-foreground line-clamp-2 leading-relaxed">
                    {activeFile.name}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-7 text-[10px] flex-1 font-sans rounded-none"
                    >
                      <a
                        href={activeFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-3 mr-1" />
                        Buka Google Drive
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Previu iframe or image */}
                <div className="flex-1 bg-muted/20 relative overflow-hidden flex items-center justify-center">
                  {isImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeFile.url}
                      alt={activeFile.name}
                      className="max-w-full max-h-full object-contain p-4 drop-shadow-sm select-none"
                    />
                  ) : (
                    <iframe
                      key={previewUrl}
                      src={previewUrl}
                      className="w-full h-full border-none bg-background shadow-inner"
                      allow="autoplay; encrypted-media"
                      title={activeFile.name}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted-foreground text-center px-4">
                <div className="size-12 rounded-full border border-dashed border-border/80 flex items-center justify-center bg-card mb-3">
                  <Eye className="size-5 text-muted-foreground/50" />
                </div>
                <p className="text-xs font-semibold">Tiada dokumen dipilih</p>
                <p className="text-[10px] text-muted-foreground/80 mt-1 max-w-[180px]">
                  Klik ikon previu (mata) pada mana-mana fail di lajur tengah untuk melihat dokumen di sini.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
