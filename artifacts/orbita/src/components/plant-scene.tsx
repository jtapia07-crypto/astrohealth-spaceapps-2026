import { useId } from 'react';
import type { ReactNode } from 'react';
import type { Climate, PlantType } from '@/lib/types';
import type { Weather } from '@/lib/scores';

const SKY: Record<Weather, [string, string, string]> = {
  soleado: ['hsl(204 58% 58%)', 'hsl(196 45% 74%)', 'hsl(38 70% 86%)'],
  nublado: ['hsl(214 18% 44%)', 'hsl(212 15% 60%)', 'hsl(210 14% 74%)'],
  tormenta: ['hsl(232 32% 13%)', 'hsl(236 22% 22%)', 'hsl(228 18% 34%)'],
};
const PLANT_EN: Record<PlantType, string> = { helecho: 'Fern', girasol: 'Sunflower', suculenta: 'Succulent', bonsai: 'Bonsai' };
const CLIMATE_EN: Record<Climate, string> = { bosque: 'temperate forest', desierto: 'desert', tropical: 'tropical', tundra: 'tundra' };
const WEATHER_EN: Record<Weather, string> = { soleado: 'sunny', nublado: 'cloudy', tormenta: 'stormy' };
// [far hills, near hills, ground light, ground dark]
const LAND: Record<Climate, [string, string, string, string]> = {
  bosque: ['hsl(160 18% 46%)', 'hsl(150 24% 30%)', 'hsl(95 26% 34%)', 'hsl(110 28% 18%)'],
  desierto: ['hsl(28 38% 70%)', 'hsl(26 45% 58%)', 'hsl(36 58% 64%)', 'hsl(26 48% 42%)'],
  tropical: ['hsl(165 26% 44%)', 'hsl(150 38% 26%)', 'hsl(88 34% 34%)', 'hsl(120 34% 17%)'],
  tundra: ['hsl(205 20% 74%)', 'hsl(205 16% 62%)', 'hsl(200 22% 90%)', 'hsl(205 16% 66%)'],
};

const rnd = (i: number) => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };
const f = (n: number) => n.toFixed(1);

/** Organic tapered stem along a quadratic curve. */
function stemPath(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, w0: number, w1: number) {
  const L: string[] = []; const R: string[] = []; const N = 14;
  for (let i = 0; i <= N; i++) {
    const t = i / N; const u = 1 - t;
    const x = u * u * x0 + 2 * u * t * cx + t * t * x1; const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
    const dx = 2 * u * (cx - x0) + 2 * t * (x1 - cx); const dy = 2 * u * (cy - y0) + 2 * t * (y1 - cy);
    const len = Math.hypot(dx, dy) || 1; const w = (w0 + (w1 - w0) * t) / 2;
    const nx = -dy / len * w; const ny = dx / len * w;
    L.push(`${f(x + nx)} ${f(y + ny)}`); R.unshift(`${f(x - nx)} ${f(y - ny)}`);
  }
  return `M${L.join(' L')} L${R.join(' L')} Z`;
}
const qPoint = (x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, t: number) => {
  const u = 1 - t; return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1] as const;
};

type Pal = { light: string; mid: string; dark: string; vein: string };

/** Painted botanical leaf pointing along +x from origin. */
function Leaf({ x, y, rot, len, wid, pal, gid, veins = 3, k }: { x: number; y: number; rot: number; len: number; wid: number; pal: Pal; gid: string; veins?: number; k?: string | number }) {
  const W = wid / 2;
  const body = `M0 0 C${f(len * .22)} ${f(-W * 1.15)} ${f(len * .72)} ${f(-W * 1.05)} ${f(len)} 0 C${f(len * .7)} ${f(W * 1.0)} ${f(len * .24)} ${f(W * 1.1)} 0 0Z`;
  const shade = `M0 0 C${f(len * .3)} ${f(W * .25)} ${f(len * .7)} ${f(W * .2)} ${f(len)} 0 C${f(len * .7)} ${f(W * 1.0)} ${f(len * .24)} ${f(W * 1.1)} 0 0Z`;
  const vs: ReactNode[] = [];
  for (let i = 1; i <= veins; i++) {
    const t = i / (veins + 1); const vx = len * t * .9;
    vs.push(<path key={'a' + i} d={`M${f(vx)} 0 q${f(len * .08)} ${f(-W * .4)} ${f(len * .16)} ${f(-W * .7)}`} />);
    vs.push(<path key={'b' + i} d={`M${f(vx)} 0 q${f(len * .08)} ${f(W * .4)} ${f(len * .16)} ${f(W * .7)}`} />);
  }
  return (
    <g key={k} transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)})`}>
      <path d={body} fill={`url(#${gid})`} stroke={pal.dark} strokeOpacity=".35" strokeWidth=".5" />
      <path d={shade} fill={pal.dark} opacity=".28" />
      <path d={`M0 0 Q${f(len * .5)} ${f(-W * .08)} ${f(len * .96)} 0`} stroke={pal.vein} strokeWidth=".7" fill="none" opacity=".75" />
      <g stroke={pal.vein} strokeWidth=".35" fill="none" opacity=".5">{vs}</g>
    </g>
  );
}

