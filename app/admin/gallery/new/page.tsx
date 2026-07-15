import { AlbumForm } from "../_components/album-form";
import { PageTour } from "@/components/admin/tour/page-tour";
import { galleryAlbumFormSteps } from "@/components/admin/tour/tour-steps";

export default function NewAlbumPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tambah Album</h1>
        <PageTour tourKey="gallery-album-form" steps={galleryAlbumFormSteps} />
      </div>
      <AlbumForm />
    </div>
  );
}
