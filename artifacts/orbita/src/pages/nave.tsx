import { useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { DemoTag, PageHead } from '@/components/shell';
import { ShipExterior, type PartId } from '@/components/ship-exterior';
import { useStore } from '@/lib/store';
import { shipScore } from '@/lib/scores';
import type { PartState, Ship } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { usePageMeta } from '@/hooks/use-page-meta';

type NumKey = 'o2' | 'co2' | 'pressure' | 'temp' | 'gravity' | 'humidity' | 'radiation' | 'water' | 'energy';
const INPUTS: { k: NumKey; l: string; u: string; min: number; max: number; step: number; ok: [number, number] }[] = [
  { k: 'o2', l: 'Oxígeno', u: '%', min: 14, max: 26, step: 0.1, ok: [19.5, 23.5] },
  { k: 'co2', l: 'CO2', u: 'mmHg', min: 0, max: 10, step: 0.1, ok: [0, 4] },
  { k: 'pressure', l: 'Presión', u: 'kPa', min: 50, max: 110, step: 0.1, ok: [95, 105] },
  { k: 'temp', l: 'Temperatura', u: '°C', min: 10, max: 35, step: 0.1, ok: [18, 27] },
  { k: 'gravity', l: 'Gravedad', u: 'g', min: 0, max: 1, step: 0.01, ok: [0, 1] },
  { k: 'humidity', l: 'Humedad', u: '%', min: 5, max: 95, step: 1, ok: [25, 75] },
  { k: 'radiation', l: 'Radiación', u: 'mSv/d', min: 0, max: 10, step: 0.01, ok: [0, 1] },
  { k: 'water', l: 'Agua', u: '%', min: 0, max: 100, step: 1, ok: [30, 100] },
  { k: 'energy', l: 'Energía', u: '%', min: 0, max: 100, step: 1, ok: [30, 100] },
];
const PARTS: Record<PartId, { l: string; d: string }> = {
  windows: { l: 'Ventanas', d: 'Vidrio multicapa con protección contra micrometeoritos. La vista exterior es también un apoyo psicológico (efecto perspectiva).' },
  thrusters: { l: 'Propulsores', d: 'Control de actitud y maniobras orbitales. Un fallo limita correcciones de trayectoria.' },
  solar: { l: 'Paneles solares', d: 'Generan la energía de la nave. Menos energía obliga a apagar cargas no esenciales.' },
  hull: { l: 'Casco', d: 'Estructura presurizada y blindaje. Daños pueden causar fugas de presión.' },
  comms: { l: 'Comunicaciones', d: 'Enlace con control de misión. A Marte el retardo puede ser de hasta unos 20 minutos por trayecto.' },
};
const SYSTEMS: { id: string; l: string; keys: NumKey[]; d: string }[] = [
  { id: 'eclss', l: 'Soporte vital (ECLSS)', keys: ['o2', 'co2', 'pressure'], d: 'Genera oxígeno, retira CO2 y mantiene la presión. Cualquier ajuste requiere procedimiento autorizado.' },
  { id: 'termico', l: 'Control térmico', keys: ['temp', 'humidity'], d: 'Radiadores y ventilación mantienen la cabina habitable y evitan condensación.' },
  { id: 'agua', l: 'Recuperación de agua', keys: ['water'], d: 'En la ISS se recicla cerca del 98% del agua, incluida la orina y el sudor condensado.' },
  { id: 'energia', l: 'Energía', keys: ['energy'], d: 'Baterías y distribución eléctrica alimentadas por los paneles.' },
  { id: 'rad', l: 'Blindaje y radiación', keys: ['radiation'], d: 'Dosímetros vigilan la dosis; ante tormentas solares la tripulación se refugia en zonas blindadas.' },
  { id: 'grav', l: 'Gimnasio / gravedad', keys: ['gravity'], d: 'En microgravedad el ejercicio diario protege huesos y músculos.' },
];
const stColor = (ok: boolean) => (ok ? 'text-accent' : 'text-destructive');

export default function NavePage() {
  usePageMeta('Nave', 'Exterior interactivo y sistemas interiores de la nave simulada con entradas editables.');
  const { ship, setShip, resetShip } = useStore();
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
      <PageHead kicker={inside ? 'Interior · sistemas' : 'Exterior · espacio'} title={inside ? 'Dentro de la nave' : 'La nave'}>
        <div className="flex items-center gap-3"><DemoTag text="Telemetría simulada" /><div className="text-right"><div className="font-display text-3xl font-bold text-primary" data-testid="text-ship-score">{score}</div><div className="font-mono text-[10px] uppercase text-muted-foreground">estado ilustrativo</div></div></div>
      </PageHead>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          {!inside ? (
            <div className="panel rise overflow-hidden p-3">
              <div className="aspect-[640/300]"><ShipExterior ship={ship} active={part} onPart={setPart} onEnter={() => setInside(true)} /></div>
              <p className="pb-1 text-center font-mono text-[11px] text-muted-foreground">Toca ventanas, propulsores, paneles, casco o antena. Pulsa ENTRAR en el centro para ver el interior.</p>
            </div>
          ) : (
            <div className="panel rise p-4">
              <Button variant="ghost" size="sm" onClick={() => setInside(false)} data-testid="button-exit-ship"><ArrowLeft />Volver al exterior</Button>
              <svg viewBox="0 0 600 180" className="mt-2 w-full">
                <rect x="10" y="20" width="580" height="140" rx="70" fill="hsl(226 35% 14%)" stroke="hsl(224 30% 30%)" strokeWidth="2" />
                {SYSTEMS.map((x, i) => { const on = x.id === sys; const ok = x.keys.every((k) => { const d = INPUTS.find((n) => n.k === k)!; return ship[k] >= d.ok[0] && ship[k] <= d.ok[1]; }); return (
                  <g key={x.id} className="cursor-pointer" onClick={() => setSys(x.id)} data-testid={`module-${x.id}`}>
                    <rect x={60 + i * 82} y="45" width="72" height="90" rx="10" fill={on ? 'hsl(22 95% 58% / .2)' : 'hsl(224 34% 18%)'} stroke={on ? 'hsl(22 95% 58%)' : ok ? 'hsl(172 58% 48% / .6)' : 'hsl(352 82% 58%)'} strokeWidth="2" />
                    <circle cx={96 + i * 82} cy="70" r="5" fill={ok ? 'hsl(172 58% 52%)' : 'hsl(352 82% 60%)'} className={ok ? '' : 'hotspot-ring'} />
                    <text x={96 + i * 82} y="108" textAnchor="middle" fill="hsl(40 33% 91%)" fontSize="10" fontFamily="Chakra Petch">{x.l.split(' ')[0].toUpperCase()}</text>
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
                <div className="flex gap-1">{(['nominal', 'degradado', 'falla'] as PartState[]).map((st) => <button key={st} onClick={() => { upd(part, st); toast({ title: `${PARTS[part].l}: ${st}`, description: 'Simulación actualizada.' }); }} data-testid={`button-part-${part}-${st}`} className={`rounded-full border px-3 py-1 text-xs capitalize transition ${ship[part] === st ? (st === 'nominal' ? 'border-accent bg-accent/20' : st === 'degradado' ? 'border-chart-3 bg-chart-3/20' : 'border-destructive bg-destructive/20') : 'border-border text-muted-foreground'}`}>{st}</button>)}</div></div>
              <p className="mt-2 text-sm text-muted-foreground">{PARTS[part].d}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{(Object.keys(PARTS) as PartId[]).map((p) => <button key={p} onClick={() => { setInside(false); setPart(p); }} data-testid={`chip-part-${p}`} className="rounded-lg border border-border bg-card/60 p-2 text-left text-xs transition hover:border-primary/50"><div className="text-muted-foreground">{PARTS[p].l}</div><div className={`font-mono capitalize ${ship[p] === 'nominal' ? 'text-accent' : ship[p] === 'degradado' ? 'text-chart-3' : 'text-destructive'}`}>{ship[p]}</div></button>)}</div>
        </div>
        <aside className="panel rise space-y-4 p-5">
          <div className="flex items-center justify-between"><h2 className="font-display text-lg">Entradas de simulación</h2><Button size="sm" variant="ghost" onClick={() => { resetShip(); toast({ title: 'Nave restablecida a valores nominales' }); }} data-testid="button-reset-ship"><RotateCcw />Nominal</Button></div>
          <p className="text-xs text-muted-foreground">Edita valores para explorar escenarios. Esto no controla ninguna nave real.</p>
          {INPUTS.map((i) => (
            <div key={i.k} className="space-y-1.5">
              <div className="flex justify-between text-sm"><span>{i.l}</span><span className={`font-mono ${stColor(inRange(i))}`} data-testid={`value-${i.k}`}>{ship[i.k]} {i.u}</span></div>
              <Slider min={i.min} max={i.max} step={i.step} value={[ship[i.k]]} onValueChange={([v]) => upd(i.k, Math.round(v * 100) / 100)} data-testid={`slider-${i.k}`} />
            </div>
          ))}
        </aside>
      </div>
    </>
  );
}
