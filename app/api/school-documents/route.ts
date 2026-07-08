import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { unitDocuments, media } from "@/db/schema";
import { getSettings } from "@/lib/site-settings";

// Helper to format bytes
function formatBytes(bytes: number | null | undefined): string {
  if (bytes === undefined || bytes === null) return "-";
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Helper to check file types based on URL extension
function getMimeTypeFromUrl(url: string): string {
  const ext = url.split(".").pop()?.split(/[?#]/)[0]?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "xlsx" || ext === "xls") return "application/vnd.ms-excel";
  if (ext === "docx" || ext === "doc") return "application/msword";
  return "application/octet-stream";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const forceLocal = searchParams.get("local") === "true";
    const settings = await getSettings();
    const gasUrl = settings.googleAppsScriptUrl;
    const driveFolderId = settings.googleDriveFolderId;

    // 1. If Google Apps Script is configured and we don't force local, try to fetch from it
    if (gasUrl && !forceLocal) {
      try {
        const fetchUrl = new URL(gasUrl);
        if (driveFolderId) {
          fetchUrl.searchParams.set("id", driveFolderId);
        }
        
        const response = await fetch(fetchUrl.toString(), {
          next: { revalidate: 60 }, // cache for 60 seconds
        });
        
        if (response.ok) {
          const json = await response.json();
          if (json.success && json.data) {
            return NextResponse.json(json.data);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data dari Google Apps Script, beralih ke mod tempatan:", err);
      }
    }

    // 2. Fallback: Build virtual folder tree from database
    // Fetch all visible unit documents
    const dbUnitDocs = await db
      .select()
      .from(unitDocuments)
      .where(eq(unitDocuments.isVisible, true));

    // Fetch all general school documents
    const dbGeneralDocs = await db
      .select()
      .from(media)
      .where(eq(media.folder, "documents"));

    // Define categories map
    const rootFolders: Record<string, { id: string; name: string; files: any[]; folders: any[] }> = {
      pentadbiran: { id: "f-pentadbiran", name: "01. PENTADBIRAN", files: [], folders: [] },
      kurikulum: { id: "f-kurikulum", name: "02. KURIKULUM", files: [], folders: [] },
      hem: { 
        id: "f-hem", 
        name: "03. HEM", 
        files: [], 
        folders: [
          { id: "f-hem-buku", name: "Buku / Manual", files: [], folders: [] },
          { id: "f-hem-borang", name: "Borang", files: [], folders: [] },
          { id: "f-hem-pekeliling", name: "Surat Pekeliling", files: [], folders: [] }
        ] 
      },
      kokurikulum: { id: "f-kokurikulum", name: "04. KOKURIKULUM", files: [], folders: [] },
      asrama: { id: "f-asrama", name: "05. ASRAMA", files: [], folders: [] },
      general: { id: "f-general", name: "Dokumen Am", files: [], folders: [] }
    };

    // Populate unit docs into folders
    dbUnitDocs.forEach((doc) => {
      const folderKey = doc.unitSlug;
      if (rootFolders[folderKey]) {
        const fileItem = {
          id: `u-${doc.id}`,
          name: doc.label,
          mimeType: doc.fileType === "pdf" ? "application/pdf" : doc.fileType === "image" ? "image/png" : "application/msword",
          size: "-", // size not stored directly for custom URLs
          dateCreated: doc.createdAt.toISOString(),
          url: doc.fileUrl,
          downloadUrl: doc.fileUrl
        };

        // For HEM, do smart classification into subfolders
        if (folderKey === "hem") {
          const lowerLabel = doc.label.toLowerCase();
          if (lowerLabel.includes("buku") || lowerLabel.includes("manual") || lowerLabel.includes("panduan")) {
            rootFolders.hem.folders[0].files.push(fileItem);
          } else if (lowerLabel.includes("borang") || lowerLabel.includes("cuti") || lowerLabel.includes("mohon")) {
            rootFolders.hem.folders[1].files.push(fileItem);
          } else if (lowerLabel.includes("surat") || lowerLabel.includes("pekeliling") || lowerLabel.includes("makluman")) {
            rootFolders.hem.folders[2].files.push(fileItem);
          } else {
            rootFolders.hem.files.push(fileItem);
          }
        } else {
          rootFolders[folderKey].files.push(fileItem);
        }
      }
    });

    // Populate general docs
    dbGeneralDocs.forEach((doc) => {
      rootFolders.general.files.push({
        id: `m-${doc.id}`,
        name: doc.fileName,
        mimeType: getMimeTypeFromUrl(doc.filePath),
        size: formatBytes(doc.fileSize),
        dateCreated: doc.uploadedAt?.toISOString() || new Date().toISOString(),
        url: doc.filePath,
        downloadUrl: doc.filePath
      });
    });

    // Construct the final tree
    const foldersList = Object.values(rootFolders).filter(f => f.files.length > 0 || f.folders.length > 0 || f.id !== "f-general");

    const virtualRoot = {
      id: "root",
      name: "DOKUMEN SEKOLAH",
      files: [],
      folders: foldersList
    };

    return NextResponse.json(virtualRoot);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ralat tidak diketahui" },
      { status: 500 }
    );
  }
}
