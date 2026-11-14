import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import type { HotspotId } from '@/lib/health';
import { OrganLines, ORGAN_LINE_META } from './organ-lines';

function useReducedMotion() {
  const [r, setR] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const f = () => setR(m.matches); m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return r;
}

export function OrganVisual({ id }: { id: HotspotId }) {
  const media = ORGAN_LINE_META[id];
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(!reduced);
  useEffect(() => setPlaying(!reduced), [reduced, id]);
  return (
    <figure className="organ-figure neon-figure relative overflow-hidden rounded-2xl border border-border" data-playing={playing} data-organ={id} data-testid={`media-organ-${id}`}>
      <div className="relative aspect-[4/5] w-full">
        <div className="neon-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="absolute inset-0 p-6"><OrganLines id={id} /></div>
        <button type="button" onClick={() => setPlaying((p) => !p)} data-testid="button-toggle-animation" aria-pressed={!playing}
          className="absolute right-2 top-2 flex items-center gap-1.5 rounded-full border border-border/60 bg-card/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground backdrop-blur transition hover:border-primary focus-visible:outline-2 focus-visible:outline-primary">
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{playing ? 'Pause' : 'Play'}
        </button>
      </div>
      <figcaption className="flex items-center justify-between gap-2 bg-card px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{media.caption}</span><span className="text-[#33C1AE]">Educational animation · {media.motion}</span>
      </figcaption>
      <p className="bg-card px-3 pb-2 text-[10px] leading-snug text-muted-foreground">Illustration only. The motion is not driven by measured physiology or live telemetry.</p>
    </figure>
  );
}
