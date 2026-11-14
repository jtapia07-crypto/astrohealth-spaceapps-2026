const GLINTS = [
  [8, 14, 0], [22, 62, 1.2], [37, 28, 2.4], [51, 81, 0.6], [64, 11, 3.1], [78, 47, 1.8], [91, 73, 2.9], [14, 88, 3.6], [71, 92, 0.9], [45, 52, 2.1], [86, 22, 1.4], [29, 41, 3.3],
] as const;

/** Decorative galaxy / nebula backdrop. Purely visual, never intercepts input. */
export function SpaceBackdrop({ variant }: { variant: 'human' | 'garden' }) {
  const neb = variant === 'human'
    ? ['hsl(352 70% 45% / .55)', 'hsl(172 58% 40% / .45)', 'hsl(250 50% 40% / .5)']
    : ['hsl(150 55% 38% / .5)', 'hsl(22 90% 50% / .4)', 'hsl(200 60% 40% / .45)'];
  return (
    <div className="space-bg" style={{ zIndex: -1 }} aria-hidden data-testid={`backdrop-${variant}`}>
      <div className="band" />
      <div className="neb" style={{ left: '-8%', top: '6%', width: '42vw', height: '36vw', background: neb[0] }} />
      <div className="neb" style={{ right: '-10%', top: '30%', width: '38vw', height: '30vw', background: neb[1], animationDelay: '-12s' }} />
      <div className="neb" style={{ left: '30%', bottom: '-12%', width: '46vw', height: '28vw', background: neb[2], animationDelay: '-24s' }} />
      {GLINTS.map(([x, y, d], i) => <span key={i} className="glint" style={{ left: x + '%', top: y + '%', animationDelay: d + 's' }} />)}
    </div>
  );
}
