import { ScrollAnimation } from "@/components/ui/scroll-animation";
import type { JkTable } from "@/lib/units";

export function UnitJkSection({ jkTables }: { jkTables: JkTable[] }) {
  if (!jkTables.length) return null;

  return (
    <section>
      <ScrollAnimation direction="up" className="text-center">
        <span className="text-sm font-semibold tracking-wide text-primary uppercase">Jawatankuasa</span>
        <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Ahli Jawatankuasa Unit
        </h2>
      </ScrollAnimation>

      <div className="mt-10 space-y-8">
        {jkTables.map((jk) => (
          <ScrollAnimation key={jk.title} direction="up">
            <div className="border border-border/70 bg-card">
              <div className="border-b border-border/70 bg-muted/40 px-5 py-3">
                <h3 className="font-heading text-sm font-semibold">{jk.title}</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-5 py-2 text-left text-xs font-medium text-muted-foreground w-8">#</th>
                    <th className="px-5 py-2 text-left text-xs font-medium text-muted-foreground">Nama</th>
                    <th className="px-5 py-2 text-left text-xs font-medium text-muted-foreground">Jawatan</th>
                  </tr>
                </thead>
                <tbody>
                  {jk.members.map((m, i) => (
                    <tr key={m.name} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                      <td className="px-5 py-2.5 text-muted-foreground">{i + 1}</td>
                      <td className="px-5 py-2.5 font-medium">{m.name}</td>
                      <td className="px-5 py-2.5 text-muted-foreground">{m.jawatan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollAnimation>
        ))}
      </div>
    </section>
  );
}
