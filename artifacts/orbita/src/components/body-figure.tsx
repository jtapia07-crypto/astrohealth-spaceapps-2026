import type { HotspotId, HotspotReport } from '@/lib/health';
import { LEVEL_COLOR } from '@/lib/health';

const POS: Record<HotspotId, { x: number; y: number; lx: number; side: 'l' | 'r' }> = {
  cabeza: { x: 100, y: 40, lx: 175, side: 'r' },
  saliva: { x: 100, y: 64, lx: 25, side: 'l' },
  corazon: { x: 112, y: 120, lx: 178, side: 'r' },
  sangre: { x: 40, y: 175, lx: 8, side: 'l' },
  sudor: { x: 64, y: 108, lx: 12, side: 'l' },
  musculo: { x: 120, y: 292, lx: 180, side: 'r' },
  huesos: { x: 82, y: 345, lx: 18, side: 'l' },
};

export function BodyFigure({ reports, active, onSelect }: { reports: HotspotReport[]; active: HotspotId | null; onSelect: (id: HotspotId) => void }) {
  const line = 'hsl(205 35% 78% / .25)';
  return (
    <svg viewBox="-40 0 280 450" className="h-full w-full" role="img" aria-label="Cuerpo humano con puntos interactivos">
      <defs>
        <linearGradient id="skin" x1="0" x2="1">
          <stop offset="0" stopColor="hsl(219 28% 25%)" />
          <stop offset=".26" stopColor="hsl(215 26% 42%)" />
          <stop offset=".48" stopColor="hsl(214 24% 51%)" />
          <stop offset=".68" stopColor="hsl(217 26% 39%)" />
          <stop offset="1" stopColor="hsl(222 31% 23%)" />
        </linearGradient>
        <radialGradient id="body-light" cx=".42" cy=".22" r=".8">
          <stop offset="0" stopColor="hsl(198 40% 85% / .17)" />
          <stop offset="1" stopColor="hsl(218 34% 10% / .12)" />
        </radialGradient>
        <radialGradient id="aura"><stop offset="0" stopColor="hsl(22 95% 58% / .18)" /><stop offset="1" stopColor="transparent" /></radialGradient>
      </defs>
      <ellipse cx="100" cy="220" rx="140" ry="220" fill="url(#aura)" />
      <ellipse cx="100" cy="437" rx="43" ry="3" fill="hsl(220 35% 5% / .45)" />
      <g fill="url(#skin)" stroke="hsl(205 34% 70% / .22)" strokeWidth=".65" strokeLinejoin="round">
        {/* A continuous contour gives the shoulders, waist and limbs natural transitions. */}
        <path id="body-contour" d="M91 67
          Q92 78 86 82 L67 88 Q53 90 48 104
          Q44 115 44 132 L40 155 Q36 166 36 177
          L30 210 L27 229 Q22 235 21 243 L20 255
          Q21 259 23 254 L25 244 L25 260 Q27 264 29 259
          L30 246 L31 260 Q33 263 35 258 L35 244
          L37 254 Q40 257 40 252 L39 237
          Q44 230 43 224 L47 205 Q55 185 55 172
          L57 156 Q63 142 62 124
          Q66 137 65 153 Q63 170 67 184
          Q71 198 66 218 Q62 234 64 251
          Q65 278 70 302 Q73 313 72 325
          Q66 346 70 369 L75 408 L74 419
          Q66 423 64 429 Q65 434 73 434 L85 432
          Q90 430 88 423 L87 409 L88 373
          Q94 349 89 330 Q88 321 91 308
          L98 269 Q100 259 102 269 L109 308
          Q112 321 111 330 Q106 349 112 373
          L113 409 L112 423 Q110 430 115 432
          L127 434 Q135 434 136 429 Q134 423 126 419
          L125 408 L130 369 Q134 346 128 325
          Q127 313 130 302 Q135 278 136 251
          Q138 234 134 218 Q129 198 133 184
          Q137 170 135 153 Q134 137 138 124
          Q137 142 143 156 L145 172 Q145 185 153 205
          L157 224 Q156 230 161 237 L160 252
          Q160 257 163 254 L165 244 L165 258
          Q167 263 169 260 L170 246 L171 259
          Q173 264 175 260 L175 244 L177 254
          Q179 259 180 255 L179 243 Q178 235 173 229
          L170 210 L164 177 Q164 166 160 155
          L156 132 Q156 115 152 104 Q147 90 133 88
          L114 82 Q108 78 109 67 Z" />
        <path d="M81 37 Q78 18 90 13 Q101 8 112 15
          Q121 21 119 38 Q124 34 122 45 Q121 50 118 49
          L115 58 Q110 69 100 71 Q90 69 85 58 L82 49
          Q79 50 78 45 Q76 34 81 37 Z" />
      </g>
      <use href="#body-contour" fill="url(#body-light)" pointerEvents="none" />
      <g stroke={line} strokeWidth=".85" fill="none" strokeLinecap="round">
        <path d="M91 76 L86 88 Q79 90 69 93 M109 76 L114 88 Q121 90 131 93" />
        <path d="M70 101 Q82 95 96 102 M104 102 Q118 95 130 101
          M66 118 Q79 128 95 119 M105 119 Q121 128 134 118
          M100 99 L100 135" />
        <path d="M73 139 Q80 148 78 164 M127 139 Q120 148 122 164
          M85 145 Q100 148 115 145 M86 160 Q100 163 114 160
          M87 177 Q100 180 113 177 M100 144 L100 190" opacity=".55" />
        <path d="M73 207 Q80 219 95 226 M127 207 Q120 219 105 226
          M72 241 Q78 275 80 307 M128 241 Q122 275 120 307
          M78 324 Q82 320 86 325 M114 325 Q118 320 122 324
          M77 341 Q81 365 80 393 M123 341 Q119 365 120 393" />
        <path d="M51 106 Q58 111 56 126 M149 106 Q142 111 144 126
          M47 144 L44 162 M153 144 L156 162
          M39 178 Q44 182 43 195 M161 178 Q156 182 157 195" />
        <path d="M86 36 Q91 33 96 36 M104 36 Q109 33 114 36
          M100 38 L97 49 Q100 51 103 49
          M94 57 Q100 60 106 57 M95 63 Q100 65 105 63" />
      </g>
      <ellipse cx="100" cy="193" rx="1.6" ry="2" fill="hsl(220 30% 20% / .5)" />
      <path d="M108 110 Q104 105 101 112 Q98 119 105 126
        L112 132 Q121 124 121 117 Q120 110 115 112
        L113 106 L109 106 Z" fill="hsl(352 60% 53% / .55)" />
      <g stroke="hsl(352 65% 65% / .2)" strokeWidth="1" fill="none">
        <path d="M107 128 Q99 163 100 218 M101 111 Q73 104 56 133 L40 195
          M100 217 L81 290 M100 217 L119 290" />
      </g>
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
