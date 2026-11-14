import type { PartState, Ship } from '@/lib/types';
import shipImg from '@/assets/media/ship.jpg';
export type PartId = 'windows' | 'thrusters' | 'solar' | 'hull' | 'comms';
const C: Record<PartState, string> = { nominal: 'hsl(172 58% 52%)', degradado: 'hsl(46 92% 62%)', falla: 'hsl(352 82% 60%)' };
const LABEL: Record<PartId, string> = { windows: 'Windows', thrusters: 'Thrusters', solar: 'Solar panels', hull: 'Hull', comms: 'Antenna' };
/** Hotspot anchors as % of the rendered image. Multiple anchors per part are allowed. */
const SPOTS: { p: PartId; x: number; y: number; label?: boolean }[] = [
  { p: 'solar', x: 18, y: 24, label: true }, { p: 'solar', x: 18, y: 74 },
  { p: 'thrusters', x: 29, y: 49, label: true },
  { p: 'hull', x: 48, y: 64, label: true },
  { p: 'windows', x: 64.5, y: 32, label: true }, { p: 'windows', x: 61.5, y: 50 },
  { p: 'comms', x: 81, y: 34, label: true },
];

export function ShipExterior({ ship, onPart, onEnter, active }: { ship: Ship; onPart: (p: PartId) => void; onEnter: () => void; active: PartId | null }) {
  const color = (p: PartId) => (active === p ? 'hsl(22 95% 62%)' : C[ship[p]]);
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-[hsl(226_50%_5%)]" role="group" aria-label="Illustrative spacecraft exterior with interactive parts">
      <img src={shipImg} alt="Illustrative rendering of a crewed capsule in orbit with solar arrays, windows and antenna" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      {ship.solar !== 'nominal' && <div className="pointer-events-none absolute left-[4%] top-[2%] h-[96%] w-[28%] bg-[hsl(226_50%_5%/.45)]" style={{ opacity: ship.solar === 'falla' ? 0.8 : 0.4 }} />}
      {ship.thrusters !== 'falla' && <div className="flame pointer-events-none absolute left-[20%] top-[46.5%] h-[6%] rounded-full bg-[radial-gradient(ellipse_at_right,hsl(30_100%_70%),hsl(22_95%_55%/.6)_45%,transparent_70%)]" style={{ width: ship.thrusters === 'degradado' ? '4%' : '8%', transformOrigin: 'right center' }} />}
      {ship.hull !== 'nominal' && <svg className="pointer-events-none absolute left-[44%] top-[54%] h-[16%] w-[8%]" viewBox="0 0 20 40" aria-hidden><path d="M10 0 l4 12 l-5 5 l6 12 l-3 11" stroke="hsl(352 70% 45%)" strokeWidth="1.6" fill="none" /></svg>}
      {SPOTS.map((s, i) => (
        <button key={i} type="button" onClick={() => onPart(s.p)} data-testid={s.label ? `part-${s.p}` : `part-${s.p}-${i}`} aria-label={`${LABEL[s.p]}: ${ship[s.p]}`}
          className="ship-hotspot group absolute z-10 grid h-9 w-9 place-items-center rounded-full outline-none" style={{ left: s.x + '%', top: s.y + '%', transform: 'translate(-50%,-50%)' }}>
          <span className="hotspot-ring absolute h-5 w-5 rounded-full" style={{ background: color(s.p), opacity: 0.4 }} />
          <span className="relative h-3.5 w-3.5 rounded-full border-2 border-[hsl(226_45%_7%)] group-focus-visible:ring-2 group-focus-visible:ring-foreground" style={{ background: color(s.p) }} />
          {s.label && <span className="absolute left-1/2 top-full mt-0.5 hidden -translate-x-1/2 whitespace-nowrap rounded bg-card/85 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-foreground backdrop-blur sm:block">{LABEL[s.p]}</span>}
        </button>
      ))}
      <button type="button" onClick={onEnter} data-testid="button-enter-ship" className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-xl bg-primary px-5 py-2 text-center text-primary-foreground shadow-lg shadow-black/50 transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-foreground">
        <span className="font-display block text-sm font-bold tracking-[0.15em]">ENTER</span><span className="block font-mono text-[9px]">view interior</span>
      </button>
      <span className="absolute left-3 top-3 rounded border border-chart-3/50 bg-[hsl(226_45%_7%/.7)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-chart-3">Illustrative spacecraft · not live telemetry</span>
    </div>
  );
}
