import type { ReactNode } from 'react';
import type { HotspotId } from '@/lib/health';

export const NEON = '#33C1AE';

export const ORGAN_LINE_META: Record<HotspotId, { alt: string; caption: string; motion: string }> = {
  cabeza: { alt: 'Neon line drawing of the brain in side view with lobes, cerebellum and brainstem', caption: 'Brain · lateral view', motion: 'Neural pulse' },
  ojos: { alt: 'Neon line drawing of an eye cross-section with cornea, lens, retina and optic nerve', caption: 'Eye · sagittal section', motion: 'Blink and focus' },
  corazon: { alt: 'Neon line drawing of the heart with aorta, vena cava and coronary vessels', caption: 'Heart · anterior view', motion: 'Heartbeat cycle' },
  huesos: { alt: 'Neon line drawing of the pelvis and femur', caption: 'Hip and femur', motion: 'Density scan' },
  musculo: { alt: 'Neon line drawing of the calf muscles with Achilles tendon', caption: 'Calf · postural muscle', motion: 'Contraction' },
  sangre: { alt: 'Neon line drawing of red blood cells flowing in a cut-away vessel', caption: 'Red cells in a vessel', motion: 'Cell flow' },
  sudor: { alt: 'Neon line drawing of a skin section with a coiled eccrine sweat gland and duct', caption: 'Skin · eccrine gland', motion: 'Droplet formation' },
  saliva: { alt: 'Neon line drawing of a head profile with parotid, submandibular and sublingual glands', caption: 'Salivary glands', motion: 'Secretion flow' },
};

