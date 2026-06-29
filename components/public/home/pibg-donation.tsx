import { QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { PIBG_ACCOUNT_NAME, PIBG_ACCOUNT_NUMBER, PIBG_BANK_NAME } from "@/lib/brand";

export function PibgDonation() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimation direction="up" className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-wide text-primary uppercase">Tabung PIBG & Sumbangan</span>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Sumbangan Anda Membina Masa Depan Mereka
          </h2>
          <p className="mt-4 text-muted-foreground">
            Sumbangan ihsan anda amat bermakna bagi melancarkan program pembangunan pendidikan, sahsiah, dan
            penyelenggaraan fasiliti demi keselesaan anak-anak kita menuntut ilmu. Sila tulis rujukan{" "}
            <span className="font-medium text-foreground">NAMA ANAK &amp; KELAS</span>.
          </p>
        </ScrollAnimation>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <ScrollAnimation direction="left">
            <Card>
              <CardContent className="space-y-4">
                <h3 className="font-heading text-lg font-semibold">Maklumat Pindahan Wang</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Nama Akaun</dt>
                    <dd>{PIBG_ACCOUNT_NAME}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Bank</dt>
                    <dd>{PIBG_BANK_NAME}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">No. Akaun</dt>
                    <dd>{PIBG_ACCOUNT_NUMBER}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </ScrollAnimation>

          <ScrollAnimation direction="right" delay={0.1}>
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 text-center">
                <span className="flex size-28 items-center justify-center border border-primary/15 bg-primary/8 text-primary">
                  <QrCode className="size-14" />
                </span>
                <h3 className="font-heading text-lg font-semibold">Imbas DuitNow QR untuk Menyumbang</h3>
                <p className="text-sm text-muted-foreground">Sumbangan Online</p>
              </CardContent>
            </Card>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
