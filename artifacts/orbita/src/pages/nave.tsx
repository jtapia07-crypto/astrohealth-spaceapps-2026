import { useMemo, useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DemoTag, PageHead } from '@/components/shell';
import { ShipExterior, type PartId } from '@/components/ship-exterior';
import { useStore } from '@/lib/store';
import { shipScore } from '@/lib/scores';
import type { PartState, Ship } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { deriveAlerts } from '@/lib/alerts';
import { ActiveEvents, EventHistoryList } from '@/components/events/event-center';
import { usePageMeta } from '@/hooks/use-page-meta';

type NumKey = 'o2' | 'co2' | 'pressure' | 'temp' | 'gravity' | 'humidity' | 'radiation' | 'water' | 'energy';
const INPUTS: { k: NumKey; l: string; u: string; min: number; max: number; step: number; ok: [number, number] }[] = [
  { k: 'o2', l: 'Oxygen', u: '%', min: 14, max: 26, step: 0.1, ok: [19.5, 23.5] },
  { k: 'co2', l: 'CO2', u: 'mmHg', min: 0, max: 10, step: 0.1, ok: [0, 4] },
  { k: 'pressure', l: 'Pressure', u: 'kPa', min: 50, max: 110, step: 0.1, ok: [95, 105] },
  { k: 'temp', l: 'Temperature', u: '°C', min: 10, max: 35, step: 0.1, ok: [18, 27] },
  { k: 'gravity', l: 'Gravity', u: 'g', min: 0, max: 1, step: 0.01, ok: [0, 1] },
  { k: 'humidity', l: 'Humidity', u: '%', min: 5, max: 95, step: 1, ok: [25, 75] },
  { k: 'radiation', l: 'Radiation', u: 'mSv/d', min: 0, max: 10, step: 0.01, ok: [0, 1] },
  { k: 'water', l: 'Water', u: '%', min: 0, max: 100, step: 1, ok: [30, 100] },
  { k: 'energy', l: 'Power', u: '%', min: 0, max: 100, step: 1, ok: [30, 100] },
];
const PARTS: Record<PartId, { l: string; d: string }> = {
  windows: { l: 'Windows', d: 'Multi-layer glass with micrometeoroid protection. The outside view is also psychological support (the overview effect).' },
  thrusters: { l: 'Thrusters', d: 'Attitude control and orbital maneuvers. A failure limits trajectory corrections.' },
  solar: { l: 'Solar panels', d: 'Generate the ship power. Less power forces non-essential loads to be switched off.' },
  hull: { l: 'Hull', d: 'Pressurized structure and shielding. Damage can cause pressure leaks.' },
  comms: { l: 'Communications', d: 'Link with mission control. To Mars the delay can be up to about 20 minutes each way.' },
};
const SYSTEMS: { id: string; l: string; short: string; keys: NumKey[]; d: string }[] = [
  { id: 'eclss', l: 'Life support (ECLSS)', short: 'LIFE', keys: ['o2', 'co2', 'pressure'], d: 'Generates oxygen, removes CO2 and maintains pressure. Any adjustment requires an authorized procedure.' },
  { id: 'termico', l: 'Thermal control', short: 'THERMAL', keys: ['temp', 'humidity'], d: 'Radiators and ventilation keep the cabin habitable and prevent condensation.' },
  { id: 'agua', l: 'Water recovery', short: 'WATER', keys: ['water'], d: 'The ISS recycles about 98% of its water, including urine and condensed sweat.' },
  { id: 'energia', l: 'Power', short: 'POWER', keys: ['energy'], d: 'Batteries and electrical distribution fed by the panels.' },
  { id: 'rad', l: 'Shielding and radiation', short: 'SHIELD', keys: ['radiation'], d: 'Dosimeters track the dose; during solar storms the crew shelters in shielded areas.' },
  { id: 'grav', l: 'Gym / gravity', short: 'GYM', keys: ['gravity'], d: 'In microgravity, daily exercise protects bones and muscles.' },
];
const STATE_LABEL: Record<PartState, string> = { nominal: 'Nominal', degradado: 'Degraded', falla: 'Failed' };
const stColor = (ok: boolean) => (ok ? 'text-accent' : 'text-destructive');

