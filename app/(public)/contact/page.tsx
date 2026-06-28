import { Mail, MapPin, Phone, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/public/page-header";
import { SCHOOL_ADDRESS, SCHOOL_EMAIL, SCHOOL_FAX, SCHOOL_PHONE } from "@/lib/brand";

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

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 md:py-14">
        {CONTACT_ITEMS.map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-4 py-4">
              <span className="flex size-10 items-center justify-center border border-primary/15 bg-primary/8 text-primary">
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
    </div>
  );
}
