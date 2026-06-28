import Link from "next/link";
import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
      <EmptyState
        icon={FileSearch}
        title="Halaman tidak ditemukan"
        description="Halaman yang Anda cari mungkin sudah dipindahkan, diubah, atau tidak lagi tersedia."
        className="w-full"
        action={
          <Button asChild>
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        }
      />
    </div>
  );
}
