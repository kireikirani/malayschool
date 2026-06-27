import { SCHOOL_MISSION, SCHOOL_NAME, SCHOOL_VISION } from "@/lib/brand";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 md:py-14">
      <h1 className="text-3xl font-semibold">Tentang {SCHOOL_NAME}</h1>
      <p className="leading-relaxed text-muted-foreground">
        {SCHOOL_NAME} teguh komited dalam usaha melahirkan modal insan yang cemerlang dari aspek
        akademik, sahsiah terpuji, dan kokurikulum selaras dengan Falsafah Pendidikan Kebangsaan.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Visi</h2>
          <p className="text-sm text-muted-foreground">&ldquo;{SCHOOL_VISION}&rdquo;</p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Misi</h2>
          <p className="text-sm text-muted-foreground">&ldquo;{SCHOOL_MISSION}&rdquo;</p>
        </div>
      </div>
    </div>
  );
}
