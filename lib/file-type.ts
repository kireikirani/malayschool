function svg(paths: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5">${paths}</svg>`;
}

const FILE_BODY = `<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/>`;

const ICON_FILE = svg(FILE_BODY);
const ICON_FILE_TEXT = svg(`${FILE_BODY}<path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>`);
const ICON_FILE_SPREADSHEET = svg(
  `${FILE_BODY}<path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>`,
);
const ICON_FILE_IMAGE = svg(
  `${FILE_BODY}<circle cx="10" cy="12" r="2"/><path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22"/>`,
);
const ICON_FILE_ARCHIVE = svg(
  `<path d="M13.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v11.5"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M8 12v-1"/><path d="M8 18v-2"/><path d="M8 7V6"/><circle cx="8" cy="20" r="2"/>`,
);

export const DOWNLOAD_ICON_SVG = svg(
  `<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>`,
).replace("size-5", "size-3.5");

export type FileTypeInfo = {
  ext: string;
  label: string;
  iconSvg: string;
  colorClass: string;
};

const FILE_TYPES: Record<string, Omit<FileTypeInfo, "ext">> = {
  pdf: { label: "PDF", iconSvg: ICON_FILE_TEXT, colorClass: "bg-red-500/10 text-red-600" },
  xlsx: { label: "Excel", iconSvg: ICON_FILE_SPREADSHEET, colorClass: "bg-emerald-500/10 text-emerald-600" },
  xls: { label: "Excel", iconSvg: ICON_FILE_SPREADSHEET, colorClass: "bg-emerald-500/10 text-emerald-600" },
  csv: { label: "CSV", iconSvg: ICON_FILE_SPREADSHEET, colorClass: "bg-emerald-500/10 text-emerald-600" },
  doc: { label: "Word", iconSvg: ICON_FILE_TEXT, colorClass: "bg-blue-500/10 text-blue-600" },
  docx: { label: "Word", iconSvg: ICON_FILE_TEXT, colorClass: "bg-blue-500/10 text-blue-600" },
  ppt: { label: "PowerPoint", iconSvg: ICON_FILE_TEXT, colorClass: "bg-orange-500/10 text-orange-600" },
  pptx: { label: "PowerPoint", iconSvg: ICON_FILE_TEXT, colorClass: "bg-orange-500/10 text-orange-600" },
  txt: { label: "Teks", iconSvg: ICON_FILE_TEXT, colorClass: "bg-muted text-muted-foreground" },
  zip: { label: "ZIP", iconSvg: ICON_FILE_ARCHIVE, colorClass: "bg-amber-500/10 text-amber-600" },
  rar: { label: "RAR", iconSvg: ICON_FILE_ARCHIVE, colorClass: "bg-amber-500/10 text-amber-600" },
  jpg: { label: "Imej", iconSvg: ICON_FILE_IMAGE, colorClass: "bg-violet-500/10 text-violet-600" },
  jpeg: { label: "Imej", iconSvg: ICON_FILE_IMAGE, colorClass: "bg-violet-500/10 text-violet-600" },
  png: { label: "Imej", iconSvg: ICON_FILE_IMAGE, colorClass: "bg-violet-500/10 text-violet-600" },
  webp: { label: "Imej", iconSvg: ICON_FILE_IMAGE, colorClass: "bg-violet-500/10 text-violet-600" },
};

const DOCUMENT_EXTENSIONS = Object.keys(FILE_TYPES);

export function getExtension(nameOrUrl: string): string {
  const clean = nameOrUrl.split(/[?#]/)[0];
  const match = /\.([a-zA-Z0-9]+)$/.exec(clean);
  return match ? match[1].toLowerCase() : "";
}

export function getFileTypeInfo(nameOrUrl: string): FileTypeInfo {
  const ext = getExtension(nameOrUrl);
  const known = FILE_TYPES[ext];
  if (known) return { ext, ...known };
  return { ext: ext || "file", label: ext ? ext.toUpperCase() : "Fail", iconSvg: ICON_FILE, colorClass: "bg-muted text-muted-foreground" };
}

export function isDocumentLink(nameOrUrl: string): boolean {
  return DOCUMENT_EXTENSIONS.includes(getExtension(nameOrUrl));
}

const SPREADSHEET_EXTENSIONS = ["xlsx", "xls", "csv"];

const TEXT_PREVIEW_EXTENSIONS = ["txt", "csv"];

export function isSpreadsheetLink(nameOrUrl: string): boolean {
  return SPREADSHEET_EXTENSIONS.includes(getExtension(nameOrUrl));
}

export function isTextPreviewLink(nameOrUrl: string): boolean {
  return TEXT_PREVIEW_EXTENSIONS.includes(getExtension(nameOrUrl));
}

export function isPdfLink(nameOrUrl: string): boolean {
  return getExtension(nameOrUrl) === "pdf";
}

export function isImageMimeType(fileType?: string | null): boolean {
  return typeof fileType === "string" && fileType.startsWith("image/");
}

export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}
