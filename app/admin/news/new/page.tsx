import { NewsForm } from "../_components/news-form";

export default function NewNewsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tambah Berita</h1>
      <NewsForm />
    </div>
  );
}
