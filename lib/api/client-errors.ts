export type ApiErrorBody = {
  error?: {
    message?: string;
    fieldErrors?: Record<string, string[]>;
  };
};

const FIELD_LABELS: Record<string, string> = {
  pageKey: "Halaman",
  unitSlug: "Unit",
  sectionKey: "Section Key",
  type: "Jenis Seksyen",
  title: "Tajuk",
  subtitle: "Subtitle",
  body: "Body",
  imageUrl: "Gambar",
  linkLabel: "Label Pautan",
  linkUrl: "URL Pautan",
  isActive: "Aktif",
  sortOrder: "Urutan",
  items: "Item",
  label: "Label",
  value: "Value",
  url: "URL",
  fileUrl: "File URL",
};

function labelFor(path: string): string {
  const parts = path.split(".");
  return parts
    .map((part) => {
      if (/^\d+$/.test(part)) return `#${Number(part) + 1}`;
      return FIELD_LABELS[part] ?? part;
    })
    .join(" › ");
}

export class ApiValidationError extends Error {
  fieldErrors: Record<string, string[]>;
  constructor(message: string, fieldErrors: Record<string, string[]>) {
    super(message);
    this.name = "ApiValidationError";
    this.fieldErrors = fieldErrors;
  }
}

export async function throwApiError(res: Response, fallback = "Gagal menyimpan"): Promise<never> {
  const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
  const message = body?.error?.message ?? fallback;
  const fieldErrors = body?.error?.fieldErrors;

  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    throw new ApiValidationError(message, fieldErrors);
  }
  throw new Error(message);
}

export function formatFieldErrors(fieldErrors: Record<string, string[]>, limit = 5): string {
  const lines = Object.entries(fieldErrors).flatMap(([path, msgs]) =>
    msgs.map((m) => `• ${labelFor(path)}: ${m}`),
  );
  if (lines.length <= limit) return lines.join("\n");
  return [...lines.slice(0, limit), `• …dan ${lines.length - limit} lagi`].join("\n");
}
