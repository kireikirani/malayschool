import { AlbumForm } from "../_components/album-form";

export default function NewAlbumPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tambah Album</h1>
      <AlbumForm />
    </div>
  );
}
