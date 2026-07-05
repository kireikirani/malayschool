import type { Metadata } from "next";
import { Mail, MapPin, Phone, Printer } from "lucide-react";

export const metadata: Metadata = {
  title: "Hubungi Kami",
  description: "Maklumat hubungan SMK Telok Panglima Garang — alamat, nombor telefon, faks, dan e-mel rasmi sekolah.",
};
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/public/page-header";
import { SCHOOL_ADDRESS, SCHOOL_EMAIL, SCHOOL_FAX, SCHOOL_MAPS_EMBED_URL, SCHOOL_PHONE } from "@/lib/brand";

const CONTACT_ITEMS = [
  { icon: MapPin, label: "Alamat", value: SCHOOL_ADDRESS },
  { icon: Phone, label: "Telefon", value: SCHOOL_PHONE },
  { icon: Printer, label: "Faks", value: SCHOOL_FAX },
  { icon: Mail, label: "Emel Rasmi", value: SCHOOL_EMAIL },
];

export default function ContactPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Hubungi Kami"
        title="Hubungi Kami"
        description="Sila hubungi kami melalui maklumat berikut untuk sebarang pertanyaan lanjut."
      />

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {CONTACT_ITEMS.map((item) => (
              <Card key={item.label}>
                <CardContent className="flex items-center gap-4 py-4">
                  <span className="flex size-10 shrink-0 items-center justify-center border border-primary/15 bg-primary/8 text-primary">
                    <item.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="overflow-hidden border border-border/70 bg-card shadow-[0_18px_40px_-34px_rgba(35,24,16,0.5)] h-full min-h-[350px]">
            <iframe
              src={SCHOOL_MAPS_EMBED_URL}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full min-h-[350px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

