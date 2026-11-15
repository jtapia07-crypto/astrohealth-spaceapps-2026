import type { DailyLog, Profile, Ship } from './types';
import type { SpaceWeather } from '../hooks/use-live-telemetry';

export type HotspotId = 'cabeza' | 'ojos' | 'corazon' | 'huesos' | 'musculo' | 'sangre' | 'sudor' | 'saliva';
export type Level = 'estable' | 'vigilar' | 'alerta';
export interface HotspotReport { id: HotspotId; label: string; level: Level; score: number; metrics: { k: string; v: string }[]; condition: string; spaceflight: string; actions: string[]; warning?: string; disclaimer?: string; }
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const lvl = (s: number): Level => (s >= 75 ? 'estable' : s >= 50 ? 'vigilar' : 'alerta');

export function healthReports(p: Profile, ship: Ship, log?: DailyLog, weather?: SpaceWeather): HotspotReport[] {
  const sym = log?.symptoms ?? [];
  const sleep = log?.sleepHours ?? p.sleepGoal;
  const hyd = log?.hydration ?? 2;
  const ex = log?.exercise ?? 90;
  const micro = ship.gravity < 0.3;
  const highPressure = p.sbp > 135 || p.dbp >= 90;
  const veryHighPressure = p.sbp >= 180 || p.dbp >= 120;
  const solarStorm = (weather?.kpIndex ?? 0) >= 5;
  const majorFlare = weather?.flareClass ? /^[MX]/i.test(weather.flareClass) : false;
  const stormPenalty = (solarStorm ? Math.min(12, ((weather?.kpIndex ?? 5) - 4) * 4) : 0) + (majorFlare ? 6 : 0);

  const head = clamp(100 - Math.max(0, ship.co2 - 3) * 12 - Math.max(0, p.sleepGoal - sleep) * 8 - (sym.includes('cefalea') ? 15 : 0) - (sym.includes('neurologico') ? 60 : 0) - ((log?.stress ?? 2) - 2) * 5 - (solarStorm ? 4 : 0));
  const eyes = clamp(100 - (micro ? 12 : 0) - (sym.includes('congestion') ? 10 : 0) - (sym.includes('cefalea') ? 6 : 0) - (sym.includes('neurologico') ? 60 : 0) - Math.max(0, ship.co2 - 4) * 5 - Math.max(0, p.sleepGoal - sleep) * 3);
  const heart = Math.min(highPressure ? (veryHighPressure ? 49 : 74) : 100, clamp(100 - (sym.includes('dolor_pecho') ? 65 : 0) - Math.max(0, p.hr - 90) * 2 - Math.max(0, p.sbp - 135) * 1.5 - Math.max(0, ship.temp - 27) * 4 - (solarStorm ? 3 : 0)));
  const bones = clamp(100 - (micro ? 18 : 0) - Math.max(0, 90 - ex) * 0.3 - (ship.radiation > 1 ? Math.min(14, (ship.radiation - 1) * 3) : 0));
  const muscle = clamp(100 - (micro ? 14 : 0) - Math.max(0, 90 - ex) * 0.35 - (sym.includes('fatiga') ? 10 : 0));
  const blood = clamp(100 - Math.max(0, 19.5 - ship.o2) * 18 - Math.max(0, 96 - p.spo2) * 8 - Math.max(0, ship.radiation - 1) * 6 - stormPenalty - (sym.includes('falta_aire') ? 50 : 0));
  const sweat = clamp(100 - Math.max(0, 2.2 - hyd) * 30 - Math.max(0, ship.temp - 26) * 6 - Math.max(0, ship.humidity - 70));
  const saliva = clamp(100 - Math.max(0, 2.2 - hyd) * 25 - Math.max(0, 30 - ship.humidity) * 2);
  const conservative = 'If it gets worse, contact the flight surgeon. Do not start or change medication without authorized instruction.';
  const radSource = weather?.source === 'nasa-donki' ? 'live NASA DONKI' : 'simulated';

  const reports: HotspotReport[] = [
    { id: 'cabeza', label: 'Head', score: head, level: lvl(head), metrics: [{ k: 'Cabin CO2', v: ship.co2 + ' mmHg' }, { k: 'Sleep', v: sleep + ' h' }, { k: 'Geomagnetic', v: weather ? `Kp ${weather.kpIndex}` : `Stress ${log?.stress ?? '-'}/5` }],
      condition: ship.co2 > 3 ? `CO2 at ${ship.co2} mmHg (NASA-STD-3001 nominal < 3.0 mmHg): associated with headache and slower neurocognitive performance.` : solarStorm ? `Geomagnetic storm (Kp ${weather?.kpIndex}) active: heightened circadian and radiation vigilance.` : sleep < p.sleepGoal - 1.5 ? 'Accumulated sleep debt affects attention and mood.' : 'Within NASA-STD-3001 cognitive & cabin air baselines.',
      spaceflight: 'NASA HRP & ISS 6-month mission studies (Frontiers in Physiology 2024) show cephalad fluid shift, sleep disruption and elevated ppCO2 (>3–4 mmHg) directly impact executive function and headache incidence.',
      actions: ['Move to an area with good air circulation (NASA-STD-3001 airflow).', 'Hydrate and plan rest.', 'Record headaches or vision changes in the journal.', conservative],
      warning: sym.includes('neurologico') ? 'URGENT: neurological deficit logged. Escalate to the flight surgeon immediately.' : ship.co2 >= 6 ? 'Critical cabin CO2 (NASA-STD-3001 action limit): report to mission control.' : undefined },
    { id: 'ojos', label: 'Eyes', score: eyes, level: lvl(eyes), metrics: [{ k: 'Gravity', v: ship.gravity + ' g' }, { k: 'Cabin CO2', v: ship.co2 + ' mmHg' }, { k: 'Logged symptoms', v: sym.includes('neurologico') ? 'vision / neuro' : sym.includes('congestion') ? 'facial congestion' : sym.length ? sym.length + ' other' : 'none' }],
      condition: sym.includes('neurologico') ? 'Altered vision or neurological signs were logged: this needs immediate medical attention.' : micro ? 'Observation only: sustained microgravity shifts fluid toward the head, a known factor in SANS (NASA HRP Evidence).' : 'Partial or Earth gravity: less headward fluid shift expected. No vision data is recorded in this app.',
      spaceflight: 'NASA HRP Evidence Roadmap identifies Spaceflight Associated Neuro-ocular Syndrome (SANS)—optic disc edema, globe flattening and hyperopic shifts—driven by chronic headward fluid shift in microgravity.',
      actions: ['Note any blurred vision, focus changes or eye discomfort in the journal.', 'Follow scheduled in-flight OCT / fundoscopy vision checks.', 'Keep sleep, hydration and exercise routines; avoid high-CO2 pockets.', 'Contact the flight surgeon promptly for any sudden vision change.'],
      warning: sym.includes('neurologico') ? 'URGENT: sudden vision loss or change, weakness or altered speech. Contact the flight surgeon immediately.' : undefined,
      disclaimer: 'NASA HRP educational reference, not a diagnosis. This app records no ocular imaging.' },
    { id: 'corazon', label: 'Heart', score: heart, level: lvl(heart), metrics: [{ k: 'Resting HR', v: p.hr + ' bpm' }, { k: 'Blood pressure', v: p.sbp + '/' + p.dbp + ' mmHg' }, { k: 'Cabin temp', v: ship.temp + ' °C' }],
      condition: sym.includes('dolor_pecho') ? 'Chest pain reported: requires immediate medical evaluation.' : highPressure ? `High blood pressure in stored baseline: ${p.sbp}/${p.dbp} mmHg. Not a live measurement or diagnosis.` : p.hr > 90 ? `Elevated stored resting heart rate: ${p.hr} bpm.` : ship.temp > 27 ? `High cabin temperature: ${ship.temp} °C (above NASA-STD-3001 thermal comfort).` : 'Cardiovascular profile within CSA Bio-Monitor / NASA baseline range.',
      spaceflight: 'CSA Vascular & Bio-Monitor ISS experiments show microgravity reduces cardiac workload, increases arterial stiffness and induces orthostatic intolerance upon return to gravity.',
      actions: highPressure ? ['Rest and repeat blood pressure measurement using CSA Bio-Monitor / authorized cuff procedure.', 'Report the value and any symptoms to the flight surgeon before strenuous exercise.', 'For chest pain, severe breathing difficulty or neurological symptoms, contact the flight surgeon immediately.', conservative] : ['Keep the scheduled cardiovascular exercise.', 'Regular hydration.', conservative],
      warning: sym.includes('dolor_pecho') ? 'URGENT: chest pain. Stop activity, alert a crewmate and the flight surgeon.' : veryHighPressure ? 'Very high stored blood pressure. Promptly contact the flight surgeon for reassessment; if current and accompanied by symptoms, escalate immediately.' : undefined },
    { id: 'huesos', label: 'Bones', score: bones, level: lvl(bones), metrics: [{ k: 'Gravity', v: ship.gravity + ' g' }, { k: 'Exercise', v: ex + ' min' }, { k: 'Radiation', v: ship.radiation + ' mSv/d' }],
      condition: micro ? 'Microgravity: bone loses density without mechanical loading (NASA HRP Bone Fracture Risk).' : 'Partial or Earth gravity: less bone loss expected.',
      spaceflight: 'NASA HRP & NLSP studies document 1–1.5% bone mineral density loss per month in weight-bearing skeletal sites (hip, lumbar spine) without high-load resistive countermeasures.',
      actions: ['Daily resistive exercise (ARED protocol on ISS).', 'Calcium and vitamin D intake per NASA-STD-3001 nutrition guidelines.', conservative] },
    { id: 'musculo', label: 'Muscle', score: muscle, level: lvl(muscle), metrics: [{ k: 'Exercise', v: ex + ' min' }, { k: 'Gravity', v: ship.gravity + ' g' }, { k: 'Weight', v: p.weight + ' kg' }],
      condition: ex < 60 ? 'Low exercise: higher risk of atrophy and strength loss (NASA HRP Muscle Risk).' : 'Adequate exercise routine in the log.',
      spaceflight: 'NASA HRP Muscle Physiology evidence shows rapid atrophy of antigravity postural muscles (soleus, gastrocnemius, paraspinal) in microgravity without daily aerobic + resistive training.',
      actions: ['Combine treadmill, cycle ergometer and resistive training.', 'Back and calf stretches.', conservative] },
    { id: 'sangre', label: 'Blood', score: blood, level: lvl(blood), metrics: [{ k: 'Cabin O2', v: ship.o2 + ' %' }, { k: 'Radiation', v: ship.radiation + ' mSv/d' }, { k: 'Solar flare', v: weather?.flareClass ?? 'Quiet' }],
      condition: ship.o2 < 19.5 ? 'Low cabin O2 (below NASA-STD-3001 19.5%): hypoxia risk.' : ship.radiation > 1 ? `Elevated radiation (${ship.radiation} mSv/d via ${radSource}): increases hematologic & cytokine stress (NASA OSDR OSD-575).` : 'Expected oxygenation & hematologic status adequate for cabin and profile.',
      spaceflight: 'NASA OSDR (OSD-575 Inspiration4 serum & whole-blood multi-omics) and HRP Space Anemia studies track plasma volume reduction, erythrocyte hemolysis and radiation-induced cytokine shifts.',
      actions: ['Watch crewmates for dizziness, confusion or shortness of breath.', 'Minimize EVA or unshielded module exposure during solar events (NASA-STD-3001 ALARA).', 'Report to mission control. Do not change O2 or pressure without an authorized procedure.'],
      warning: sym.includes('falta_aire') ? 'URGENT: severe breathing difficulty logged.' : ship.o2 < 17 ? 'Critical cabin O2.' : ship.radiation >= 5 ? 'High radiation exposure: shelter protocol advised.' : undefined },
    { id: 'sudor', label: 'Sweat', score: sweat, level: lvl(sweat), metrics: [{ k: 'Hydration', v: hyd + ' L' }, { k: 'Cabin temp', v: ship.temp + ' °C' }, { k: 'Humidity', v: ship.humidity + ' %' }],
      condition: hyd < 1.5 || ship.temp > 27 ? 'Observation indicator: possible fluid loss from heat or exertion.' : 'No relevant observation signals.',
      spaceflight: 'Without buoyancy-driven convection in microgravity, sweat forms an insulating film on the skin; CSA Bio-Monitor tracks skin temperature and evaporative heat stress.',
      actions: ['Dry the skin and maintain airflow during exercise.', 'Replace fluids per NASA-STD-3001 hydration baseline.', 'Report excessive cabin heat.'],
      disclaimer: 'Observation/hydration indicator based on CSA Bio-Monitor & NASA-STD-3001 thermal guidelines, not a lab assay.' },
    { id: 'saliva', label: 'Saliva', score: saliva, level: lvl(saliva), metrics: [{ k: 'Hydration', v: hyd + ' L' }, { k: 'Humidity', v: ship.humidity + ' %' }, { k: 'Meals', v: log?.meals ? 'logged' : 'not logged' }],
      condition: hyd < 1.5 || ship.humidity < 25 ? 'Observation indicator: dry mouth possible from low hydration or dry air.' : 'No relevant observation signals.',
      spaceflight: 'NASA OSDR & Nature 2024 SOMA multi-omics utilize oral/salivary swabs to monitor immune reactivation, microbiome shifts and physiological stress in flight.',
      actions: ['Sip water throughout the day.', 'Usual oral hygiene.', 'Report persistent dryness to the flight surgeon.'],
      disclaimer: 'Educational hydration/stress indicator referencing NASA OSDR oral multi-omics, not a clinical lab test.' },
  ];
  const reasons: Partial<Record<HotspotId, string[]>> = {
    cabeza: [ship.co2 > 3 ? `Cabin CO2 ${ship.co2} mmHg exceeds NASA-STD-3001 3.0 mmHg nominal` : '', solarStorm ? `Geomagnetic storm Kp ${weather?.kpIndex} (${radSource})` : '', sleep < p.sleepGoal ? `Sleep below goal: ${sleep} / ${p.sleepGoal} h` : '', sym.includes('cefalea') ? 'Headache logged' : '', (log?.stress ?? 2) > 2 ? `Stress ${log?.stress}/5` : ''],
    ojos: [micro ? 'Microgravity-related fluid-shift observation (NASA HRP SANS)' : '', sym.includes('congestion') ? 'Facial congestion logged' : '', sym.includes('cefalea') ? 'Headache logged' : '', ship.co2 > 4 ? `Elevated cabin CO2: ${ship.co2} mmHg` : '', sleep < p.sleepGoal ? `Sleep below goal: ${sleep} / ${p.sleepGoal} h` : ''],
    huesos: [micro ? 'Reduced mechanical loading in microgravity (NASA HRP Bone Risk)' : '', ex < 90 ? `Exercise below ARED reference: ${ex} / 90 min` : '', ship.radiation > 1 ? `Elevated radiation (${radSource}): ${ship.radiation} mSv/d` : ''],
    musculo: [ex < 90 ? `Exercise below reference: ${ex} / 90 min` : '', micro ? 'Muscle deconditioning risk in microgravity (NASA HRP)' : '', sym.includes('fatiga') ? 'Marked fatigue logged' : ''],
    sangre: [ship.o2 < 19.5 ? `Low cabin oxygen: ${ship.o2}% (NASA-STD-3001)` : '', p.spo2 < 96 ? `Low stored baseline SpO2: ${p.spo2}%` : '', ship.radiation > 1 ? `Elevated radiation (${radSource}): ${ship.radiation} mSv/d` : '', solarStorm ? `Active solar storm (Kp ${weather?.kpIndex}${weather?.flareClass ? ` · Flare ${weather.flareClass}` : ''})` : ''],
    sudor: [hyd < 2.2 ? `Hydration below reference: ${hyd} / 2.2 L` : '', ship.temp > 26 ? `High cabin temperature: ${ship.temp} °C` : '', ship.humidity > 70 ? `High cabin humidity: ${ship.humidity}%` : ''],
    saliva: [hyd < 2.2 ? `Hydration below reference: ${hyd} / 2.2 L` : '', ship.humidity < 30 ? `Dry cabin air: ${ship.humidity}% humidity` : ''],
  };
  return reports.map((report) => {
    if (report.level === 'estable' || report.id === 'corazon') return report;
    const factors = reasons[report.id]?.filter(Boolean) ?? [];
    return { ...report, condition: report.warning ?? (factors.length ? factors.join(' · ') : 'Illustrative index below the stable range. Review the values and contact the flight surgeon if symptoms occur.') };
  });
}
export const LEVEL_COLOR: Record<Level, string> = { estable: 'hsl(172 58% 52%)', vigilar: 'hsl(46 92% 62%)', alerta: 'hsl(352 82% 60%)' };
export const LEVEL_LABEL: Record<Level, string> = { estable: 'Stable', vigilar: 'Watch', alerta: 'Alert' };
export const SYMPTOMS: { id: import('./types').Symptom; label: string; urgent?: boolean }[] = [
  { id: 'dolor_pecho', label: 'Chest pain', urgent: true }, { id: 'falta_aire', label: 'Severe breathing difficulty', urgent: true },
  { id: 'neurologico', label: 'Weakness, altered speech or vision', urgent: true }, { id: 'cefalea', label: 'Headache' },
  { id: 'nauseas', label: 'Nausea / dizziness' }, { id: 'fatiga', label: 'Marked fatigue' }, { id: 'congestion', label: 'Facial congestion' },
];
