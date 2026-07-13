export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  dateCreated: string;
  url: string;
  downloadUrl?: string;
};

export type DriveFolder = {
  id: string;
  name: string;
  files: DriveFile[];
  folders: DriveFolder[];
};

type Entry =
  | { kind: "file"; id: string; name: string; url: string; date: string; iconType: string }
  | { kind: "folder"; id: string; name: string; url: string; date: string };

const ENTRY_START_RE = /<div class="flip-entry"\s+id="entry-([A-Za-z0-9_-]+)"[^>]*>/g;

function inferMime(iconType: string, name: string): string {
  const lower = name.toLowerCase();
  if (iconType.includes("pdf") || lower.endsWith(".pdf")) return "application/pdf";
  if (iconType.includes("spreadsheet") || lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".csv"))
    return "application/vnd.ms-excel";
  if (iconType.includes("wordprocessing") || iconType.includes("document") || lower.endsWith(".docx") || lower.endsWith(".doc"))
    return "application/msword";
  if (iconType.includes("presentation") || lower.endsWith(".pptx") || lower.endsWith(".ppt"))
    return "application/vnd.ms-powerpoint";
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/.test(lower) || iconType.includes("image")) return "image/png";
  return "application/octet-stream";
}

function parseEntries(html: string): Entry[] {
  const entries: Entry[] = [];
  const starts: { id: string; index: number }[] = [];
  ENTRY_START_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ENTRY_START_RE.exec(html)) !== null) {
    starts.push({ id: m[1], index: m.index });
  }

  for (let i = 0; i < starts.length; i++) {
    const start = starts[i].index;
    const end = i + 1 < starts.length ? starts[i + 1].index : html.length;
    const chunk = html.slice(start, end);
    const id = starts[i].id;

    const titleMatch = chunk.match(/<div class="flip-entry-title">([\s\S]*?)<\/div>/);
    const name = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";

    const hrefMatch = chunk.match(/<a href="([^"]+)"/);
    const href = hrefMatch ? hrefMatch[1] : "";

    const dateMatch = chunk.match(/<div class="flip-entry-last-modified"><div>([^<]*)<\/div>/);
    const date = dateMatch ? dateMatch[1].trim() : "";

    if (href.includes("/drive/folders/")) {
      entries.push({ kind: "folder", id, name, url: href, date });
    } else if (href.includes("/file/d/")) {
      const iconMatch = chunk.match(/drive-thirdparty\.googleusercontent\.com\/16\/type\/([^"?]+)/);
      const iconType = iconMatch ? decodeURIComponent(iconMatch[1]) : "";
      entries.push({ kind: "file", id, name, url: href, date, iconType });
    }
  }
  return entries;
}

function parseTitle(html: string): string {
  const m = html.match(/<title>([^<]*)<\/title>/);
  return m ? m[1].trim() : "";
}

function toIso(date: string): string {
  if (!date) return new Date().toISOString();
  const parts = date.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!parts) return new Date().toISOString();
  const mm = parseInt(parts[1], 10);
  const dd = parseInt(parts[2], 10);
  let yyyy = parseInt(parts[3], 10);
  if (yyyy < 100) yyyy += 2000;
  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

async function fetchFolderHtml(folderId: string): Promise<string> {
  const url = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Drive fetch failed (${res.status})`);
  return await res.text();
}

export async function fetchDriveFolder(
  folderId: string,
  depth = 2,
): Promise<DriveFolder> {
  const html = await fetchFolderHtml(folderId);
  const title = parseTitle(html) || "Google Drive";
  const entries = parseEntries(html);

  const files: DriveFile[] = [];
  const subfolderEntries: Entry[] = [];
  for (const e of entries) {
    if (e.kind === "file") {
      files.push({
        id: e.id,
        name: e.name,
        mimeType: inferMime(e.iconType, e.name),
        size: "-",
        dateCreated: toIso(e.date),
        url: e.url,
        downloadUrl: `https://drive.google.com/uc?export=download&id=${e.id}`,
      });
    } else {
      subfolderEntries.push(e);
    }
  }

  const subfolders: DriveFolder[] =
    depth > 0
      ? await Promise.all(
          subfolderEntries.map(async (e) => {
            try {
              return await fetchDriveFolder(e.id, depth - 1);
            } catch {
              return { id: e.id, name: e.name, files: [], folders: [] };
            }
          }),
        )
      : subfolderEntries.map((e) => ({ id: e.id, name: e.name, files: [], folders: [] }));

  return {
    id: folderId,
    name: title,
    files,
    folders: subfolders,
  };
}