const DRAW: Record<HotspotId, ReactNode> = {
  cabeza: (
    <>
      <path d="M52 112 Q38 80 60 58 Q80 34 116 38 Q152 36 168 62 Q184 88 172 112 Q166 128 148 130 Q136 140 118 134 Q100 142 84 132 Q62 132 52 112 Z" />
      <path d="M86 46 Q92 70 82 92 M118 40 Q112 64 124 84 Q132 98 120 112 M146 54 Q138 72 150 90 M64 96 Q86 98 102 88 Q120 80 140 96 Q154 104 168 100" className="nl-soft" />
      <path d="M140 130 Q160 150 150 160 Q132 168 120 154 Q118 142 124 136" />
      <path d="M144 140 Q140 150 130 154 M148 148 Q140 156 132 158" className="nl-soft" />
      <path d="M112 136 Q110 160 116 182 M104 138 Q102 160 106 184" />
      <circle className="nl-node" cx="96" cy="70" r="2.4" /><circle className="nl-node nl-d2" cx="134" cy="66" r="2.4" /><circle className="nl-node nl-d3" cx="110" cy="104" r="2.4" />
    </>
  ),
  ojos: (
    <>
      <circle cx="110" cy="100" r="58" />
      <path d="M58 72 Q40 100 58 128" />
      <path d="M58 76 Q46 100 58 124" className="nl-soft" />
      <ellipse cx="70" cy="100" rx="9" ry="20" />
      <path d="M64 72 L64 84 M64 116 L64 128" />
      <path d="M90 52 Q150 50 164 100 Q150 150 90 148" className="nl-soft" />
      <path d="M166 92 Q190 94 204 82 M166 108 Q190 106 204 118" />
      <path d="M110 64 Q130 84 128 100 M110 136 Q128 120 140 104" className="nl-soft" />
      <circle className="nl-focus" cx="70" cy="100" r="30" />
    </>
  ),
  corazon: (
    <g className="nl-beat">
      <path d="M78 92 Q74 64 96 60 Q112 58 116 74 Q122 58 140 62 Q164 70 158 104 Q152 140 112 176 Q92 160 80 140 Q70 120 78 92 Z" />
      <path d="M104 64 Q100 40 110 28 Q124 18 140 26 Q150 34 146 50" />
      <path d="M118 40 L120 22 M130 32 L136 16 M140 36 L150 24" className="nl-soft" />
      <path d="M90 66 L86 34 M96 64 L94 36" />
      <path d="M116 74 Q114 112 110 168 M116 80 Q138 94 150 114" className="nl-soft" />
      <path d="M100 92 Q92 108 96 128 M130 86 Q140 100 138 120" className="nl-soft" />
    </g>
  ),
  huesos: (
    <>
      <path d="M40 60 Q50 34 84 40 Q104 46 110 62 Q116 46 136 40 Q170 34 180 60 Q186 84 166 98 Q152 108 150 120 L134 126 Q120 118 110 120 Q100 118 86 126 L70 120 Q68 108 54 98 Q34 84 40 60 Z" />
      <circle cx="78" cy="98" r="10" /><circle cx="142" cy="98" r="10" />
      <path d="M78 98 Q70 108 74 116 L86 190 Q88 200 82 206 Q78 212 86 214 Q96 214 98 206 Q100 198 96 190 L86 112" />
      <path d="M100 64 L100 116 M120 64 L120 116" className="nl-soft" />
      <path d="M82 130 L88 180 M90 128 L94 176" className="nl-soft" />
      <rect className="nl-scan" x="30" y="30" width="160" height="10" rx="5" />
    </>
  ),
  musculo: (
    <g className="nl-contract">
      <path d="M86 24 Q66 60 70 100 Q74 136 96 160 L100 206 M134 24 Q154 60 150 100 Q146 136 124 160 L116 206" />
      <path d="M110 30 Q108 80 110 140" className="nl-soft" />
      <path d="M80 56 Q96 70 92 110 M140 56 Q124 70 128 110" className="nl-soft" />
      <path d="M96 160 Q110 170 124 160" />
      <path d="M100 206 Q108 214 116 206" />
      <path d="M90 214 Q86 226 96 228 L130 228 Q138 226 132 216" />
    </g>
  ),
  sangre: (
    <>
      <path d="M20 70 Q110 52 200 70 M20 140 Q110 158 200 140" />
      <path d="M20 80 Q110 64 200 80 M20 130 Q110 146 200 130" className="nl-soft" />
      <g className="nl-flow">
        <ellipse cx="50" cy="104" rx="16" ry="8" /><ellipse cx="50" cy="104" rx="7" ry="3" className="nl-soft" />
        <ellipse cx="96" cy="94" rx="16" ry="8" /><ellipse cx="96" cy="94" rx="7" ry="3" className="nl-soft" />
        <ellipse cx="140" cy="114" rx="16" ry="8" /><ellipse cx="140" cy="114" rx="7" ry="3" className="nl-soft" />
        <circle cx="178" cy="98" r="7" className="nl-soft" />
      </g>
    </>
  ),
  sudor: (
    <>
      <path d="M20 60 Q50 54 80 60 Q110 66 140 60 Q170 54 200 60" />
      <path d="M20 80 L200 80 M20 130 L200 130" className="nl-soft" />
      <path d="M110 60 Q106 76 112 92 Q118 110 108 124 Q100 136 110 144" />
      <path d="M96 150 Q88 164 100 172 Q112 178 120 168 Q128 158 118 150 Q108 144 102 154 Q98 162 108 166" />
      <path d="M50 60 L52 140 M170 60 L168 140" className="nl-soft" />
      <path className="nl-drop" d="M110 30 Q102 42 110 48 Q118 42 110 30 Z" />
    </>
  ),
  saliva: (
    <>
      <path d="M150 26 Q96 20 76 56 Q66 74 70 90 L56 112 Q54 118 64 120 L66 140 Q70 146 76 146 L76 160 Q80 172 96 170 L110 168 Q118 190 120 210" />
      <path d="M150 26 Q190 40 190 90 Q188 130 166 150 L160 210" className="nl-soft" />
      <path d="M128 88 Q148 84 152 104 Q152 122 136 124 Q122 120 124 104 Z" />
      <path d="M128 104 Q106 106 84 116" className="nl-soft" />
      <ellipse cx="118" cy="150" rx="16" ry="9" />
      <ellipse cx="94" cy="138" rx="10" ry="5" />
      <circle className="nl-secrete" cx="84" cy="122" r="3" />
    </>
  ),
};

export function OrganLines({ id }: { id: HotspotId }) {
  const art = DRAW[id];
  return (
    <svg viewBox="0 0 220 240" className="h-full w-full" role="img" aria-label={ORGAN_LINE_META[id].alt}>
      <g fill="none" stroke={NEON} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="nl-glow" aria-hidden>{art}</g>
      <g fill="none" stroke={NEON} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{art}</g>
    </svg>
  );
}