function Grass({ x, y, n, color, h = 12, seed = 1 }: { x: number; y: number; n: number; color: string; h?: number; seed?: number }) {
  return <g fill={color}>{Array.from({ length: n }).map((_, i) => {
    const bx = x + (i - n / 2) * 2.2; const hh = h * (.55 + rnd(seed + i) * .6); const lean = (rnd(seed * 3 + i) - .5) * 10;
    return <path key={i} d={`M${f(bx - 1)} ${y} Q${f(bx + lean * .3)} ${f(y - hh * .6)} ${f(bx + lean)} ${f(y - hh)} Q${f(bx + lean * .2 + .6)} ${f(y - hh * .5)} ${f(bx + 1.1)} ${y}Z`} />;
  })}</g>;
}

function Rock({ x, y, s, light, dark, gid, snow }: { x: number; y: number; s: number; light: string; dark: string; gid: string; snow?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="1" rx="17" ry="3" fill="hsl(220 30% 8% / .25)" />
    <path d="M-16 1 C-17 -8 -9 -15 -1 -15 C8 -15 15 -9 16 1Z" fill={`url(#${gid})`} />
    <path d="M-16 1 C-12 -3 -4 -4 2 -2 C8 0 12 -1 16 1Z" fill={dark} opacity=".35" />
    <path d="M-7 -12 C-3 -14 3 -14 7 -11" stroke={light} strokeWidth="1.2" fill="none" opacity=".5" />
    {snow && <path d="M-11 -10 C-6 -16 6 -17 12 -9 C7 -11 2 -9 -2 -11 C-5 -9 -8 -9 -11 -10Z" fill="hsl(200 40% 97%)" />}
  </g>;
}

/** Natural conifer: tapered trunk, drooping curved boughs with soft needle clusters. */
function Conifer({ x, y, hgt, seed, gid }: { x: number; y: number; hgt: number; seed: number; gid: string }) {
  const tiers = 7; const out: ReactNode[] = [];
  for (let i = 0; i < tiers; i++) {
    const t = i / (tiers - 1); const by = y - hgt * (.18 + t * .74); const span = hgt * (.36 - t * .27);
    for (const side of [-1, 1]) {
      const sp = span * (.85 + rnd(seed + i * 4 + side) * .3); const ex = x + side * sp; const ey = by + sp * .32;
      const cx = x + side * sp * .5; const cy = by - sp * .06;
      out.push(<path key={`b${i}${side}`} d={stemPath(x, by, cx, cy, ex, ey, 2.2 - t, .4)} fill="hsl(24 24% 20%)" />);
      for (let j = 0; j < 5; j++) {
        const tt = .25 + j * .18; const [px, py] = qPoint(x, by, cx, cy, ex, ey, tt);
        const r = sp * (.3 - tt * .12) + 2; const lit = side < 0;
        out.push(<ellipse key={`n${i}${side}${j}`} cx={f(px)} cy={f(py + r * .25)} rx={f(r)} ry={f(r * .48)} fill={`url(#${gid})`} opacity={lit ? .95 : .88} transform={`rotate(${f(side * (12 + tt * 14))} ${f(px)} ${f(py)})`} />);
        out.push(<path key={`d${i}${side}${j}`} d={`M${f(px - r * .8)} ${f(py + r * .3)} q${f(r * .8)} ${f(r * .5)} ${f(r * 1.6)} 0`} stroke="hsl(150 34% 12%)" strokeWidth=".6" fill="none" opacity=".5" />);
      }
    }
  }
  return <g>
    <ellipse cx={x} cy={y + 1} rx={hgt * .3} ry="3" fill="hsl(150 30% 8% / .35)" />
    <path d={stemPath(x, y + 2, x - 1, y - hgt * .5, x + 1, y - hgt, hgt * .07, .6)} fill="hsl(22 24% 22%)" />
    {out}
    <path d={`M${x + 1} ${y - hgt - 4} q-3 5 -1 10 q3 -4 1 -10Z`} fill="hsl(120 30% 36%)" />
  </g>;
}

export function PlantScene({ plant, climate, weather, stage, health, empty }: { plant: PlantType; climate: Climate; weather: Weather; stage: number; health: number; empty: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (s: string) => `ps${uid}-${s}`;
  const [top, mid, bottom] = SKY[weather];
  const [far, near, gl, gd] = LAND[climate];
  const hue = health >= 70 ? 112 : health >= 45 ? 74 : 40;
  const sat = health >= 70 ? 38 : health >= 45 ? 36 : 38;
  const pal: Pal = { light: `hsl(${hue - 4} ${sat + 6}% 56%)`, mid: `hsl(${hue} ${sat}% 38%)`, dark: `hsl(${hue + 18} ${sat}% 20%)`, vein: `hsl(${hue - 10} ${sat + 10}% 74%)` };
  const droop = health < 45 ? 18 : health < 70 ? 8 : 0;
  const dim = weather === 'tormenta' ? .62 : weather === 'nublado' ? .85 : 1;
  const h = empty ? 14 : 40 + stage * 26;
  const n = empty ? 0 : 1 + stage;
  const base = 244; const tipX = 200 + droop; const tipY = base - h;
  const stemCol = plant === 'bonsai' ? 'hsl(24 30% 30%)' : `hsl(${hue + 6} 30% 30%)`;
  const LG = id('leaf');

  let plantArt: ReactNode = null;
  if (!empty) {
    if (plant === 'helecho') {
      // Arching fronds with many tapering pinnae
      const fronds = Math.min(n + 1, 7);
      plantArt = <g>{Array.from({ length: fronds }).map((_, i) => {
        const t = fronds === 1 ? 0 : i / (fronds - 1) - .5; const side = t === 0 ? (i % 2 ? 1 : -1) : Math.sign(t);
        const len = h * (1.05 - Math.abs(t) * .5);
        const ex = 200 + t * len * 1.5 + droop * side; const ey = base - len * (.85 - Math.abs(t) * .45) + droop * 1.4;
        const cx = 200 + t * len * .5; const cy = base - len * 1.0;
        const pin = 7 + stage * 2; const parts: ReactNode[] = [];
        for (let j = 1; j < pin; j++) {
          const tt = j / pin; const [px, py] = qPoint(200, base, cx, cy, ex, ey, tt);
          const [qx, qy] = qPoint(200, base, cx, cy, ex, ey, Math.min(tt + .02, 1));
          const ang = Math.atan2(qy - py, qx - px) * 180 / Math.PI;
          const pl = (1 - tt * .75) * (7 + stage * 1.6);
          parts.push(<Leaf k={'l' + j} x={px} y={py} rot={ang - 62 + droop * .6} len={pl} wid={pl * .38} pal={pal} gid={LG} veins={1} />);
          parts.push(<Leaf k={'r' + j} x={px} y={py} rot={ang + 62 + droop * .6} len={pl} wid={pl * .38} pal={pal} gid={LG} veins={1} />);
        }
        return <g key={i}><path d={stemPath(200, base, cx, cy, ex, ey, 2.4, .5)} fill={stemCol} />{parts}</g>;
      })}
        {stage >= 4 && health >= 70 && <path d={`M${200} ${base - 6} q-4 -10 2 -16 q6 -2 4 6`} stroke={pal.mid} strokeWidth="1.6" fill="none" strokeLinecap="round" />}
      </g>;
    } else if (plant === 'girasol') {
      const cx = 196 + droop / 3; const cy = base - h / 2;
      const leaves: ReactNode[] = [];
      for (let i = 0; i < n; i++) {
        const tt = (i + 1) / (n + 1.4); const [px, py] = qPoint(200, base, cx, cy, tipX, tipY, tt); const side = i % 2 ? 1 : -1;
        const L = 34 - tt * 14 + stage * 1.5;
        leaves.push(<g key={i}><path d={`M${f(px)} ${f(py)} q${side * 6} -2 ${side * 10} ${2 + droop * .3}`} stroke={stemCol} strokeWidth="1.6" fill="none" />
          <Leaf x={px + side * 9} y={py + 2 + droop * .3} rot={side > 0 ? 8 + droop * 1.6 : 172 - droop * 1.6} len={L} wid={L * .72} pal={pal} gid={LG} veins={3} /></g>);
      }
      const head: ReactNode = stage >= 3 ? (() => {
        const R = 9 + stage * 1.6; const petals: ReactNode[] = []; const seeds: ReactNode[] = [];
        for (let i = 0; i < 22; i++) {
          const a = i * (360 / 22) + (i % 2 ? 8 : 0); const pl = R * (1.15 + rnd(i) * .2); const back = i % 2 === 1;
          petals.push(<path key={i} transform={`rotate(${a}) translate(${R * .8} 0)`} d={`M0 0 C${f(pl * .3)} ${f(-pl * .2)} ${f(pl * .8)} ${f(-pl * .16)} ${f(pl)} 0 C${f(pl * .8)} ${f(pl * .16)} ${f(pl * .3)} ${f(pl * .2)} 0 0Z`} fill={back ? 'hsl(36 88% 50%)' : `url(#${id('petal')})`} />);
        }
        for (let i = 0; i < 60; i++) { const r = Math.sqrt(i / 60) * R * .9; const a = i * 2.39996; seeds.push(<circle key={i} cx={f(Math.cos(a) * r)} cy={f(Math.sin(a) * r)} r=".8" fill="hsl(30 40% 34%)" />); }
        return <g transform={`translate(${f(tipX)} ${f(tipY)}) rotate(${droop * 1.4}) scale(1 .86)`}>
          {petals}<circle r={R} fill={`url(#${id('disk')})`} /><g opacity=".85">{seeds}</g>
        </g>;
      })() : <g transform={`translate(${f(tipX)} ${f(tipY)})`}><path d="M-6 2 C-7 -6 -2 -10 0 -11 C2 -10 7 -6 6 2Z" fill={pal.mid} /><path d="M-3 -2 L0 -10 L3 -2" stroke={pal.dark} strokeWidth=".6" fill="none" /></g>;
      plantArt = <g><path d={stemPath(200, base, cx, cy, tipX, tipY, 5, 2.4)} fill={stemCol} /><path d={stemPath(199, base, cx - 1, cy, tipX - 1, tipY, 1.2, .5)} fill={pal.vein} opacity=".35" />{leaves}{head}</g>;
    } else if (plant === 'suculenta') {
      // Echeveria-like rosette: back row to front row
      const cnt = Math.min(5 + stage * 2, 15); const sz = 14 + stage * 3.2; const cyR = base - 4 - stage * 1.6;
      const items = Array.from({ length: cnt }).map((_, i) => {
        const a = -90 + (i - (cnt - 1) / 2) * (170 / cnt); const ring = i % 3; const L = sz * (1 - ring * .18);
        return { a: a + droop * Math.sign(a + 90) * .9, L, ring };
      }).sort((p, q) => Math.abs(q.a + 90) - Math.abs(p.a + 90));
      plantArt = <g>
        {items.map((it, i) => <g key={i} transform={`translate(200 ${cyR}) rotate(${f(it.a)})`}>
          <path d={`M0 -${f(it.L * .2)} C${f(it.L * .4)} -${f(it.L * .34)} ${f(it.L * .85)} -${f(it.L * .2)} ${f(it.L)} 0 C${f(it.L * .85)} ${f(it.L * .2)} ${f(it.L * .4)} ${f(it.L * .34)} 0 ${f(it.L * .2)}Z`} fill={`url(#${id('succ')})`} />
          <path d={`M${f(it.L * .2)} 0 L${f(it.L * .95)} 0`} stroke={pal.vein} strokeWidth=".6" opacity=".35" />
          <circle cx={f(it.L * .98)} cy="0" r="1.1" fill="hsl(345 45% 52%)" opacity=".8" />
        </g>)}
        {stage >= 4 && health >= 70 && <g><path d={stemPath(203, cyR - 6, 214, cyR - 40, 210 + droop, cyR - 58, 2, 1)} fill="hsl(340 25% 48%)" />
          {[0, 1, 2].map((j) => <g key={j} transform={`translate(${210 + droop + j * 4 - 3} ${cyR - 58 + j * 7})`}><path d="M0 0 C-3 3 -3 7 0 8 C3 7 3 3 0 0Z" fill="hsl(345 68% 66%)" /><path d="M0 8 L-2 10 M0 8 L2 10" stroke="hsl(18 80% 60%)" strokeWidth=".8" /></g>)}</g>}
      </g>;
    } else {
      // Bonsai: gnarled trunk, branches, foliage pads of tiny leaves
      const tx = tipX - 4; const ty = tipY + 10;
      const pads: [number, number, number][] = [[tx, ty - 2, 1]];
      const branches: ReactNode[] = [];
      for (let i = 0; i < Math.min(n, 5); i++) {
        const side = i % 2 ? 1 : -1; const tt = .35 + i * .12; const [bx, by] = qPoint(200, base, 188, base - h * .55, tx, ty, Math.min(tt, .95));
        const ex = bx + side * (26 + stage * 3 - i * 2); const ey = by - 8 + droop * .6;
        branches.push(<path key={i} d={stemPath(bx, by, bx + side * 12, by - 12, ex, ey, 4 - i * .4, 1.2)} fill={stemCol} />);
        pads.push([ex, ey - 2, .75 - i * .05]);
      }
      plantArt = <g>
        <path d={stemPath(200, base, 182, base - h * .55, tx, ty, 13 + stage, 3)} fill={`url(#${id('bark')})`} />
        <path d={`M196 ${base - 4} Q186 ${base - h * .4} ${tx - 2} ${ty + 12}`} stroke="hsl(30 20% 55%)" strokeWidth=".8" fill="none" opacity=".45" />
        <path d={`M194 ${base} q-8 2 -14 4 M206 ${base} q8 1 14 4`} stroke={stemCol} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        {branches}
        {pads.map(([px, py, s], i) => <g key={i} transform={`translate(${f(px)} ${f(py)}) scale(${f(s * (.7 + stage * .08))})`}>
          <ellipse cx="0" cy="5" rx="26" ry="9" fill={pal.dark} opacity=".55" />
          {Array.from({ length: 26 }).map((_, j) => { const a = rnd(i * 50 + j) * Math.PI * 2; const r = Math.sqrt(rnd(i * 70 + j)) ; return <Leaf key={j} k={j} x={Math.cos(a) * r * 22} y={Math.sin(a) * r * 8 - 2} rot={-90 + (rnd(i * 9 + j) - .5) * 160 + droop * 2} len={7} wid={3.6} pal={pal} gid={LG} veins={0} />; })}
          {stage >= 4 && health >= 70 && [0, 1, 2].map((j) => <circle key={'b' + j} cx={(rnd(i + j * 3) - .5) * 34} cy={(rnd(i * 2 + j) - .7) * 10} r="1.8" fill="hsl(22 85% 66%)" />)}
        </g>)}
      </g>;
    }
  }

  return (
    <svg viewBox="0 0 400 320" className="h-full w-full" role="img" aria-label={`${PLANT_EN[plant]} plant in a ${CLIMATE_EN[climate]} setting, ${WEATHER_EN[weather]} weather`}>
      <defs>
        <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset=".6" stopColor={mid} /><stop offset="1" stopColor={bottom} /></linearGradient>
        <radialGradient id={id('sun')}><stop offset="0" stopColor="hsl(46 100% 92%)" /><stop offset=".25" stopColor="hsl(44 95% 72% / .7)" /><stop offset="1" stopColor="hsl(40 90% 70% / 0)" /></radialGradient>
        <linearGradient id={id('ground')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={gl} /><stop offset="1" stopColor={gd} /></linearGradient>
        <linearGradient id={LG} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.light} /><stop offset=".55" stopColor={pal.mid} /><stop offset="1" stopColor={pal.dark} /></linearGradient>
        <linearGradient id={id('succ')} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={pal.dark} /><stop offset=".5" stopColor={`hsl(${hue + 50} 22% 52%)`} /><stop offset="1" stopColor={`hsl(${hue + 60} 26% 70%)`} /></linearGradient>
        <linearGradient id={id('petal')} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="hsl(32 90% 46%)" /><stop offset=".4" stopColor="hsl(44 96% 58%)" /><stop offset="1" stopColor="hsl(48 98% 68%)" /></linearGradient>
        <radialGradient id={id('disk')} cx=".4" cy=".35"><stop offset="0" stopColor="hsl(38 60% 34%)" /><stop offset=".6" stopColor="hsl(24 50% 20%)" /><stop offset="1" stopColor="hsl(20 45% 12%)" /></radialGradient>
        <linearGradient id={id('bark')} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="hsl(24 25% 22%)" /><stop offset=".45" stopColor="hsl(26 24% 40%)" /><stop offset="1" stopColor="hsl(22 28% 18%)" /></linearGradient>
        <linearGradient id={id('rock')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={climate === 'desierto' ? 'hsl(22 38% 62%)' : 'hsl(210 8% 64%)'} /><stop offset="1" stopColor={climate === 'desierto' ? 'hsl(18 36% 36%)' : 'hsl(215 12% 32%)'} /></linearGradient>
        <linearGradient id={id('pot')} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="hsl(18 52% 30%)" /><stop offset=".35" stopColor="hsl(20 58% 50%)" /><stop offset=".6" stopColor="hsl(22 56% 44%)" /><stop offset="1" stopColor="hsl(16 50% 26%)" /></linearGradient>
        <radialGradient id={id('soil')}><stop offset="0" stopColor="hsl(26 30% 26%)" /><stop offset="1" stopColor="hsl(22 30% 14%)" /></radialGradient>
        <linearGradient id={id('needle')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="hsl(118 26% 40%)" /><stop offset=".5" stopColor="hsl(140 30% 24%)" /><stop offset="1" stopColor="hsl(152 32% 14%)" /></linearGradient>
        <linearGradient id={id('hill')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={gl} stopOpacity=".55" /><stop offset=".5" stopColor={near} /><stop offset="1" stopColor={gd} /></linearGradient>
        <radialGradient id={id('pool')} cx=".5" cy=".3" r=".7"><stop offset="0" stopColor={bottom} stopOpacity=".35" /><stop offset="1" stopColor={bottom} stopOpacity="0" /></radialGradient>
        <filter id={id('soft')} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id={id('tex')}><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" /><feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.08  0 0 0 0 0.05  0 0 0 .55 0" /><feComposite in2="SourceGraphic" operator="in" /></filter>
        <linearGradient id={id('haze')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={bottom} stopOpacity="0" /><stop offset="1" stopColor={bottom} stopOpacity=".55" /></linearGradient>
      </defs>

      <rect width="400" height="320" fill={`url(#${id('sky')})`} />
      {weather === 'soleado' && <g><circle cx="320" cy="62" r="70" fill={`url(#${id('sun')})`} className="hotspot-ring" opacity=".5" /><circle cx="320" cy="62" r="70" fill={`url(#${id('sun')})`} /><circle cx="320" cy="62" r="18" fill="hsl(48 100% 90%)" /></g>}
      {weather !== 'soleado' && <g className="cloud" filter={`url(#${id('soft')})`} fill={weather === 'tormenta' ? 'hsl(236 20% 24%)' : 'hsl(212 22% 88%)'}>
        <ellipse cx="90" cy="62" rx="62" ry="18" /><ellipse cx="128" cy="48" rx="38" ry="20" /><ellipse cx="270" cy="72" rx="70" ry="20" /><ellipse cx="304" cy="56" rx="36" ry="20" />
        <ellipse cx="190" cy="34" rx="80" ry="12" opacity=".6" /></g>}
      {weather === 'nublado' && <g fill="hsl(210 30% 96% / .5)" filter={`url(#${id('soft')})`}><ellipse cx="115" cy="44" rx="30" ry="9" /><ellipse cx="290" cy="56" rx="34" ry="9" /></g>}
      {weather === 'tormenta' && <>
        <g className="rain" stroke="hsl(200 50% 78% / .45)" strokeWidth="1.1">{Array.from({ length: 34 }).map((_, i) => <line key={i} x1={i * 12 + 4} y1={78 + (i % 5) * 30} x2={i * 12} y2={92 + (i % 5) * 30} style={{ animationDelay: (i % 7) * 0.09 + 's' }} />)}</g>
        <path className="lightning" d="M262 84 L252 112 L260 113 L248 150 L272 108 L263 107 L274 84 Z" fill="hsl(52 100% 82%)" />
      </>}

      {/* Distant terrain with atmospheric perspective */}
      <path d={climate === 'desierto' ? 'M0 214 Q60 196 120 210 Q190 186 260 206 Q330 192 400 204 V260 H0Z' : climate === 'tundra' ? 'M0 216 L40 190 L70 204 L110 176 L160 208 L220 186 L270 206 L320 180 L360 200 L400 192 V260 H0Z' : 'M0 212 Q50 194 110 206 Q170 188 240 204 Q310 190 400 200 V260 H0Z'} fill={far} opacity={.75 * dim + .1} />
      {climate === 'tundra' && <path d="M110 176 L124 184 L118 186 L104 182Z M320 180 L334 190 L326 190 L312 186Z M40 190 L52 196 L44 197Z" fill="hsl(200 40% 97%)" opacity=".85" />}
      {climate === 'bosque' && <g fill={near} opacity=".8">{Array.from({ length: 18 }).map((_, i) => { const x = i * 23 + rnd(i) * 12; const th = 22 + rnd(i + 9) * 22; const w = th * .22; return <path key={i} d={`M${f(x - w)} 236 C${f(x - w * .8)} ${f(236 - th * .45)} ${f(x - w * .25)} ${f(236 - th * .8)} ${f(x)} ${f(236 - th)} C${f(x + w * .25)} ${f(236 - th * .8)} ${f(x + w * .8)} ${f(236 - th * .45)} ${f(x + w)} 236Z`} />; })}<path d="M0 236 Q100 226 200 234 T400 230 V250 H0Z" /></g>}
      {climate !== 'bosque' && <path d={climate === 'desierto' ? 'M0 238 Q80 216 170 234 Q260 212 400 230 V270 H0Z' : 'M0 236 Q90 222 180 232 Q280 218 400 230 V270 H0Z'} fill={`url(#${id('hill')})`} opacity=".9" />}
      <rect y="170" width="400" height="80" fill={`url(#${id('haze')})`} />

      {/* Foreground ground */}
      <path d={climate === 'desierto' ? 'M0 250 Q100 230 200 245 T400 240 V320 H0Z' : 'M0 255 Q120 241 220 252 T400 248 V320 H0Z'} fill={`url(#${id('ground')})`} />
      <path d={climate === 'desierto' ? 'M0 250 Q100 230 200 245 T400 240 V320 H0Z' : 'M0 255 Q120 241 220 252 T400 248 V320 H0Z'} filter={`url(#${id('tex')})`} fill={gl} opacity=".55" />
      <path d={climate === 'desierto' ? 'M0 250 Q100 230 200 245 T400 240' : 'M0 255 Q120 241 220 252 T400 248'} stroke={gl} strokeWidth="2" fill="none" opacity=".7" filter={`url(#${id('soft')})`} />
      <ellipse cx="200" cy="262" rx="190" ry="22" fill={`url(#${id('pool')})`} />
      <g opacity=".22">{Array.from({ length: 14 }).map((_, i) => <ellipse key={i} cx={f(rnd(i + 40) * 400)} cy={f(262 + rnd(i + 60) * 54)} rx={f(14 + rnd(i + 80) * 26)} ry={f(2 + rnd(i + 90) * 3)} fill={i % 2 ? gd : gl} />)}</g>
      <rect y="290" width="400" height="30" fill={gd} opacity=".35" />
      {climate !== 'desierto' && climate !== 'tundra' && <><Grass x={14} y={318} n={10} color={gd} h={20} seed={41} /><Grass x={388} y={318} n={9} color={gd} h={18} seed={43} /></>}
      {climate === 'desierto' && <g stroke="hsl(30 50% 50% / .35)" strokeWidth=".8" fill="none">{[268, 280, 294, 308].map((y, i) => <path key={y} d={`M${10 + i * 6} ${y} q60 -6 120 0 t120 0`} />)}</g>}

      {/* Climate vegetation & rocks */}
      {climate === 'bosque' && <g>
        <Conifer x={48} y={262} hgt={92} seed={5} gid={id('needle')} />
        <Conifer x={372} y={258} hgt={58} seed={31} gid={id('needle')} />
        <Rock x={346} y={262} s={1} light="hsl(90 20% 80%)" dark="hsl(220 20% 12%)" gid={id('rock')} />
        <path d="M334 250 q6 -4 14 -3" stroke="hsl(95 40% 40%)" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".7" />
        <Grass x={110} y={262} n={9} color="hsl(95 30% 30%)" seed={3} /><Grass x={290} y={264} n={11} color="hsl(100 28% 26%)" seed={7} /><Grass x={372} y={266} n={7} color="hsl(95 30% 32%)" seed={11} />
      </g>}
      {climate === 'desierto' && <g>
        <g transform="translate(46 254)">
          <path d={stemPath(0, 0, -1, -24, 0, -50, 11, 9)} fill="hsl(105 24% 36%)" /><path d="M-5 -1 L-5 -48 M0 0 L0 -50 M4 -1 L4 -48" stroke="hsl(105 24% 26%)" strokeWidth=".8" />
          <path d="M-5 -20 q-12 0 -12 -10 v-10" stroke="hsl(105 24% 33%)" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M5 -28 q10 0 10 -8 v-6" stroke="hsl(105 24% 38%)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M-2 -46 q2 -6 4 0" stroke="hsl(80 35% 58%)" strokeWidth="1.5" fill="none" opacity=".6" />
        </g>
        <Rock x={344} y={252} s={1.1} light="hsl(30 50% 80%)" dark="hsl(15 40% 20%)" gid={id('rock')} /><Rock x={366} y={258} s={.55} light="hsl(30 50% 80%)" dark="hsl(15 40% 20%)" gid={id('rock')} />
        <Grass x={110} y={252} n={6} color="hsl(42 35% 46%)" h={9} seed={5} /><Grass x={300} y={248} n={5} color="hsl(42 35% 42%)" h={8} seed={13} />
      </g>}
      {climate === 'tropical' && <g>
        <path d={stemPath(360, 256, 346, 210, 353, 168, 8, 3)} fill={`url(#${id('bark')})`} />
        {[-165, -132, -97, -57, -20, 20, 154].map((angle, i) => (
          <g key={angle} transform={`translate(353 168) rotate(${angle})`}>
            <path d={stemPath(0, 0, 25, -15, 49, 10 + i % 3, 1.6, .25)} fill="hsl(142 33% 27%)" />
            {Array.from({ length: 12 }, (_, j) => {
              const t = .12 + j * .07;
              const [x, y] = qPoint(0, 0, 25, -15, 49, 10 + i % 3, t);
              const length = 15 * Math.sin(t * Math.PI) + 2;
              const leafPal = { light: 'hsl(115 34% 48%)', mid: 'hsl(139 36% 30%)', dark: 'hsl(155 37% 17%)', vein: 'hsl(100 28% 58%)' };
              return <g key={j}>
                <Leaf x={x} y={y} rot={65 + t * 30} len={length} wid={3.6} pal={leafPal} gid={id('trop')} veins={0} />
                <Leaf x={x} y={y} rot={-63 + t * 40} len={length * .9} wid={3.4} pal={leafPal} gid={id('trop')} veins={0} />
              </g>;
            })}
          </g>
        ))}
        <g transform="translate(32 262)">{[-50, -20, 15, 45].map((a, i) => <Leaf key={i} x={0} y={0} rot={-90 + a} len={30 - i * 2} wid={16} pal={{ light: 'hsl(132 36% 42%)', mid: 'hsl(140 40% 28%)', dark: 'hsl(150 40% 16%)', vein: 'hsl(110 40% 66%)' }} gid={id('trop')} veins={4} />)}</g>
        <Grass x={120} y={262} n={10} color="hsl(120 34% 26%)" seed={17} /><Grass x={290} y={264} n={9} color="hsl(125 34% 24%)" seed={19} />
      </g>}
      {climate === 'tropical' && <defs><linearGradient id={id('trop')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="hsl(132 36% 42%)" /><stop offset="1" stopColor="hsl(150 40% 18%)" /></linearGradient></defs>}
      {climate === 'tundra' && <g>
        <Rock x={52} y={262} s={1.2} light="hsl(200 30% 95%)" dark="hsl(220 25% 15%)" gid={id('rock')} snow /><Rock x={350} y={258} s={.9} light="hsl(200 30% 95%)" dark="hsl(220 25% 15%)" gid={id('rock')} snow />
        <Grass x={110} y={262} n={6} color="hsl(36 22% 50%)" h={9} seed={23} /><Grass x={300} y={262} n={7} color="hsl(36 20% 46%)" h={10} seed={29} />
        <g fill="hsl(0 0% 99% / .85)">{[30, 80, 140, 270, 330, 370].map((x, i) => <circle key={x} cx={x} cy={256 + (i % 3) * 6} r={1.4 + (i % 2)} />)}</g>
      </g>}

      {/* Pot with soil */}
      <ellipse cx="200" cy="302" rx="52" ry="5" fill="hsl(220 30% 8% / .35)" filter={`url(#${id('soft')})`} />
      <path d="M160 250 h80 l-9 50 q-1 3 -4 3 h-54 q-3 0 -4 -3z" fill={`url(#${id('pot')})`} />
      <path d="M160 250 h80 l-9 50 q-1 3 -4 3 h-54 q-3 0 -4 -3z" filter={`url(#${id('tex')})`} fill="hsl(20 50% 40%)" opacity=".35" />
      <rect x="154" y="242" width="92" height="12" rx="3" fill={`url(#${id('pot')})`} />
      <path d="M156 243.5 h88" stroke="hsl(28 60% 70%)" strokeWidth="1" opacity=".5" />
      <ellipse cx="200" cy="244" rx="42" ry="3" fill={`url(#${id('soil')})`} />
      <text x="200" y="282" textAnchor="middle" fontFamily="Chakra Petch" fontSize="9" fill="hsl(36 40% 88% / .8)" letterSpacing="1.5">ASTROHEALTH</text>

      <g className="sway" style={{ filter: dim < 1 ? `brightness(${dim + .1})` : undefined }}>
        {empty ? <g><ellipse cx="200" cy="243" rx="6" ry="3.6" fill="hsl(30 36% 32%)" /><path d="M195 242 q5 -3 10 0" stroke="hsl(36 40% 52%)" strokeWidth=".8" fill="none" /><path d="M200 240 q1 -3 3 -4" stroke="hsl(90 40% 50%)" strokeWidth=".9" fill="none" strokeLinecap="round" /></g> : plantArt}
      </g>
      {weather === 'soleado' && <rect width="400" height="320" fill="hsl(44 90% 70%)" opacity=".05" pointerEvents="none" />}
    </svg>
  );
}
