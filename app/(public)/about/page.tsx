export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-semibold">Tentang Sekolah Kita</h1>
      <p className="leading-relaxed text-muted-foreground">
        Sekolah Kita adalah lembaga pendidikan yang berkomitmen mencetak generasi yang cerdas, berkarakter, dan
        siap menghadapi masa depan. Kami mengutamakan pendidikan berkualitas yang dipadukan dengan nilai-nilai
        kebangsaan dan keagamaan.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Visi</h2>
          <p className="text-sm text-muted-foreground">
            Menjadi sekolah unggulan yang menghasilkan lulusan berakhlak mulia, berprestasi, dan berdaya saing
            global.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Misi</h2>
          <p className="text-sm text-muted-foreground">
            Menyelenggarakan pendidikan yang berkualitas, menumbuhkan karakter positif, dan membekali siswa dengan
            keterampilan abad 21.
          </p>
        </div>
      </div>
    </div>
  );
}
