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
      <Card className="h-full overflow-hidden text-center transition-colors hover:bg-muted/50">
        <div className="relative aspect-square bg-muted">
          {photo && <Image src={photo} alt={name} fill className="object-cover" />}
        </div>
        <CardContent className="space-y-1 pt-4">
          <h3 className="font-medium">{name}</h3>
          {position && <p className="text-sm text-muted-foreground">{position}</p>}
        </CardContent>
      </Card>
    </Link>
  );
}
