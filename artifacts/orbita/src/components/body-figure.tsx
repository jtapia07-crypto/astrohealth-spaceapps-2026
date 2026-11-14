import type { HotspotId, HotspotReport } from '@/lib/health';
import { LEVEL_COLOR, LEVEL_LABEL } from '@/lib/health';

/** x/y: anchor on the body. lx: label x. ly: optional label y (to avoid overlaps). */
const POS: Record<HotspotId, { x: number; y: number; lx: number; ly?: number; side: 'l' | 'r' }> = {
  cabeza: { x: 100, y: 22, lx: 172, side: 'r' },
  ojos: { x: 85.5, y: 41, lx: 30, ly: 38, side: 'l' },
  saliva: { x: 100, y: 61, lx: 26, ly: 68, side: 'l' },
  sudor: { x: 58, y: 112, lx: 10, side: 'l' },
  corazon: { x: 106, y: 126, lx: 178, side: 'r' },
  sangre: { x: 40, y: 178, lx: 8, side: 'l' },
  musculo: { x: 121, y: 292, lx: 178, side: 'r' },
  huesos: { x: 81, y: 352, lx: 20, side: 'l' },
};

const BODY = `M91 67
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
  L114 82 Q108 78 109 67 Z`;

const HEAD = `M100 9 Q88 9 83.5 19 Q80.5 27 81.5 37 Q79 37 79 41 Q79.5 47 83 48.5
  Q85 58 90 64 Q95 69.5 100 69.5 Q105 69.5 110 64 Q115 58 117 48.5
  Q120.5 47 121 41 Q121 37 118.5 37 Q119.5 27 116.5 19 Q112 9 100 9 Z`;

