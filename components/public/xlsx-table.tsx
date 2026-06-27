import { DocumentPreview } from "@/components/public/document-preview";

export function XlsxTable({ url }: { url: string }) {
  return <DocumentPreview url={url} />;
}
