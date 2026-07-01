import { ContentSectionForm } from "@/components/admin/content-section-form";

export default function NewPublicContentPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Tambah Public Content</h1>
        <p className="text-sm text-muted-foreground">Tambah seksyen baharu untuk homepage, about, asrama, atau borang.</p>
      </div>
      <ContentSectionForm
        mode="public"
        action="create"
        redirectTo="/admin/content"
        pageOptions={["home", "about", "asrama", "borang"]}
      />
    </div>
  );
}
