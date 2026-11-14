import type { PartState, Ship } from '@/lib/types';
export type PartId = 'windows' | 'thrusters' | 'solar' | 'hull' | 'comms';
const C: Record<PartState, string> = { nominal: 'hsl(172 58% 52%)', degradado: 'hsl(46 92% 62%)', falla: 'hsl(352 82% 60%)' };

export function ShipExterior({ ship, onPart, onEnter, active }: { ship: Ship; onPart: (p: PartId) => void; onEnter: () => void; active: PartId | null }) {
  const ring = (p: PartId) => (active === p ? 'hsl(22 95% 62%)' : C[ship[p]]);
  const flameOn = ship.thrusters !== 'falla';
  return (
    <svg viewBox="0 0 640 300" className="h-full w-full" role="img" aria-label="Exterior de la nave">
      <circle cx="560" cy="250" r="140" fill="hsl(210 50% 30% / .35)" /><circle cx="560" cy="250" r="140" fill="none" stroke="hsl(195 70% 60% / .25)" strokeWidth="6" />
      <g onClick={() => onPart('thrusters')} className="cursor-pointer" data-testid="part-thrusters">
        {flameOn && [130, 170].map((y) => <path key={y} className="flame" d={`M118 ${y - 9} L${ship.thrusters === 'degradado' ? 82 : 52} ${y} L118 ${y + 9} Z`} fill="hsl(22 95% 58% / .85)" />)}
        {[130, 170].map((y) => <path key={'n' + y} d={`M150 ${y - 16} L118 ${y - 11} L118 ${y + 11} L150 ${y + 16} Z`} fill="hsl(224 18% 40%)" stroke={ring('thrusters')} strokeWidth="2" />)}
      </g>
      <g onClick={() => onPart('solar')} className="cursor-pointer" data-testid="part-solar">
        {[[220, 14], [220, 226]].map(([x, y]) => <g key={y}><line x1={x + 70} y1={y < 100 ? y + 60 : y} x2={x + 70} y2={y < 100 ? 104 : 196} stroke="hsl(224 15% 55%)" strokeWidth="3" />
          <rect x={x} y={y} width="140" height="60" rx="3" fill="hsl(225 55% 25%)" stroke={ring('solar')} strokeWidth="2" opacity={ship.solar === 'falla' ? 0.45 : 1} />
          {[1, 2, 3, 4, 5, 6].map((i) => <line key={i} x1={x + i * 20} y1={y} x2={x + i * 20} y2={y + 60} stroke="hsl(200 60% 60% / .35)" />)}<line x1={x} y1={y + 30} x2={x + 140} y2={y + 30} stroke="hsl(200 60% 60% / .35)" /></g>)}
      </g>
      <g onClick={() => onPart('hull')} className="cursor-pointer" data-testid="part-hull">
        <path d="M150 104 L420 104 Q480 104 500 150 Q480 196 420 196 L150 196 Z" fill="hsl(40 15% 82%)" stroke={ring('hull')} strokeWidth="3" />
        {[200, 260, 320, 380].map((x) => <line key={x} x1={x} y1="104" x2={x} y2="196" stroke="hsl(224 15% 60% / .5)" />)}
        {ship.hull !== 'nominal' && <path d="M300 110 l8 14 l-6 6 l10 14" stroke="hsl(352 70% 45%)" strokeWidth="2" fill="none" />}
      </g>
      <g onClick={(e) => { e.stopPropagation(); onEnter(); }} className="cursor-pointer" data-testid="button-enter-ship">
        <rect x="236" y="124" width="128" height="52" rx="10" fill="hsl(22 95% 58%)" />
        <text x="300" y="148" textAnchor="middle" fontFamily="Chakra Petch" fontWeight="700" fontSize="13" fill="hsl(226 45% 7%)" letterSpacing="1.5">ENTRAR</text>
        <text x="300" y="164" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="hsl(226 45% 12%)">ver interior</text>
      </g>
      <g onClick={() => onPart('windows')} className="cursor-pointer" data-testid="part-windows">
        {[436, 462].map((x) => <circle key={x} cx={x} cy="150" r="9" fill={ship.windows === 'falla' ? 'hsl(352 60% 30%)' : 'hsl(195 75% 55%)'} stroke={ring('windows')} strokeWidth="3" />)}
        <circle cx="180" cy="150" r="9" fill="hsl(195 75% 55%)" stroke={ring('windows')} strokeWidth="3" />
      </g>
      <g onClick={() => onPart('comms')} className="cursor-pointer" data-testid="part-comms">
        <line x1="400" y1="104" x2="410" y2="62" stroke="hsl(224 15% 55%)" strokeWidth="3" />
        <path d="M388 56 Q410 30 434 56 Z" fill="hsl(40 15% 86%)" stroke={ring('comms')} strokeWidth="2.5" />
        {ship.comms !== 'falla' && [16, 26, 36].map((r) => <path key={r} d={`M${420 + r} ${40 - r / 2} q${r / 3} ${r / 2} 0 ${r}`} stroke={ring('comms')} fill="none" opacity=".6" className="hotspot-ring" />)}
      </g>
    </svg>
  );
}
