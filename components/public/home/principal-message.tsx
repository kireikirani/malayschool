import Image from "next/image";
import { Quote } from "lucide-react";
import { SCHOOL_NAME } from "@/lib/brand";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

const DEFAULT_MESSAGE =
  "Kejayaan sebenar seorang pelajar bukan hanya diukur melalui keputusan peperiksaan, tetapi " +
  `melalui akhlak yang dibawanya sepanjang hayat. Di ${SCHOOL_NAME}, kami komited membentuk insan ` +
  "yang seimbang — cemerlang dalam ilmu, teguh dalam sahsiah.";

export function PrincipalMessage({
  name,
  position,
  photo,
  message,
}: {
  name: string;
  position?: string | null;
  photo?: string | null;
  message?: string | null;
}) {
  return (
    <section className="bg-primary py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 bg-card px-6 py-12 md:grid-cols-[0.8fr_1.2fr] md:px-12 md:py-16">
          <ScrollAnimation direction="left" className="mx-auto w-full max-w-[260px]">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
              {photo && <Image src={photo} alt={name} fill className="object-cover" />}
            </div>
          </ScrollAnimation>
          <ScrollAnimation direction="right" delay={0.1} className="space-y-5">
            <Quote className="size-8 text-primary" />
            <p className="font-heading text-xl leading-relaxed text-foreground md:text-2xl">&ldquo;{message || DEFAULT_MESSAGE}&rdquo;</p>
            <div>
              <p className="font-semibold text-foreground">{name}</p>
              <p className="text-sm text-muted-foreground">{position || "Pengetua"}, {SCHOOL_NAME}</p>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
