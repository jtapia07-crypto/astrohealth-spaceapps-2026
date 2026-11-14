import type { ReactNode } from 'react';
import type { HotspotId } from '@/lib/health';

export const NEON = '#33C1AE';

export const ORGAN_LINE_META: Record<HotspotId, { alt: string; caption: string; motion: string }> = {
  cabeza: { alt: 'Neon line drawing of the brain in side view with cerebral hemisphere, gyri, lateral and central sulci, cerebellum and brainstem', caption: 'Brain · lateral view', motion: 'Neural pulse' },
  ojos: { alt: 'Neon line drawing of an eye cross-section with cornea, lens, retina and optic nerve', caption: 'Eye · sagittal section', motion: 'Blink and focus' },
  corazon: { alt: 'Neon line drawing of the heart in anterior view with aortic arch, superior vena cava, pulmonary trunk, pulmonary veins, tapered ventricles and coronary vessels', caption: 'Heart · anterior view', motion: 'Heartbeat cycle' },
  huesos: { alt: 'Neon line drawing of the pelvis and femur', caption: 'Hip and femur', motion: 'Density scan' },
  musculo: { alt: 'Neon line drawing of the calf muscles with Achilles tendon', caption: 'Calf · postural muscle', motion: 'Contraction' },
  sangre: { alt: 'Neon line drawing of red blood cells flowing in a cut-away vessel', caption: 'Red cells in a vessel', motion: 'Cell flow' },
  sudor: { alt: 'Neon line drawing of a skin section with a coiled eccrine sweat gland and duct', caption: 'Skin · eccrine gland', motion: 'Droplet formation' },
  saliva: { alt: 'Neon line drawing of a head profile with parotid, submandibular and sublingual glands', caption: 'Salivary glands', motion: 'Secretion flow' },
};

const DRAW: Record<HotspotId, ReactNode> = {
  cabeza: (
    <>
      <path d="M50 118 Q36 92 50 66 Q66 38 104 34 Q146 32 170 58 Q188 80 180 108 Q176 122 162 128 Q150 132 140 128 Q128 136 112 134 Q96 140 80 134 Q60 134 50 118 Z" />
      <path d="M108 36 Q104 56 112 72 Q118 86 110 100" />
      <path d="M62 112 Q80 106 96 110 Q112 112 124 102 Q134 96 146 102" />
      <path d="M70 58 Q80 66 74 78 Q70 88 80 94 M90 44 Q96 56 90 68 Q86 80 96 86 M126 40 Q122 54 130 62 Q138 70 132 82 M146 50 Q140 62 150 70 Q160 76 156 90 M166 72 Q156 82 164 94 M56 92 Q68 94 72 104 M120 116 Q128 124 140 120 M88 120 Q98 126 108 120" className="nl-soft" />
      <path d="M140 128 Q164 128 170 142 Q170 156 152 160 Q134 162 124 150 Q120 140 130 132" />
      <path d="M134 140 Q148 136 162 144 M130 148 Q146 146 158 152" className="nl-soft" />
      <path d="M116 134 Q112 150 114 166 Q115 180 118 196 M128 140 Q126 156 126 170 Q126 182 128 196" />
      <path d="M115 152 Q121 150 127 152 M115 170 Q121 168 126 170" className="nl-soft" />
      <circle className="nl-node" cx="90" cy="68" r="2.4" /><circle className="nl-node nl-d2" cx="138" cy="66" r="2.4" /><circle className="nl-node nl-d3" cx="112" cy="104" r="2.4" />
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
      <path d="M82 92 Q72 108 76 132 Q82 154 104 172 Q120 188 138 198 Q148 190 154 176 Q166 150 162 124 Q158 98 140 88 Q122 80 104 84 Q90 86 82 92 Z" />
      <path d="M100 86 Q114 122 136 196" />
      <path d="M78 110 Q92 132 120 150 Q132 160 138 196" className="nl-soft" />
      <path d="M82 92 Q70 98 70 112 Q70 126 78 132" className="nl-soft" />
      <path d="M84 90 L84 30 M96 88 L96 32" />
      <path d="M100 86 Q96 48 112 34 Q128 22 146 30 Q156 36 156 52 L156 70 M112 84 Q110 54 122 46 Q134 40 142 48 L142 70" />
      <path d="M118 36 L114 16 M128 30 L128 12 M140 30 L146 14" />
      <path d="M118 84 Q118 70 128 66 Q140 62 158 64 L176 60 M128 80 Q136 74 160 76 L176 76" className="nl-soft" />
      <path d="M150 90 L172 84 M152 102 L174 100" className="nl-soft" />
      <path d="M140 94 Q152 120 148 160 M86 104 Q82 122 90 142" className="nl-soft" />
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
