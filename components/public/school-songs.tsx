const LAGU_SEKOLAH = {
  title: "Lagu Sekolah",
  verses: [
    ["Warga SMKTPG", "Berikrar dan berjanji", "Tekun ilmu dicari", "Mencapai hasrat murni"],
    ["Warga SMKTPG", "Tekad usaha bersatu", "Murnikan azam kita", "Mencapai cita-cita"],
    ["c/o", "Mari teman semua", "Kita bersatu padu", "Untuk menjayakan cita yang direstu"],
    ["Jangan lupa nasihat", "Ibu bapa dan guru", "Untuk mencapai wawasan yang dituju"],
    ["Megah SMKTPG", "Maju jaya berbakti", "Ilmu amal diberi", "Kita harus syukuri", "Kita harus syukuri"],
  ],
  credits: [
    { role: "Komposer", name: "Abdul Rahim Hj Anuar" },
    { role: "Lirik", name: "Abd Malek Shaari" },
  ],
};

const LAGU_JOM_JADI_BEST = {
  title: "Lagu Jom Jadi Best",
  verses: [
    ["Jom jadi best, jom jadi best", "Pelajar TPG yang best"],
    ["Jom jom aku jadi BEST", "Jom jom kamu jadi BEST", "Jom jom jom kita BEST", "Jom jom jadi BEST"],
    ["Jom jom aku jadi BEST", "Jom jom kamu jadi BEST", "Jom jom jom kita BEST", "Jom jom jom jadi BEST"],
    ["B.E.S.T", "B.E.S.T", "B.E.S.T", "Jom jadi BEST"],
    ["Baik", "Efisien", "Syukur", "Terbilang"],
    ["Baik", "Efisien", "Syukur", "Terbilang"],
    ["Jom jom jadi BEST", "Jom jom jadi BEST", "SMKTPG jadi BEST"],
  ],
};

function SongCard({
  title,
  verses,
  credits,
}: {
  title: string;
  verses: string[][];
  credits?: { role: string; name: string }[];
}) {
  return (
    <article className="rounded-md border border-border/70 bg-card p-6 shadow-sm md:p-8">
      <h3 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">{title}</h3>
      <div className="mt-5 space-y-5 text-sm leading-relaxed text-muted-foreground md:text-base">
        {verses.map((lines, i) => (
          <div key={i} className="space-y-0.5">
            {lines.map((line, j) => (
              <p key={j}>{line}</p>
            ))}
          </div>
        ))}
      </div>
      {credits && credits.length > 0 && (
        <div className="mt-6 space-y-1 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          {credits.map((c) => (
            <p key={c.role}>
              <span className="font-medium text-foreground">{c.role}:</span> {c.name}
            </p>
          ))}
        </div>
      )}
    </article>
  );
}

export function SchoolSongs() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Lagu Sekolah</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Lirik lagu rasmi SMK Telok Panglima Garang dan lagu semangat pelajar.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <SongCard {...LAGU_SEKOLAH} />
        <SongCard {...LAGU_JOM_JADI_BEST} />
      </div>
    </section>
  );
}
