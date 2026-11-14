import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import type { HotspotId } from '@/lib/health';
import { ORGAN_MEDIA } from './organ-media';
import { OrganFx } from './organ-fx';

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
  const media = ORGAN_MEDIA[id];
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(!reduced);
  useEffect(() => setPlaying(!reduced), [reduced, id]);
  return (
    <figure className="organ-figure relative overflow-hidden rounded-2xl border border-border bg-[hsl(36_30%_95%)]" data-playing={playing} data-organ={id} data-testid={`media-organ-${id}`}>
      <div className="relative aspect-[4/5] w-full">
        <img src={media.src} alt={media.alt} className={`organ-img fx-img-${id} absolute inset-0 h-full w-full ${id === 'corazon' ? 'object-contain p-5' : 'object-cover'}`} draggable={false} />
        <div className="pointer-events-none absolute inset-0" aria-hidden><OrganFx id={id} /></div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_10%,transparent_55%,hsl(226_40%_10%/.35))]" />
        <button type="button" onClick={() => setPlaying((p) => !p)} data-testid="button-toggle-animation" aria-pressed={!playing}
          className="absolute right-2 top-2 flex items-center gap-1.5 rounded-full border border-border/60 bg-card/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground backdrop-blur transition hover:border-primary focus-visible:outline-2 focus-visible:outline-primary">
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{playing ? 'Pause' : 'Play'}
        </button>
      </div>
      <figcaption className="flex items-center justify-between gap-2 bg-card px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{media.caption}</span><span className="text-primary">Educational animation · {media.motion}</span>
      </figcaption>
      <p className="bg-card px-3 pb-2 text-[10px] leading-snug text-muted-foreground">Illustration only. The motion is not driven by measured physiology or live telemetry.</p>
    </figure>
  );
}
