import { ScrollAnimation } from "@/components/ui/scroll-animation";

const FACILITIES = [
  { title: "Bilik Darjah", desc: "Dilengkapi papan putih interaktif & penghawa dingin" },
  { title: "Perpustakaan", desc: "Koleksi 8,000+ buku dan sudut bacaan digital" },
  { title: "Makmal Sains", desc: "3 makmal lengkap untuk Fizik, Kimia & Biologi" },
  { title: "Padang Sukan", desc: "Padang bola, gelanggang badminton & trek larian" },
  { title: "Kantin", desc: "Makanan halal bersih dengan menu berkhasiat harian" },
];

export function FacilitiesPreview() {
  return (
    <section className="border-b border-border/60 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimation direction="up" className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-wide text-primary uppercase">Kemudahan Sekolah</span>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Persekitaran Pembelajaran yang Selesa
          </h2>
        </ScrollAnimation>

        <div className="mt-12 flex gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5">
          {FACILITIES.map((facility, i) => (
            <ScrollAnimation key={facility.title} direction="up" delay={i * 0.08} className="w-56 shrink-0 sm:w-auto">
              <div
                className="aspect-square w-full bg-muted shadow-sm"
              />
              <div className="px-1 pt-4">
                <h3 className="font-heading text-sm font-semibold">{facility.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{facility.desc}</p>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}
