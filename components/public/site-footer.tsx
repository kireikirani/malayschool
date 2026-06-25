import { AdSlot } from "@/components/public/ad-slot";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <AdSlot placement="footer" />
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Sekolah Kita. Seluruh hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}
