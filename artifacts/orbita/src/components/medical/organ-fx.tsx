import type { HotspotId } from '@/lib/health';

/** Decorative overlay layers per organ. Purely illustrative, never driven by data. */
export function OrganFx({ id }: { id: HotspotId }) {
  switch (id) {
    case 'cabeza':
      return <>{[[30, 38], [55, 30], [68, 52], [42, 58], [60, 42]].map(([x, y], i) => <span key={i} className="fx-neuron" style={{ left: x + '%', top: y + '%', animationDelay: i * 0.45 + 's' }} />)}</>;
    case 'ojos':
      return <><span className="fx-lid fx-lid-top" /><span className="fx-lid fx-lid-bottom" /><span className="fx-focus" /></>;
    case 'huesos':
      return <><span className="fx-scan" /><span className="fx-bone-glow" /></>;
    case 'sangre':
      return <>{Array.from({ length: 7 }).map((_, i) => <span key={i} className="fx-cell" style={{ top: 22 + (i * 9) % 56 + '%', animationDelay: -i * 0.6 + 's' }} />)}</>;
    case 'sudor':
      return <>{[22, 41, 58, 76].map((x, i) => <span key={x} className="fx-drop" style={{ left: x + '%', animationDelay: i * 0.7 + 's' }} />)}</>;
    case 'saliva':
      return <>{[0, 1, 2, 3].map((i) => <span key={i} className="fx-saliva" style={{ animationDelay: i * 0.55 + 's' }} />)}</>;
    default:
      return null;
  }
}
