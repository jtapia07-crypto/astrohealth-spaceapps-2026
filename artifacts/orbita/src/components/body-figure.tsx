import type { HotspotId, HotspotReport } from '@/lib/health';
import { LEVEL_COLOR } from '@/lib/health';

const POS: Record<HotspotId, { x: number; y: number; lx: number; side: 'l' | 'r' }> = {
  cabeza: { x: 100, y: 40, lx: 175, side: 'r' },
  saliva: { x: 100, y: 64, lx: 25, side: 'l' },
  corazon: { x: 112, y: 120, lx: 178, side: 'r' },
  sangre: { x: 40, y: 175, lx: 8, side: 'l' },
  sudor: { x: 64, y: 108, lx: 12, side: 'l' },
  musculo: { x: 127, y: 300, lx: 180, side: 'r' },
  huesos: { x: 82, y: 345, lx: 18, side: 'l' },
};

export function BodyFigure({ reports, active, onSelect }: { reports: HotspotReport[]; active: HotspotId | null; onSelect: (id: HotspotId) => void }) {
  const skin = 'hsl(224 35% 22%)';
  const line = 'hsl(40 30% 85% / .35)';
  return (
    <svg viewBox="-40 0 280 450" className="h-full w-full" role="img" aria-label="Cuerpo humano con puntos interactivos">
      <defs>
        <linearGradient id="skin" x1="0" x2="1"><stop offset="0" stopColor="hsl(224 38% 26%)" /><stop offset=".5" stopColor="hsl(224 34% 32%)" /><stop offset="1" stopColor="hsl(224 38% 24%)" /></linearGradient>
        <radialGradient id="aura"><stop offset="0" stopColor="hsl(22 95% 58% / .18)" /><stop offset="1" stopColor="transparent" /></radialGradient>
      </defs>
      <ellipse cx="100" cy="220" rx="140" ry="220" fill="url(#aura)" />
      <g stroke="url(#skin)" strokeLinecap="round" fill="none">
        <path d="M54 100 Q36 106 33 140 L28 205 Q26 225 24 238" strokeWidth="17" />
        <path d="M146 100 Q164 106 167 140 L172 205 Q174 225 176 238" strokeWidth="17" />
        <path d="M84 238 L80 330 L78 420" strokeWidth="27" />
        <path d="M116 238 L120 330 L122 420" strokeWidth="27" />
      </g>
      <g fill="url(#skin)">
        <ellipse cx="100" cy="42" rx="23" ry="28" />
        <rect x="90" y="64" width="20" height="22" rx="6" />
        <path d="M60 88 Q100 78 140 88 Q156 94 152 116 Q148 160 142 196 Q140 236 128 248 Q100 256 72 248 Q60 236 58 196 Q52 160 48 116 Q44 94 60 88 Z" />
        <ellipse cx="23" cy="250" rx="8" ry="12" /><ellipse cx="177" cy="250" rx="8" ry="12" />
        <ellipse cx="72" cy="428" rx="14" ry="6" /><ellipse cx="128" cy="428" rx="14" ry="6" />
      </g>
      <g stroke={line} strokeWidth="1.2" fill="none">
        <path d="M100 92 L100 238" strokeDasharray="3 3" />
        {[104, 116, 128, 140, 152].map((y, i) => <path key={y} d={`M100 ${y} Q${76 - i * 1} ${y + 2} ${66 + i * 2} ${y + 12}  M100 ${y} Q${124 + i} ${y + 2} ${134 - i * 2} ${y + 12}`} />)}
        <path d="M70 232 Q100 214 130 232" /><path d="M82 260 L80 330 M118 260 L120 330" strokeDasharray="2 4" />
        <path d="M70 94 Q84 100 100 96 Q116 100 130 94" />
      </g>
      <path d="M112 112 c-6 -8 -16 -2 -10 8 l10 10 l10 -10 c6 -10 -4 -16 -10 -8z" fill="hsl(352 70% 52% / .75)" />
      <g stroke="hsl(352 70% 60% / .35)" strokeWidth="1" fill="none"><path d="M106 130 Q90 170 84 236 M118 130 Q112 170 116 236 M100 120 Q70 110 46 140 L34 200" /></g>
      <ellipse cx="91" cy="38" rx="3" ry="2" fill="hsl(40 30% 85% / .5)" /><ellipse cx="109" cy="38" rx="3" ry="2" fill="hsl(40 30% 85% / .5)" />
      {reports.map((r) => {
        const p = POS[r.id]; const c = LEVEL_COLOR[r.level]; const on = active === r.id;
        const tx = p.side === 'r' ? p.lx : p.lx;
        return (
          <g key={r.id} className="cursor-pointer" onClick={() => onSelect(r.id)} data-testid={`hotspot-${r.id}`} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(r.id); }}>
            <line x1={p.x} y1={p.y} x2={tx} y2={p.y} stroke={c} strokeOpacity={on ? 0.9 : 0.4} strokeWidth="1" strokeDasharray="2 2" />
            <circle cx={p.x} cy={p.y} r="7" fill={c} className="hotspot-ring" opacity=".5" />
            <circle cx={p.x} cy={p.y} r={on ? 7 : 5} fill={c} stroke="hsl(226 45% 7%)" strokeWidth="2" />
            <text x={tx} y={p.y - 5} textAnchor={p.side === 'r' ? 'start' : 'end'} fill={on ? c : 'hsl(40 33% 91%)'} fontSize="11" fontFamily="Chakra Petch" fontWeight="600" letterSpacing="1">{r.label.toUpperCase()}</text>
            <text x={tx} y={p.y + 8} textAnchor={p.side === 'r' ? 'start' : 'end'} fill={c} fontSize="9" fontFamily="JetBrains Mono">{r.score}/100</text>
          </g>
        );
      })}
    </svg>
  );
}
