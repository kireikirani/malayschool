import { QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

export function PibgDonation({
  title,
  subtitle,
  body,
  accountName,
  bankName,
  accountNumber,
}: {
  title: string;
  subtitle?: string | null;
  body?: string | null;
  accountName: string;
  bankName: string;
  accountNumber: string;
}) {
  return (
    <section className="bg-primary text-primary-foreground py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimation direction="up" className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-wide text-primary-foreground/85 uppercase">Tabung PIBG & Sumbangan</span>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-primary-foreground md:text-4xl">{title}</h2>
          <p className="mt-4 text-primary-foreground/80">{subtitle ?? body ?? "Maklumat sumbangan PIBG akan dikemaskini oleh pihak sekolah."}</p>
          {body && subtitle ? <p className="mt-3 text-sm text-primary-foreground/70">{body}</p> : null}
        </ScrollAnimation>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <ScrollAnimation direction="left">
            <Card>
              <CardContent className="space-y-4">
                <h3 className="font-heading text-lg font-semibold">Maklumat Pindahan Wang</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Nama Akaun</dt>
                    <dd>{accountName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Bank</dt>
                    <dd>{bankName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">No. Akaun</dt>
                    <dd>{accountNumber}</dd>
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
