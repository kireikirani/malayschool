import Link from "next/link";
import { AtSign, Camera, Mail, MapPin, Phone, Video } from "lucide-react";
import { AdSlot } from "@/components/public/ad-slot";
import { Separator } from "@/components/ui/separator";
import { SCHOOL_ADDRESS, SCHOOL_EMAIL, SCHOOL_NAME, SCHOOL_PHONE } from "@/lib/brand";

const QUICK_LINKS = [
  { href: "/about", label: "Tentang Sekolah" },
  { href: "/teachers", label: "Guru & Staf" },
  { href: "/news", label: "Berita & Pengumuman" },
  { href: "/gallery", label: "Galeri" },
  { href: "/admissions", label: "Permohonan Pendaftaran" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/80 bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <AdSlot placement="footer" />
      </div>
      <Separator className="bg-border" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 lg:col-span-2">
          <span className="font-heading text-lg font-semibold">{SCHOOL_NAME}</span>
          <p className="max-w-sm text-sm text-muted-foreground">
            Membentuk generasi yang cemerlang dalam akademik, mantap dalam akhlak, dan
            yakin dalam menghadapi masa depan — dibina atas kerjasama erat antara sekolah
            dan ibu bapa.
          </p>
          <div className="flex gap-3 pt-2">
            {[AtSign, Camera, Video].map((Icon, i) => (
              <Link
                key={i}
                href="#"
                className="flex size-9 items-center justify-center border border-border/70 bg-card transition-colors hover:border-gold/40 hover:bg-gold/20 hover:text-gold-foreground"
              >
                <Icon className="size-4" />
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-sm font-semibold tracking-wide text-primary uppercase">Pautan Pantas</span>
          <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-3">
          <span className="text-sm font-semibold tracking-wide text-primary uppercase">Hubungi Kami</span>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <MapPin className="size-4 shrink-0 translate-y-0.5" />
              <span>{SCHOOL_ADDRESS}</span>
            </li>
            <li className="flex gap-2">
              <Phone className="size-4 shrink-0" />
              <span>{SCHOOL_PHONE}</span>
            </li>
            <li className="flex gap-2">
              <Mail className="size-4 shrink-0" />
              <span>{SCHOOL_EMAIL}</span>
            </li>
          </ul>
        </div>
      </div>
      <Separator className="bg-border" />
      <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} {SCHOOL_NAME}. Seluruh hak cipta dilindungi.
      </p>
    </footer>
  );
}
