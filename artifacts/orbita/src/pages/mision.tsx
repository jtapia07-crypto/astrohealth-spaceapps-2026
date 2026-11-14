import { ExternalLink, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DemoTag, PageHead } from '@/components/shell';
import { useStore } from '@/lib/store';
import { shiftISO } from '@/lib/defaults';
import type { Destination, Mission } from '@/lib/types';
import { MISSION_FACTS, NASA_REFERENCES } from '@/data/nasa';
import { useToast } from '@/hooks/use-toast';
import { usePageMeta } from '@/hooks/use-page-meta';

const DEST: { id: Destination; color: string }[] = [{ id: 'iss', color: 'hsl(195 70% 55%)' }, { id: 'moon', color: 'hsl(40 15% 80%)' }, { id: 'mars', color: 'hsl(14 75% 52%)' }];

export default function MisionPage() {
  usePageMeta('Misión', 'Destino y ajustes de la misión simulada con referencias educativas de la NASA.');
  const { mission, setMission } = useStore();
  const { toast } = useToast();
  const [f, setF] = useState<Mission>(mission);
  useEffect(() => setF(mission), [mission]);
  const facts = MISSION_FACTS[f.destination];
  return (
    <>
      <PageHead kicker="Plan de vuelo" title="Misión"><DemoTag text="Misión de demostración" /></PageHead>
      <div className="grid gap-3 sm:grid-cols-3">{DEST.map((d) => { const m = MISSION_FACTS[d.id]; const on = f.destination === d.id; return (
        <button key={d.id} onClick={() => setF({ ...f, destination: d.id })} data-testid={`button-dest-${d.id}`} className={`panel rise group p-5 text-left transition hover:-translate-y-1 ${on ? 'ring-2 ring-primary' : ''}`}>
          <svg viewBox="0 0 80 80" className="mb-3 h-16 w-16"><circle cx="40" cy="40" r="26" fill={d.color} />{d.id === 'iss' && <ellipse cx="40" cy="40" rx="38" ry="9" fill="none" stroke="hsl(22 95% 58%)" strokeWidth="1.5" />}{d.id === 'moon' && <><circle cx="32" cy="34" r="5" fill="hsl(40 10% 65%)" /><circle cx="50" cy="50" r="4" fill="hsl(40 10% 65%)" /></>}{d.id === 'mars' && <path d="M20 44 q20 -8 40 2" stroke="hsl(14 60% 38%)" strokeWidth="4" fill="none" />}</svg>
          <div className="font-display text-xl">{m.name}</div><div className={`font-mono text-[11px] uppercase ${d.id === 'mars' ? 'text-chart-3' : 'text-muted-foreground'}`}>{m.kind}</div>
        </button>); })}</div>
      {f.destination === 'mars' && <p className="mt-3 rounded-xl border border-chart-3/50 bg-chart-3/10 p-3 text-sm text-chart-3" data-testid="text-mars-note">Escenario hipotético: ningún ser humano ha viajado a Marte. Los datos describen un concepto de misión futura.</p>}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <section className="panel rise p-5">
          <h2 className="font-display mb-3 text-xl">Datos del destino</h2>
          <dl className="grid grid-cols-2 gap-3">{([['Distancia', facts.distance], ['Gravedad', facts.gravity], ['Duración típica', facts.duration]] as const).map(([k, v]) => <div key={k} className="rounded-lg bg-secondary/70 p-3"><dt className="font-mono text-[10px] uppercase text-muted-foreground">{k}</dt><dd className="mt-1 text-sm">{v}</dd></div>)}</dl>
          <p className="mt-3 text-sm text-muted-foreground">{facts.note}</p>
        </section>
        <section className="panel rise space-y-3 p-5">
          <h2 className="font-display text-xl">Ajustes de misión</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="font-mono text-[11px] uppercase text-muted-foreground">Indicativo</Label><Input value={f.callsign} onChange={(e) => setF({ ...f, callsign: e.target.value })} data-testid="input-callsign" className="bg-background/60" /></div>
            <div className="space-y-1.5"><Label className="font-mono text-[11px] uppercase text-muted-foreground">Fecha de inicio</Label><Input type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} data-testid="input-start" className="bg-background/60" /></div>
            <div className="space-y-1.5"><Label className="font-mono text-[11px] uppercase text-muted-foreground">Duración (días)</Label><Input type="number" min={1} value={f.durationDays} onChange={(e) => setF({ ...f, durationDays: Math.max(1, Number(e.target.value)) })} data-testid="input-duration" className="bg-background/60" /></div>
            <div className="space-y-1.5"><Label className="font-mono text-[11px] uppercase text-muted-foreground">Tripulantes</Label><Input type="number" min={1} max={12} value={f.crewCount} onChange={(e) => setF({ ...f, crewCount: Math.max(1, Number(e.target.value)) })} data-testid="input-crew" className="bg-background/60" /></div>
          </div>
          <p className="font-mono text-xs text-muted-foreground">Regreso estimado: {f.startDate ? shiftISO(f.startDate, f.durationDays) : '-'}</p>
          <Button className="w-full" onClick={() => { setMission(f); toast({ title: 'Misión actualizada', description: `${MISSION_FACTS[f.destination].name} · ${f.durationDays} días · ${f.crewCount} tripulantes` }); }} data-testid="button-save-mission"><Save />Guardar misión</Button>
        </section>
      </div>
      <section className="panel rise mt-5 p-5">
        <h2 className="font-display text-xl">Fuentes NASA</h2>
        <p className="mb-3 text-xs text-muted-foreground">Contenido educativo. Consulta las fuentes originales.</p>
        <ul className="grid gap-3 md:grid-cols-2">{NASA_REFERENCES.map((r, i) => <li key={r.url}><a href={r.url} target="_blank" rel="noreferrer" data-testid={`link-source-${i}`} className="group block rounded-lg border border-border p-4 transition hover:border-primary/60"><div className="flex items-start justify-between gap-2 font-semibold">{r.title}<ExternalLink className="h-4 w-4 shrink-0 text-primary" /></div><p className="mt-1 text-sm text-muted-foreground">{r.summary}</p><p className="mt-1 truncate font-mono text-[10px] text-primary">{r.url}</p></a></li>)}</ul>
      </section>
    </>
  );
}