export function BodyFigure({ reports, active, onSelect }: { reports: HotspotReport[]; active: HotspotId | null; onSelect: (id: HotspotId) => void }) {
  return (
    <svg viewBox="-40 0 280 450" className="h-full w-full" role="group" aria-label="Translucent human body with interactive health points">
      <defs>
        <linearGradient id="bf-skin" x1="0" x2="1">
          <stop offset="0" stopColor="hsl(205 45% 46% / .30)" />
          <stop offset=".3" stopColor="hsl(200 40% 62% / .20)" />
          <stop offset=".5" stopColor="hsl(195 35% 70% / .14)" />
          <stop offset=".72" stopColor="hsl(205 40% 58% / .20)" />
          <stop offset="1" stopColor="hsl(215 45% 40% / .34)" />
        </linearGradient>
        <radialGradient id="bf-sheen" cx=".38" cy=".2" r=".75">
          <stop offset="0" stopColor="hsl(190 60% 90% / .16)" />
          <stop offset="1" stopColor="hsl(220 40% 10% / 0)" />
        </radialGradient>
        <radialGradient id="bf-aura"><stop offset="0" stopColor="hsl(195 70% 55% / .14)" /><stop offset=".6" stopColor="hsl(22 95% 58% / .05)" /><stop offset="1" stopColor="transparent" /></radialGradient>
        <radialGradient id="bf-lung" cx=".45" cy=".4" r=".7">
          <stop offset="0" stopColor="hsl(205 75% 72% / .42)" />
          <stop offset="1" stopColor="hsl(215 70% 50% / .26)" />
        </radialGradient>
        <radialGradient id="bf-heart" cx=".38" cy=".32" r=".8">
          <stop offset="0" stopColor="hsl(2 85% 70%)" />
          <stop offset=".55" stopColor="hsl(354 72% 52%)" />
          <stop offset="1" stopColor="hsl(348 70% 34%)" />
        </radialGradient>
        <radialGradient id="bf-liver" cx=".35" cy=".3" r=".85">
          <stop offset="0" stopColor="hsl(8 70% 60% / .85)" />
          <stop offset="1" stopColor="hsl(352 62% 36% / .8)" />
        </radialGradient>
        <radialGradient id="bf-stomach" cx=".4" cy=".35" r=".8">
          <stop offset="0" stopColor="hsl(88 50% 62% / .75)" />
          <stop offset="1" stopColor="hsl(120 38% 36% / .7)" />
        </radialGradient>
        <radialGradient id="bf-kidney" cx=".4" cy=".35" r=".8">
          <stop offset="0" stopColor="hsl(6 70% 64% / .7)" />
          <stop offset="1" stopColor="hsl(350 60% 38% / .65)" />
        </radialGradient>
        <linearGradient id="bf-airway" x1="0" x2="1">
          <stop offset="0" stopColor="hsl(150 45% 50% / .6)" />
          <stop offset=".5" stopColor="hsl(140 50% 70% / .8)" />
          <stop offset="1" stopColor="hsl(150 45% 50% / .6)" />
        </linearGradient>
        <clipPath id="bf-clip"><path d={BODY} /><path d={HEAD} /></clipPath>
      </defs>

      <ellipse cx="100" cy="220" rx="140" ry="220" fill="url(#bf-aura)" />
      <ellipse cx="100" cy="437" rx="44" ry="3.2" fill="hsl(220 35% 5% / .5)" />

      {/* Translucent skin */}
      <g fill="url(#bf-skin)" stroke="hsl(195 55% 78% / .45)" strokeWidth=".8" strokeLinejoin="round">
        <path d={BODY} />
        <path d={HEAD} />
        <path d="M93 66 L93 78 M107 66 L107 78" fill="none" strokeOpacity=".35" />
      </g>
      <path d={BODY} fill="url(#bf-sheen)" pointerEvents="none" />
      {/* Ear hints */}
      <g fill="none" stroke="hsl(195 50% 80% / .35)" strokeWidth=".7">
        <path d="M81 39 Q80.6 43 82.5 46 M119 39 Q119.4 43 117.5 46" />
      </g>

      <g clipPath="url(#bf-clip)" pointerEvents="none">
        {/* Subtle muscular relief */}
        <g stroke="hsl(195 45% 80% / .14)" strokeWidth=".8" fill="none" strokeLinecap="round">
          <path d="M70 100 Q84 94 97 101 M103 101 Q116 94 130 100 M52 108 Q58 114 56 128 M148 108 Q142 114 144 128" />
          <path d="M72 241 Q78 275 80 307 M128 241 Q122 275 120 307 M77 341 Q81 365 80 393 M123 341 Q119 365 120 393" />
          <path d="M78 324 Q82 320 86 325 M114 325 Q118 320 122 324 M39 178 Q44 182 43 195 M161 178 Q156 182 157 195" />
        </g>

        {/* Major vessels: arteries (red) and veins (blue), branching into limbs */}
        <g fill="none" strokeLinecap="round">
          <g stroke="hsl(355 75% 58% / .42)" strokeWidth="1.1">
            <path d="M104 128 Q103 170 102 226 Q101 236 96 244 Q90 262 86 300 Q83 330 82 370 Q81 395 80 420" />
            <path d="M102 226 Q104 236 107 244 Q111 262 114 300 Q116 330 118 370 Q119 395 120 420" />
            <path d="M101 112 Q90 98 72 96 Q58 100 52 116 Q47 140 44 160 Q40 185 36 210 Q31 230 29 250" />
            <path d="M107 108 Q118 98 130 96 Q144 100 148 116 Q153 140 156 160 Q160 185 164 210 Q169 230 171 250" />
            <path d="M101 106 Q98 88 96 72 Q95 60 93 52 M106 106 Q104 88 104 72 Q105 60 107 52" />
          </g>
          <g stroke="hsl(215 75% 64% / .38)" strokeWidth="1">
            <path d="M98 130 Q98 170 99 226 Q98 236 93 245 Q87 265 83 300 Q80 330 79 370 Q78 395 77 420" />
            <path d="M99 226 Q102 236 104 245 Q109 265 112 300 Q114 330 116 370 Q117 395 117 420" />
            <path d="M97 114 Q86 102 70 101 Q56 106 50 124 Q45 146 42 166 Q38 190 33 214" />
            <path d="M109 112 Q118 102 132 101 Q146 106 150 124 Q155 146 158 166 Q162 190 167 214" />
          </g>
        </g>

        {/* Airway: larynx + ringed trachea + bronchi */}
        <path d="M96.6 63 Q100 60 103.4 63 L103 70 Q100 72 97 70 Z" fill="url(#bf-airway)" opacity=".75" />
        <rect x="97.4" y="70" width="5.2" height="32" rx="2.4" fill="url(#bf-airway)" opacity=".75" />
        <g stroke="hsl(140 55% 82% / .55)" strokeWidth=".6">
          {[73, 76, 79, 82, 85, 88, 91, 94, 97, 100].map((y) => <line key={y} x1="97.6" x2="102.4" y1={y} y2={y} />)}
        </g>

        {/* Lungs */}
        <path d="M96 100 Q90 92 82 94 Q70 100 66 118 Q63 136 65 152 Q66 160 74 159 Q84 156 94 156 Q98 153 97 140 Q97 118 96 100 Z"
          fill="url(#bf-lung)" stroke="hsl(205 80% 78% / .55)" strokeWidth=".8" />
        <path d="M104 100 Q110 92 118 94 Q130 100 134 118 Q137 136 135 152 Q134 160 126 159 Q120 157 116 154 Q118 146 114 140 Q110 132 104 132 Q103 118 104 100 Z"
          fill="url(#bf-lung)" stroke="hsl(205 80% 78% / .55)" strokeWidth=".8" />
        {/* Bronchial tree */}
        <g fill="none" strokeLinecap="round">
          <path d="M100 102 Q96 106 90 110 M100 102 Q104 106 110 110" stroke="url(#bf-airway)" strokeWidth="2.4" />
          <g stroke="hsl(355 70% 62% / .65)" strokeWidth=".7">
            <path d="M90 110 Q84 114 80 122 Q76 130 74 142 M84 116 Q78 116 72 120 M80 122 Q84 130 85 140 M76 130 Q71 134 69 140 M74 142 Q72 148 72 152 M85 140 Q88 146 90 150 M80 122 Q76 118 74 112 M90 110 Q88 104 84 100" />
            <path d="M110 110 Q116 114 120 122 Q124 130 126 142 M116 116 Q122 116 128 120 M120 122 Q118 130 119 138 M124 130 Q129 134 131 140 M126 142 Q128 148 128 152 M120 122 Q124 118 126 112 M110 110 Q112 104 116 100" />
          </g>
          <g stroke="hsl(210 80% 70% / .55)" strokeWidth=".5">
            <path d="M78 126 Q74 128 71 126 M82 134 Q78 138 78 144 M87 124 Q90 128 92 126 M72 120 Q69 116 70 110" />
            <path d="M122 126 Q126 128 129 126 M118 134 Q120 140 121 146 M113 124 Q110 128 108 126 M128 120 Q131 116 130 110" />
          </g>
        </g>

        {/* Heart with great vessels */}
        <path d="M103 110 Q103 100 108 99 Q114 99 113 106" fill="none" stroke="hsl(354 72% 52%)" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M100 112 Q99 104 98 100" fill="none" stroke="hsl(215 65% 55%)" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M99.5 115 Q104 108 111 110 Q120 112 121 122 Q122 132 115 140 Q109 146 104 148 Q100 142 97 134 Q94 124 99.5 115 Z"
          fill="url(#bf-heart)" stroke="hsl(350 75% 30% / .6)" strokeWidth=".6" />
        <g fill="none" stroke="hsl(355 90% 82% / .45)" strokeWidth=".6" strokeLinecap="round">
          <path d="M107 114 Q106 128 104 146 M111 118 Q116 124 115 134" />
          <path d="M100 118 Q104 122 108 120" stroke="hsl(215 70% 72% / .55)" />
        </g>

        {/* Diaphragm hint */}
        <path d="M66 160 Q100 150 134 160" fill="none" stroke="hsl(30 50% 75% / .18)" strokeWidth="1" />

        {/* Liver (person's right = viewer's left) */}
        <path d="M68 164 Q84 156 104 160 Q110 162 108 166 Q102 172 94 178 Q84 184 74 182 Q66 178 68 164 Z"
          fill="url(#bf-liver)" stroke="hsl(355 70% 30% / .5)" strokeWidth=".6" />
        <path d="M86 162 Q88 170 84 180" fill="none" stroke="hsl(10 70% 75% / .3)" strokeWidth=".6" />
        <ellipse cx="84" cy="181" rx="3" ry="2" fill="hsl(95 55% 45% / .7)" />

        {/* Stomach */}
        <path d="M108 160 Q114 155 121 158 Q130 163 129 175 Q128 186 119 190 Q110 193 102 189 Q99 186 102 184 Q110 184 114 178 Q117 172 112 166 Q108 164 108 160 Z"
          fill="url(#bf-stomach)" stroke="hsl(110 45% 28% / .55)" strokeWidth=".6" />
        <path d="M112 164 Q122 166 122 176 Q120 184 112 186" fill="none" stroke="hsl(90 50% 80% / .3)" strokeWidth=".6" />

        {/* Kidneys peeking behind */}
        <path d="M76 190 Q72 196 74 203 Q77 208 81 205 Q79 198 81 192 Q79 188 76 190 Z" fill="url(#bf-kidney)" opacity=".75" />
        <path d="M124 190 Q128 196 126 203 Q123 208 119 205 Q121 198 119 192 Q121 188 124 190 Z" fill="url(#bf-kidney)" opacity=".75" />

        {/* Large intestine frame */}
        <path d="M80 240 Q76 228 77 212 Q77 198 84 195 Q100 192 116 195 Q123 198 123 212 Q124 228 120 240 Q116 247 108 246 Q102 246 101 252 L101 258"
          fill="none" stroke="hsl(120 42% 52% / .62)" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M80 240 Q76 228 77 212 Q77 198 84 195 Q100 192 116 195 Q123 198 123 212 Q124 228 120 240 Q116 247 108 246 Q102 246 101 252 L101 258"
          fill="none" stroke="hsl(110 45% 30% / .45)" strokeWidth="6.5" strokeDasharray=".8 3.2" />
        <path d="M101 258 Q101 262 100.5 264" stroke="hsl(355 65% 60% / .7)" strokeWidth="4" strokeLinecap="round" fill="none" />

        {/* Small intestine coils */}
        <g fill="none" stroke="hsl(212 70% 66% / .62)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M86 204 Q90 200 94 204 Q98 208 102 204 Q106 200 110 204 Q114 208 116 204" />
          <path d="M116 212 Q112 216 108 212 Q104 208 100 212 Q96 216 92 212 Q88 208 85 212" />
          <path d="M85 220 Q89 224 93 220 Q97 216 101 220 Q105 224 109 220 Q113 216 116 220" />
          <path d="M116 228 Q112 232 108 228 Q104 224 100 228 Q96 232 92 228 Q88 224 86 228" />
          <path d="M88 236 Q92 240 96 236 Q100 232 104 236 Q108 240 112 236" />
        </g>
        <g fill="none" stroke="hsl(210 80% 85% / .25)" strokeWidth=".6">
          <path d="M86 204 Q90 200 94 204 Q98 208 102 204 Q106 200 110 204 M85 220 Q89 224 93 220 Q97 216 101 220 Q105 224 109 220" />
        </g>
      </g>

      {/* Face: brows, eyes, nose, lips — subtle, anatomical */}
      <g pointerEvents="none">
        <path d="M86.5 35.6 Q91.5 33.4 96.5 35.4 M103.5 35.4 Q108.5 33.4 113.5 35.6" fill="none" stroke="hsl(30 25% 70% / .55)" strokeWidth="1" strokeLinecap="round" />
        {[92, 108].map((cx) => (
          <g key={cx}>
            <path d={`M${cx - 4.6} 40.6 Q${cx} 37.4 ${cx + 4.6} 40.6 Q${cx} 43.4 ${cx - 4.6} 40.6 Z`} fill="hsl(40 30% 90% / .88)" stroke="hsl(210 30% 30% / .7)" strokeWidth=".45" />
            <circle cx={cx} cy="40.5" r="1.75" fill="hsl(196 52% 42%)" />
            <circle cx={cx} cy="40.5" r=".8" fill="hsl(225 40% 10%)" />
            <circle cx={cx - .6} cy="39.9" r=".35" fill="hsl(40 40% 97%)" />
            <path d={`M${cx - 4.6} 40.6 Q${cx} 37.4 ${cx + 4.6} 40.6`} fill="none" stroke="hsl(215 35% 22% / .8)" strokeWidth=".55" />
          </g>
        ))}
        <path d="M100 42 L98.4 50.5 Q100 51.6 101.6 50.5" fill="none" stroke="hsl(195 40% 82% / .4)" strokeWidth=".7" strokeLinecap="round" />
        <path d="M95.6 57 Q100 55.6 104.4 57 Q100 59.6 95.6 57 Z" fill="hsl(355 40% 62% / .55)" />
      </g>

      {reports.map((r) => {
        const p = POS[r.id]; if (!p) return null;
        const c = LEVEL_COLOR[r.level]; const on = active === r.id;
        const ly = p.ly ?? p.y;
        const anchor = p.side === 'r' ? 'start' : 'end';
        const lineEnd = p.side === 'r' ? p.lx - 3 : p.lx + 3;
        return (
          <g key={r.id} className="cursor-pointer outline-none [&:focus-visible_.focus-ring]:opacity-100" onClick={() => onSelect(r.id)} data-testid={`hotspot-${r.id}`} role="button" tabIndex={0}
            aria-label={`${r.label}: ${LEVEL_LABEL[r.level]}, ${r.score} of 100. Open report`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(r.id); } }}>
            <polyline points={`${p.x},${p.y} ${(p.x + lineEnd) / 2},${ly} ${lineEnd},${ly}`} fill="none" stroke={c} strokeOpacity={on ? 0.9 : 0.45} strokeWidth=".9" strokeDasharray="2 2" />
            <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
            <circle cx={p.x} cy={p.y} r="10" fill="none" stroke="hsl(40 33% 91%)" strokeWidth="1.2" className="focus-ring" opacity="0" />
            <circle cx={p.x} cy={p.y} r={r.id === 'ojos' ? 5 : 6.5} fill={c} className="hotspot-ring" opacity=".45" />
            <circle cx={p.x} cy={p.y} r={on ? 5.5 : r.id === 'ojos' ? 3 : 4.2} fill={c} stroke="hsl(226 45% 7%)" strokeWidth="1.6" />
            <text x={p.lx} y={ly - 3} textAnchor={anchor} fill={on ? c : 'hsl(40 33% 91%)'} fontSize="10" fontFamily="Chakra Petch" fontWeight="600" letterSpacing="1">{r.label.toUpperCase()}</text>
            <text x={p.lx} y={ly + 8} textAnchor={anchor} fill={c} fontSize="8.5" fontFamily="JetBrains Mono">{r.score}/100</text>
          </g>
        );
      })}
    </svg>
  );
}
