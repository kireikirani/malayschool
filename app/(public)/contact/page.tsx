import { Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CONTACT_ITEMS = [
  { icon: MapPin, label: "Alamat", value: "Jl. Pendidikan No. 1, Kota Anda" },
  { icon: Phone, label: "Telepon", value: "(021) 1234-5678" },
  { icon: Mail, label: "Email", value: "info@sekolahkita.sch.id" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-semibold">Kontak Kami</h1>
      <p className="text-muted-foreground">
        Silakan hubungi kami melalui informasi berikut untuk pertanyaan lebih lanjut.
      </p>

      <div className="space-y-4">
        {CONTACT_ITEMS.map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-4 py-4">
              <item.icon className="size-5 text-primary" />
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
