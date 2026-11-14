import type { Climate, PlantType } from '@/lib/types';
import type { Weather } from '@/lib/scores';

const SKY: Record<Weather, [string, string]> = { soleado: ['hsl(200 70% 62%)', 'hsl(40 85% 80%)'], nublado: ['hsl(215 20% 45%)', 'hsl(215 18% 68%)'], tormenta: ['hsl(232 35% 14%)', 'hsl(240 22% 30%)'] };
const PLANT_EN: Record<PlantType, string> = { helecho: 'Fern', girasol: 'Sunflower', suculenta: 'Succulent', bonsai: 'Bonsai' };
const CLIMATE_EN: Record<Climate, string> = { bosque: 'temperate forest', desierto: 'desert', tropical: 'tropical', tundra: 'tundra' };
const WEATHER_EN: Record<Weather, string> = { soleado: 'sunny', nublado: 'cloudy', tormenta: 'stormy' };
const GROUND: Record<Climate, string> = { bosque: 'hsl(140 30% 24%)', desierto: 'hsl(32 55% 52%)', tropical: 'hsl(150 45% 30%)', tundra: 'hsl(200 20% 82%)' };

export function PlantScene({ plant, climate, weather, stage, health, empty }: { plant: PlantType; climate: Climate; weather: Weather; stage: number; health: number; empty: boolean }) {
  const [top, bottom] = SKY[weather];
  const leaf = health >= 70 ? 'hsl(120 48% 46%)' : health >= 45 ? 'hsl(78 45% 45%)' : 'hsl(40 45% 42%)';
  const droop = health < 45 ? 18 : health < 70 ? 8 : 0;
  const h = empty ? 14 : 40 + stage * 26;
  const leaves = empty ? 0 : 1 + stage;
  return (
    <svg viewBox="0 0 400 320" className="h-full w-full" role="img" aria-label={`${PLANT_EN[plant]} plant in a ${CLIMATE_EN[climate]} setting, ${WEATHER_EN[weather]} weather`}>
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient></defs>
      <rect width="400" height="320" fill="url(#sky)" />
      {weather === 'soleado' && <g><circle cx="320" cy="62" r="30" fill="hsl(44 95% 62%)" /><circle cx="320" cy="62" r="44" fill="hsl(44 95% 62% / .2)" className="hotspot-ring" /></g>}
      {weather !== 'soleado' && <g className="cloud" fill={weather === 'tormenta' ? 'hsl(235 20% 26%)' : 'hsl(210 20% 88%)'}>
        <ellipse cx="90" cy="60" rx="50" ry="20" /><ellipse cx="125" cy="48" rx="34" ry="22" /><ellipse cx="270" cy="72" rx="56" ry="22" /><ellipse cx="300" cy="58" rx="30" ry="20" /></g>}
      {weather === 'tormenta' && <>
        <g className="rain" stroke="hsl(200 60% 75% / .55)" strokeWidth="1.5">{Array.from({ length: 28 }).map((_, i) => <line key={i} x1={i * 15 + 4} y1={80 + (i % 5) * 30} x2={i * 15} y2={92 + (i % 5) * 30} style={{ animationDelay: (i % 7) * 0.09 + 's' }} />)}</g>
        <path className="lightning" d="M262 84 L248 124 L262 124 L246 168 L280 114 L264 114 L276 84 Z" fill="hsl(50 100% 75%)" />
      </>}
      <path d={climate === 'desierto' ? 'M0 250 Q100 225 200 245 T400 240 V320 H0Z' : 'M0 255 Q120 240 220 252 T400 248 V320 H0Z'} fill={GROUND[climate]} />
      {climate === 'tundra' && <g fill="hsl(0 0% 98% / .8)">{[30, 80, 330, 370].map((x) => <circle key={x} cx={x} cy={258} r="3" />)}</g>}
      {climate === 'desierto' && <path d="M40 252 v-30 m0 12 h-8 v-10 M40 236 h8 v-12" stroke="hsl(110 30% 36%)" strokeWidth="6" strokeLinecap="round" fill="none" />}
      {climate === 'tropical' && <path d="M360 250 Q356 200 366 170 M366 170 q-30 -6 -42 10 M366 170 q30 -8 36 10 M366 170 q-8 -26 -28 -28" stroke="hsl(140 40% 28%)" strokeWidth="5" fill="none" strokeLinecap="round" />}
      {climate === 'bosque' && <g fill="hsl(150 35% 20%)"><path d="M30 255 l20 -60 l20 60z" /><path d="M350 255 l18 -52 l18 52z" /></g>}
      <path d="M160 248 h80 l-10 52 h-60z" fill="hsl(22 70% 48%)" /><rect x="154" y="242" width="92" height="12" rx="3" fill="hsl(22 70% 40%)" />
      <text x="200" y="282" textAnchor="middle" fontFamily="Chakra Petch" fontSize="10" fill="hsl(40 40% 92%)" letterSpacing="2">ÓRBITA</text>
      <g className="sway">
        {empty ? <circle cx="200" cy="238" r="5" fill="hsl(30 40% 30%)" /> : <>
          <path d={`M200 244 Q${196 + droop / 3} ${244 - h / 2} ${200 + droop} ${244 - h}`} stroke={plant === 'bonsai' ? 'hsl(25 35% 32%)' : 'hsl(110 40% 34%)'} strokeWidth={plant === 'bonsai' ? 8 : 4} fill="none" strokeLinecap="round" />
          {Array.from({ length: leaves }).map((_, i) => {
            const y = 236 - ((i + 1) * h) / (leaves + 1); const side = i % 2 ? 1 : -1;
            if (plant === 'suculenta') return <ellipse key={i} cx={200 + side * 12} cy={y + 6} rx="14" ry="7" fill={leaf} transform={`rotate(${side * -25 + droop} ${200 + side * 12} ${y + 6})`} />;
            if (plant === 'helecho') return <path key={i} d={`M200 ${y} q${side * 30} -14 ${side * 52} ${8 + droop}`} stroke={leaf} strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray="5 2" />;
            if (plant === 'bonsai') return <ellipse key={i} cx={200 + side * 22} cy={y - 4} rx="26" ry="13" fill={leaf} opacity=".9" />;
            return <path key={i} d={`M200 ${y} q${side * 18} -18 ${side * 34} ${-2 + droop}  q${-side * 16} 14 ${-side * 34} ${2 - droop}`} fill={leaf} />;
          })}
          {plant === 'girasol' && stage >= 3 && <g transform={`translate(${200 + droop} ${244 - h})`}>{Array.from({ length: 12 }).map((_, i) => <ellipse key={i} cx="0" cy="-16" rx="5" ry="11" fill="hsl(44 95% 58%)" transform={`rotate(${i * 30})`} />)}<circle r="10" fill="hsl(25 50% 26%)" /></g>}
          {plant !== 'girasol' && stage >= 4 && health >= 70 && <circle cx={200 + droop} cy={244 - h} r="6" fill={plant === 'suculenta' ? 'hsl(340 70% 70%)' : 'hsl(22 95% 66%)'} />}
        </>}
      </g>
    </svg>
  );
}