export default function NavePage() {
  usePageMeta('Ship', 'Interactive exterior and interior systems of the simulated spacecraft with environmental readings.');
  const { ship, setShip, resetShip, myLogs, selected, eventRecords } = useStore();
  const [view, setView] = useState<'ship' | 'history'>('ship');
  const shipAlerts = useMemo(() => deriveAlerts(ship, myLogs[0], selected).filter((a) => a.source === 'nave'), [ship, myLogs, selected]);
  const shipRecords = eventRecords.filter((e) => e.source === 'nave');
  const { toast } = useToast();
  const [inside, setInside] = useState(false);
  const [part, setPart] = useState<PartId | null>('hull');
  const [sys, setSys] = useState('eclss');
  const score = shipScore(ship);
  const upd = (k: keyof Ship, v: number | PartState) => setShip({ ...ship, [k]: v });
  const inRange = (i: (typeof INPUTS)[number]) => ship[i.k] >= i.ok[0] && ship[i.k] <= i.ok[1];
  const s = SYSTEMS.find((x) => x.id === sys)!;
  return (
    <>
      <PageHead kicker={inside ? 'Interior · systems' : 'Exterior · space'} title={inside ? 'Inside the ship' : 'The ship'}>
        <div className="flex items-center gap-3"><DemoTag text="Simulated telemetry" /><div className="text-right"><div className="font-display text-3xl font-bold text-primary" data-testid="text-ship-score">{score}</div><div className="font-mono text-[10px] uppercase text-muted-foreground">illustrative status</div></div></div>
      </PageHead>
      <div role="tablist" aria-label="Ship view" className="mb-5 inline-flex gap-1 rounded-xl border border-border bg-card/70 p-1">{([['ship', 'Ship'], ['history', `Historical records (${shipRecords.length})`]] as const).map(([v, l]) => <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} data-testid={`tab-ship-${v}`} className={`rounded-lg px-4 py-2 text-sm transition ${view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{l}</button>)}</div>
      {view === 'history' ? <section aria-label="Ship historical records"><EventHistoryList records={shipRecords} testid="list-ship-history" emptyText="No resolved ship events yet. Resolved events are saved here with their note." /></section> : <>
      <section aria-label="Ship events" className="mb-5"><h2 className="font-display mb-2 text-lg">Ship events</h2><ActiveEvents alerts={shipAlerts} testid="list-ship-events" emptyText="No active ship events. Systems are within simulated ranges." /></section>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          {!inside ? (
            <div className="panel rise overflow-hidden p-3">
              <div className="aspect-[1000/762]"><ShipExterior ship={ship} active={part} onPart={setPart} onEnter={() => setInside(true)} /></div>
              <p className="pb-1 text-center font-mono text-[11px] text-muted-foreground">Tap windows, thrusters, panels, hull or antenna. Press ENTER to see the interior. Illustrative spacecraft, not a real vehicle.</p>
            </div>
          ) : (
            <div className="panel rise p-4">
              <Button variant="ghost" size="sm" onClick={() => setInside(false)} data-testid="button-exit-ship"><ArrowLeft />Back to exterior</Button>
              <svg viewBox="0 0 600 180" className="mt-2 w-full">
                <rect x="10" y="20" width="580" height="140" rx="70" fill="hsl(226 35% 14%)" stroke="hsl(224 30% 30%)" strokeWidth="2" />
                {SYSTEMS.map((x, i) => { const on = x.id === sys; const ok = x.keys.every((k) => { const d = INPUTS.find((n) => n.k === k)!; return ship[k] >= d.ok[0] && ship[k] <= d.ok[1]; }); return (
                  <g key={x.id} className="cursor-pointer" onClick={() => setSys(x.id)} data-testid={`module-${x.id}`}>
                    <rect x={60 + i * 82} y="45" width="72" height="90" rx="10" fill={on ? 'hsl(22 95% 58% / .2)' : 'hsl(224 34% 18%)'} stroke={on ? 'hsl(22 95% 58%)' : ok ? 'hsl(172 58% 48% / .6)' : 'hsl(352 82% 58%)'} strokeWidth="2" />
                    <circle cx={96 + i * 82} cy="70" r="5" fill={ok ? 'hsl(172 58% 52%)' : 'hsl(352 82% 60%)'} className={ok ? '' : 'hotspot-ring'} />
                    <text x={96 + i * 82} y="108" textAnchor="middle" fill="hsl(40 33% 91%)" fontSize="10" fontFamily="Chakra Petch">{x.short}</text>
                  </g>); })}
              </svg>
              <div className="mt-3 rounded-xl bg-secondary/60 p-4">
                <h3 className="font-display text-xl">{s.l}</h3><p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{s.keys.map((k) => { const d = INPUTS.find((n) => n.k === k)!; return <div key={k} className="rounded-lg border border-border p-3"><div className="font-mono text-[10px] uppercase text-muted-foreground">{d.l}</div><div className={`font-mono text-xl ${stColor(inRange(d))}`}>{ship[k]} <span className="text-xs">{d.u}</span></div><div className="font-mono text-[10px] text-muted-foreground">ref {d.ok[0]}-{d.ok[1]}</div></div>; })}</div>
              </div>
            </div>
          )}
          {!inside && part && (
            <div className="panel rise p-4" key={part}>
              <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-display text-xl">{PARTS[part].l}</h3>
                <div className="flex gap-1">{(['nominal', 'degradado', 'falla'] as PartState[]).map((st) => <button key={st} onClick={() => { upd(part, st); toast({ title: `${PARTS[part].l}: ${STATE_LABEL[st]}`, description: 'Simulation updated.' }); }} data-testid={`button-part-${part}-${st}`} aria-pressed={ship[part] === st} className={`rounded-full border px-3 py-1 text-xs transition ${ship[part] === st ? (st === 'nominal' ? 'border-accent bg-accent/20' : st === 'degradado' ? 'border-chart-3 bg-chart-3/20' : 'border-destructive bg-destructive/20') : 'border-border text-muted-foreground'}`}>{STATE_LABEL[st]}</button>)}</div></div>
              <p className="mt-2 text-sm text-muted-foreground">{PARTS[part].d}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{(Object.keys(PARTS) as PartId[]).map((p) => <button key={p} onClick={() => { setInside(false); setPart(p); }} data-testid={`chip-part-${p}`} className="rounded-lg border border-border bg-card/60 p-2 text-left text-xs transition hover:border-primary/50"><div className="text-muted-foreground">{PARTS[p].l}</div><div className={`font-mono capitalize ${ship[p] === 'nominal' ? 'text-accent' : ship[p] === 'degradado' ? 'text-chart-3' : 'text-destructive'}`}>{STATE_LABEL[ship[p]]}</div></button>)}</div>
        </div>
        <aside className="panel rise space-y-4 p-5">
          <div className="flex items-center justify-between gap-3"><h2 className="font-display text-lg" data-testid="environmental-parameters-heading">Environmental parameters · {inside ? 'Internal' : 'External'}</h2><Button size="sm" variant="ghost" onClick={() => { resetShip(); toast({ title: 'Ship reset to nominal values' }); }} data-testid="button-reset-ship"><RotateCcw />Nominal</Button></div>
          <p className="text-xs text-muted-foreground">Simulated readings. This does not monitor or control any real spacecraft.</p>
          {INPUTS.map((i) => (
            <div key={i.k} className="space-y-1.5">
              <div className="flex justify-between text-sm"><span>{i.l}</span><span className={`font-mono ${stColor(inRange(i))}`} data-testid={`value-${i.k}`}>{ship[i.k]} {i.u}</span></div>
            </div>
          ))}
        </aside>
      </div>
      </>}
    </>
  );
}
