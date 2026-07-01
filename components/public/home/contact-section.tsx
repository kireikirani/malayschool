import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { SCHOOL_ADDRESS, SCHOOL_EMAIL, SCHOOL_MAPS_EMBED_URL, SCHOOL_PHONE, SCHOOL_WHATSAPP_URL } from "@/lib/brand";

export function ContactSection() {
  const CONTACT_ITEMS = [
    { icon: MapPin, label: "Alamat", value: SCHOOL_ADDRESS },
    { icon: Phone, label: "Telefon", value: SCHOOL_PHONE },
    { icon: Mail, label: "E-mel", value: SCHOOL_EMAIL },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimation direction="up" className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-wide text-primary uppercase">Hubungi Kami</span>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Kami Sedia Membantu Pertanyaan Anda
          </h2>
        </ScrollAnimation>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <ScrollAnimation direction="left">
            <Card>
              <CardContent className="space-y-6">
                {CONTACT_ITEMS.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center border border-primary/15 bg-primary/8 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
                      <p className="text-sm">{value}</p>
                    </div>
                  </div>
                ))}
                <Button asChild className="w-full bg-[#25D366] text-white hover:bg-[#25D366]/85">
                  <Link href={SCHOOL_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    <MessageCircle />
                    Hubungi via WhatsApp
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </ScrollAnimation>

          <ScrollAnimation direction="right" delay={0.1} className="h-full">
            <div className="overflow-hidden border border-border/70 shadow-[0_18px_40px_-34px_rgba(35,24,16,0.5)] h-full min-h-[300px]">
              <iframe
                src={SCHOOL_MAPS_EMBED_URL}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[300px]"
              />
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
