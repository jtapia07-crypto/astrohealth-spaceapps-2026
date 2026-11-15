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
import earthIssImage from '@/assets/destinations/iss.webp';
import moonImage from '@/assets/destinations/moon.webp';
import marsImage from '@/assets/destinations/mars.webp';

const DEST: { id: Destination; image: string; alt: string }[] = [
  { id: 'iss', image: earthIssImage, alt: 'The International Space Station above Earth’s blue horizon, photographed by the STS-130 crew' },
  { id: 'moon', image: moonImage, alt: 'The full Moon with its gray lunar maria and detailed impact craters' },
  { id: 'mars', image: marsImage, alt: 'Hubble true-color view of Mars with rust-colored terrain, dark surface markings and a bright polar cap' },
];

export default function MisionPage() {
  usePageMeta('Mission', 'Destination and settings of the simulated mission with educational NASA references.');
  const { mission, setMission } = useStore();
  const { toast } = useToast();
  const [f, setF] = useState<Mission>(mission);
  useEffect(() => setF(mission), [mission]);
  const facts = MISSION_FACTS[f.destination];
  return (
    <>
      <PageHead kicker="Flight plan" title="Mission"><DemoTag text="Demo mission" /></PageHead>
      <div className="grid gap-3 sm:grid-cols-3">{DEST.map((d) => { const m = MISSION_FACTS[d.id]; const on = f.destination === d.id; return (
        <button key={d.id} onClick={() => setF({ ...f, destination: d.id })} data-testid={`button-dest-${d.id}`} aria-pressed={on} className={`panel rise group p-5 text-left transition hover:-translate-y-1 ${on ? 'ring-2 ring-primary' : ''}`}>
          <img src={d.image} alt={d.alt} width={160} height={112} draggable={false} className={`mb-3 h-28 w-40 rounded-lg transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none ${d.id === 'iss' ? 'object-cover' : 'object-contain object-left mix-blend-screen'}`} />
          <div className="font-display text-xl">{m.name}</div><div className={`font-mono text-[11px] uppercase ${d.id === 'mars' ? 'text-chart-3' : 'text-muted-foreground'}`}>{m.kind}</div>
        </button>); })}</div>
      <p className="mt-2 font-mono text-[10px] text-muted-foreground">Destination imagery: NASA · NASA/ESA/STScI (Mars).</p>
      {f.destination === 'mars' && <p className="mt-3 rounded-xl border border-chart-3/50 bg-chart-3/10 p-3 text-sm text-chart-3" data-testid="text-mars-note">Hypothetical scenario: no human has traveled to Mars. The data describes a future mission concept.</p>}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <section className="panel rise p-5">
          <h2 className="font-display mb-3 text-xl">Destination data</h2>
          <dl className="grid grid-cols-2 gap-3">{([['Distance', facts.distance], ['Gravity', facts.gravity], ['Typical duration', facts.duration]] as const).map(([k, v]) => <div key={k} className="rounded-lg bg-secondary/70 p-3"><dt className="font-mono text-[10px] uppercase text-muted-foreground">{k}</dt><dd className="mt-1 text-sm">{v}</dd></div>)}</dl>
          <p className="mt-3 text-sm text-muted-foreground">{facts.note}</p>
        </section>
        <section className="panel rise space-y-3 p-5">
          <h2 className="font-display text-xl">Mission settings</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="font-mono text-[11px] uppercase text-muted-foreground">Callsign</Label><Input value={f.callsign} onChange={(e) => setF({ ...f, callsign: e.target.value })} data-testid="input-callsign" className="bg-background/60" /></div>
            <div className="space-y-1.5"><Label className="font-mono text-[11px] uppercase text-muted-foreground">Start date</Label><Input type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} data-testid="input-start" className="bg-background/60" /></div>
            <div className="space-y-1.5"><Label className="font-mono text-[11px] uppercase text-muted-foreground">Duration (days)</Label><Input type="number" min={1} value={f.durationDays} onChange={(e) => setF({ ...f, durationDays: Math.max(1, Number(e.target.value)) })} data-testid="input-duration" className="bg-background/60" /></div>
            <div className="space-y-1.5"><Label className="font-mono text-[11px] uppercase text-muted-foreground">Crew members</Label><Input type="number" min={1} max={12} value={f.crewCount} onChange={(e) => setF({ ...f, crewCount: Math.max(1, Number(e.target.value)) })} data-testid="input-crew" className="bg-background/60" /></div>
          </div>
          <p className="font-mono text-xs text-muted-foreground">Estimated return: {f.startDate ? shiftISO(f.startDate, f.durationDays) : '-'}</p>
          <Button className="w-full" onClick={() => { setMission(f); toast({ title: 'Mission updated', description: `${MISSION_FACTS[f.destination].name} · ${f.durationDays} days · ${f.crewCount} crew` }); }} data-testid="button-save-mission"><Save />Save mission</Button>
        </section>
      </div>
      <section className="panel rise mt-5 p-5">
        <h2 className="font-display text-xl">NASA and partners sources</h2>
        <p className="mb-3 text-xs text-muted-foreground">Educational content. Check the original sources.</p>
        <ul className="grid gap-3 md:grid-cols-2">{NASA_REFERENCES.map((r, i) => <li key={r.url}><a href={r.url} target="_blank" rel="noreferrer" data-testid={`link-source-${i}`} className="group block rounded-lg border border-border p-4 transition hover:border-primary/60"><div className="flex items-start justify-between gap-2 font-semibold">{r.title}<ExternalLink className="h-4 w-4 shrink-0 text-primary" /></div><p className="mt-1 text-sm text-muted-foreground">{r.summary}</p><p className="mt-1 truncate font-mono text-[10px] text-primary">{r.url}</p></a></li>)}</ul>
      </section>
    </>
  );
}
