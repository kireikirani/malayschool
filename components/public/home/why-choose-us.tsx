import { BookOpenCheck, HeartHandshake, MessageCircle, Shield, Sparkles, Users2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

const REASONS = [
  {
    icon: BookOpenCheck,
    title: "Kecemerlangan Akademik",
    desc: "Kurikulum KSSM yang disokong bimbingan tambahan dan rekod keputusan SPM yang konsisten cemerlang.",
  },
  {
    icon: Sparkles,
    title: "Pembinaan Sahsiah Unggul",
    desc: "Nilai murni dan disiplin diterapkan dalam setiap aktiviti harian, bukan sekadar dalam kelas.",
  },
  {
    icon: Users2,
    title: "Guru Berpengalaman",
    desc: "Tenaga pengajar bertauliah dengan purata 10 tahun pengalaman mengajar di peringkat menengah.",
  },
  {
    icon: Shield,
    title: "Persekitaran Selamat",
    desc: "Kawalan keselamatan 24 jam, CCTV menyeluruh, dan sistem daftar masuk pelawat yang ketat.",
  },
  {
    icon: HeartHandshake,
    title: "Kemudahan Lengkap",
    desc: "Makmal sains, perpustakaan digital, padang sukan dan dewan serbaguna yang sentiasa diselenggara.",
  },
  {
    icon: MessageCircle,
    title: "Komunikasi Ibu Bapa",
    desc: "Laporan prestasi dan pengumuman dihantar terus melalui portal dan WhatsApp rasmi sekolah.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-primary text-primary-foreground py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimation direction="up" className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-wide text-primary-foreground/80 uppercase">Mengapa Pilih Kami</span>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-primary-foreground md:text-4xl">
            Pendidikan yang Seimbang Antara Ilmu dan Akhlak
          </h2>
        </ScrollAnimation>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map(({ icon: Icon, title, desc }, i) => (
            <ScrollAnimation key={title} direction="up" delay={(i % 3) * 0.08} className="h-full">
              <Card className="h-full border-primary-foreground/15 bg-primary-foreground/5 text-primary-foreground">
                <CardContent className="flex h-full flex-col space-y-3">
                  <Icon className="size-7 text-gold" />
                  <h3 className="font-heading text-lg font-semibold text-primary-foreground">{title}</h3>
                  <p className="text-sm text-primary-foreground/75">{desc}</p>
                </CardContent>
              </Card>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}
