import type { HotspotId } from '@/lib/health';
import heart from '@/assets/media/heart.webp';
import brain from '@/assets/media/brain.jpg';
import eye from '@/assets/media/eye.jpg';
import bone from '@/assets/media/bone.jpg';
import muscle from '@/assets/media/muscle.jpg';
import blood from '@/assets/media/blood.jpg';
import sweat from '@/assets/media/sweat.jpg';
import saliva from '@/assets/media/saliva.jpg';

export interface OrganMedia { src: string; alt: string; caption: string; motion: string; fx: HotspotId }

export const ORGAN_MEDIA: Record<HotspotId, OrganMedia> = {
  cabeza: { src: brain, fx: 'cabeza', alt: 'Shaded anatomical illustration of the human brain in side view, showing lobes, cerebellum and brainstem', caption: 'Brain · lateral view', motion: 'Neural pulse' },
  ojos: { src: eye, fx: 'ojos', alt: 'Cross-section illustration of the human eye with cornea, lens, retina and optic nerve', caption: 'Eye · sagittal section', motion: 'Blink and focus' },
  corazon: { src: heart, fx: 'corazon', alt: 'Detailed colored anatomical heart with aorta, vena cava, atria and coronary vessels', caption: 'Heart · anterior view', motion: 'Heartbeat cycle' },
  huesos: { src: bone, fx: 'huesos', alt: 'Illustration of the pelvis and femur with shaded bone texture', caption: 'Hip and femur', motion: 'Density scan' },
  musculo: { src: muscle, fx: 'musculo', alt: 'Illustration of the calf muscles gastrocnemius and soleus with tendons', caption: 'Calf · postural muscle', motion: 'Contraction' },
  sangre: { src: blood, fx: 'sangre', alt: 'Illustration of red blood cells flowing inside a cut-away blood vessel', caption: 'Red cells in a vessel', motion: 'Cell flow' },
  sudor: { src: sweat, fx: 'sudor', alt: 'Skin cross-section with a coiled eccrine sweat gland and duct', caption: 'Skin · eccrine gland', motion: 'Droplet formation' },
  saliva: { src: saliva, fx: 'saliva', alt: 'Head illustration showing parotid, submandibular and sublingual salivary glands', caption: 'Salivary glands', motion: 'Secretion flow' },
};
