import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export function TeacherCard({
  id,
  name,
  position,
  photo,
}: {
  id: string;
  name: string;
  position?: string | null;
  photo?: string | null;
}) {
  return (
    <Link href={`/teachers/${id}`}>
      <Card className="h-full overflow-hidden border-border/70 bg-card text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_18px_36px_-28px_rgba(35,24,16,0.55)]">
        <div className="relative aspect-[3/4] border-b border-border/70 bg-muted">
          {photo && <Image src={photo} alt={name} fill className="object-cover" />}
        </div>
        <CardContent className="space-y-2 pt-5 pb-1">
          <h3 className="text-lg font-medium tracking-tight">{name}</h3>
          {position && <p className="text-sm text-muted-foreground">{position}</p>}
        </CardContent>
      </Card>
    </Link>
  );
}
