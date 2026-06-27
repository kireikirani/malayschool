import { DOWNLOAD_ICON_SVG, getExtension, getFileTypeInfo, isDocumentLink, isPdfLink, isSpreadsheetLink, isTextPreviewLink } from "@/lib/file-type";
import { parseTextPreviewFromUrl, parseXlsxFromUrl, type SheetTable } from "@/lib/xlsx-table";

const LINK_PATTERN = /<a\b[^>]*\shref="([^"]+)"[^>]*>(.*?)<\/a>/gi;

function renderFileChip(url: string, label: string): string {
  const { iconSvg, label: typeLabel, colorClass } = getFileTypeInfo(url);

  return `<a href="${url}" target="_blank" rel="noopener noreferrer" download class="not-prose my-3 flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/5 no-underline hover:ring-primary/30">
    <span class="flex size-12 shrink-0 items-center justify-center rounded-t-xl rounded-b-md ${colorClass}">${iconSvg}</span>
    <span class="min-w-0 flex-1">
      <span class="block truncate text-sm font-medium text-foreground">${label}</span>
      <span class="block text-xs text-muted-foreground">${typeLabel} &middot; Klik untuk muat turun</span>
    </span>
    <span class="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium">${DOWNLOAD_ICON_SVG}Muat Turun</span>
  </a>`;
}

function renderSheetTable(sheet: SheetTable): string {
  if (sheet.headers.length === 0) return "";
  const head = sheet.headers.map((h, i) => `<th class="h-10 px-3 text-left bg-secondary/60 font-medium whitespace-nowrap">${h || `Lajur ${i + 1}`}</th>`).join("");
  const body = sheet.rows
    .map((row) => `<tr class="border-b border-border">${row.map((cell) => `<td class="p-3 align-middle whitespace-nowrap">${cell}</td>`).join("")}</tr>`)
    .join("");
  return `<div class="not-prose my-3 overflow-x-auto rounded-2xl ring-1 ring-foreground/5">
    <table class="w-full text-sm"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
  </div>`;
}

async function renderSpreadsheetPreview(url: string): Promise<string> {
  try {
    const sheets = await parseXlsxFromUrl(url);
    return sheets.map(renderSheetTable).join("");
  } catch {
    return `<p class="not-prose my-3 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">Jadual tidak dapat dimuatkan untuk dipaparkan.</p>`;
  }
}

async function renderTextPreview(url: string): Promise<string> {
  try {
    const lines = await parseTextPreviewFromUrl(url);
    const escaped = lines
      .join("\n")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
    return `<pre class="not-prose my-3 overflow-x-auto border border-border bg-card p-4 text-xs leading-6 whitespace-pre-wrap text-foreground">${escaped}</pre>`;
  } catch {
    return `<p class="not-prose my-3 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">Teks tidak dapat dimuatkan untuk dipaparkan.</p>`;
  }
}

function renderPdfPreview(url: string): string {
  return `<div class="not-prose my-3 overflow-hidden border border-border bg-card"><iframe src="${url}" title="Pratinjau PDF" class="h-[480px] w-full"></iframe></div>`;
}

/**
 * Rewrites <a> tags in admin-authored TipTap HTML that point to documents
 * (pdf/xlsx/docx/etc.) into styled download chips, since plain text links
 * to file attachments render unreadably small in prose content. Spreadsheet
 * links additionally get their contents fetched and rendered as a real table.
 */
export async function enhanceContentLinks(html: string): Promise<string> {
  const matches = Array.from(html.matchAll(LINK_PATTERN));
  let result = html;

  for (const match of matches) {
    const [full, url, inner] = match;
    if (!isDocumentLink(url) && !isDocumentLink(getExtension(inner))) continue;

    const label = inner.replace(/<[^>]+>/g, "").trim() || url.split("/").pop() || url;
    let replacement = renderFileChip(url, label);
    if (isSpreadsheetLink(url)) {
      replacement += await renderSpreadsheetPreview(url);
    } else if (isTextPreviewLink(url)) {
      replacement += await renderTextPreview(url);
    } else if (isPdfLink(url)) {
      replacement += renderPdfPreview(url);
    }
    result = result.replace(full, replacement);
  }

  return result;
}
