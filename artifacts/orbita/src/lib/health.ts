import type { DailyLog, Profile, Ship } from './types';
export type HotspotId = 'cabeza' | 'ojos' | 'corazon' | 'huesos' | 'musculo' | 'sangre' | 'sudor' | 'saliva';
export type Level = 'estable' | 'vigilar' | 'alerta';
export interface HotspotReport { id: HotspotId; label: string; level: Level; score: number; metrics: { k: string; v: string }[]; condition: string; spaceflight: string; actions: string[]; warning?: string; disclaimer?: string; }
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const lvl = (s: number): Level => (s >= 75 ? 'estable' : s >= 50 ? 'vigilar' : 'alerta');

export function healthReports(p: Profile, ship: Ship, log?: DailyLog): HotspotReport[] {
  const sym = log?.symptoms ?? [];
  const sleep = log?.sleepHours ?? p.sleepGoal;
  const hyd = log?.hydration ?? 2;
  const ex = log?.exercise ?? 90;
  const micro = ship.gravity < 0.3;
  const head = clamp(100 - Math.max(0, ship.co2 - 3) * 12 - Math.max(0, p.sleepGoal - sleep) * 8 - (sym.includes('cefalea') ? 15 : 0) - (sym.includes('neurologico') ? 60 : 0) - ((log?.stress ?? 2) - 2) * 5);
  const eyes = clamp(100 - (micro ? 12 : 0) - (sym.includes('congestion') ? 10 : 0) - (sym.includes('cefalea') ? 6 : 0) - (sym.includes('neurologico') ? 60 : 0) - Math.max(0, ship.co2 - 4) * 5 - Math.max(0, p.sleepGoal - sleep) * 3);
  const heart = clamp(100 - (sym.includes('dolor_pecho') ? 65 : 0) - Math.max(0, p.hr - 90) * 2 - Math.max(0, p.sbp - 135) * 1.5 - Math.max(0, ship.temp - 27) * 4);
  const bones = clamp(100 - (micro ? 18 : 0) - Math.max(0, 90 - ex) * 0.3 - (ship.radiation > 1 ? 6 : 0));
  const muscle = clamp(100 - (micro ? 14 : 0) - Math.max(0, 90 - ex) * 0.35 - (sym.includes('fatiga') ? 10 : 0));
  const blood = clamp(100 - Math.max(0, 19.5 - ship.o2) * 18 - Math.max(0, 96 - p.spo2) * 8 - Math.max(0, ship.radiation - 1) * 6 - (sym.includes('falta_aire') ? 50 : 0));
  const sweat = clamp(100 - Math.max(0, 2.2 - hyd) * 30 - Math.max(0, ship.temp - 26) * 6 - Math.max(0, ship.humidity - 70));
  const saliva = clamp(100 - Math.max(0, 2.2 - hyd) * 25 - Math.max(0, 30 - ship.humidity) * 2);
  const conservative = 'If it gets worse, contact the flight surgeon. Do not start or change medication without authorized instruction.';
  return [
    { id: 'cabeza', label: 'Head', score: head, level: lvl(head), metrics: [{ k: 'Cabin CO2', v: ship.co2 + ' mmHg' }, { k: 'Sleep', v: sleep + ' h' }, { k: 'Stress', v: (log?.stress ?? '-') + ' / 5' }],
      condition: ship.co2 > 4 ? 'Elevated CO2: can cause headache, drowsiness and slower thinking.' : sleep < p.sleepGoal - 1.5 ? 'Accumulated sleep debt affects attention and mood.' : 'No notable signals in the current log.',
      spaceflight: 'In microgravity, body fluids shift toward the head (puffy face, congestion) and vision changes (SANS) are studied. CO2 builds up where ventilation is poor.',
      actions: ['Move to an area with good air circulation.', 'Hydrate and plan rest.', 'Record headaches or vision changes in the journal.', conservative],
      warning: sym.includes('neurologico') ? 'URGENT: neurological deficit logged. Escalate to the flight surgeon immediately.' : ship.co2 >= 6 ? 'Critical cabin CO2: report to mission control.' : undefined },
    { id: 'ojos', label: 'Eyes', score: eyes, level: lvl(eyes), metrics: [{ k: 'Gravity', v: ship.gravity + ' g' }, { k: 'Cabin CO2', v: ship.co2 + ' mmHg' }, { k: 'Logged symptoms', v: sym.includes('neurologico') ? 'vision / neuro' : sym.includes('congestion') ? 'facial congestion' : sym.length ? sym.length + ' other' : 'none' }],
      condition: sym.includes('neurologico') ? 'Altered vision or neurological signs were logged: this needs immediate medical attention.' : micro ? 'Observation only: sustained microgravity shifts fluid toward the head, a known factor in spaceflight vision changes.' : 'Partial or Earth gravity: less headward fluid shift expected. No vision data is recorded in this app.',
      spaceflight: 'Without gravity pulling fluid toward the feet, fluid moves toward the head. NASA studies Spaceflight Associated Neuro-ocular Syndrome (SANS), which can include optic disc swelling, flattening of the back of the eye and shifts in focus during long missions. Crews receive periodic eye exams in flight. This app does not measure the eyes and makes no diagnosis.',
      actions: ['Note any blurred vision, focus changes or eye discomfort in the journal.', 'Follow the scheduled in-flight vision checks of the mission plan.', 'Keep sleep, hydration and exercise routines; avoid areas with poor air circulation.', 'Contact the flight surgeon promptly for any sudden vision change.'],
      warning: sym.includes('neurologico') ? 'URGENT: sudden vision loss or change, weakness or altered speech. Contact the flight surgeon immediately.' : undefined,
      disclaimer: 'Observations, not a diagnosis. This app records no eye measurements. Any sudden vision change requires contacting the flight surgeon.' },
    { id: 'corazon', label: 'Heart', score: heart, level: lvl(heart), metrics: [{ k: 'Resting HR', v: p.hr + ' bpm' }, { k: 'Blood pressure', v: p.sbp + '/' + p.dbp + ' mmHg' }, { k: 'Cabin temp', v: ship.temp + ' °C' }],
      condition: sym.includes('dolor_pecho') ? 'Chest pain reported: requires immediate medical evaluation.' : 'Profile baseline values within an illustrative range.',
      spaceflight: 'Without gravity the heart works less and can lose mass; on return, orthostatic intolerance (dizziness when standing up) may appear.',
      actions: ['Keep the scheduled cardiovascular exercise.', 'Regular hydration.', conservative],
      warning: sym.includes('dolor_pecho') ? 'URGENT: chest pain. Stop activity, alert a crewmate and the flight surgeon.' : undefined },
    { id: 'huesos', label: 'Bones', score: bones, level: lvl(bones), metrics: [{ k: 'Gravity', v: ship.gravity + ' g' }, { k: 'Exercise', v: ex + ' min' }, { k: 'Radiation', v: ship.radiation + ' mSv/d' }],
      condition: micro ? 'Microgravity: bone loses density without mechanical loading (deconditioning).' : 'Partial or Earth gravity: less bone loss expected.',
      spaceflight: 'On the ISS, bone density loss of roughly 1-1.5% per month has been observed in weight-bearing areas such as the hip.',
      actions: ['Daily resistive exercise (equivalent to ARED on the ISS).', 'Calcium and vitamin D intake according to the nutrition plan.', conservative] },
    { id: 'musculo', label: 'Muscle', score: muscle, level: lvl(muscle), metrics: [{ k: 'Exercise', v: ex + ' min' }, { k: 'Gravity', v: ship.gravity + ' g' }, { k: 'Weight', v: p.weight + ' kg' }],
      condition: ex < 60 ? 'Low exercise: higher risk of atrophy and strength loss.' : 'Adequate exercise routine in the log.',
      spaceflight: 'Postural muscles (calves, back) atrophy quickly in microgravity without exercise.',
      actions: ['Combine treadmill, cycle and resistive training.', 'Back stretches.', conservative] },
    { id: 'sangre', label: 'Blood', score: blood, level: lvl(blood), metrics: [{ k: 'Cabin O2', v: ship.o2 + ' %' }, { k: 'Baseline SpO2', v: p.spo2 + ' %' }, { k: 'Blood group', v: p.bloodGroup }],
      condition: ship.o2 < 19.5 ? 'Low cabin O2: blood oxygenation may drop (hypoxia).' : 'Expected oxygenation adequate for cabin and profile.',
      spaceflight: 'Plasma volume drops early in flight; space anemia has been described. Radiation is also a long-term risk.',
      actions: ['Watch crewmates for dizziness, confusion or shortness of breath.', 'Reduce effort if O2 is low.', 'Report to mission control. Do not change O2 or pressure without an authorized procedure.'],
      warning: sym.includes('falta_aire') ? 'URGENT: severe breathing difficulty logged.' : ship.o2 < 17 ? 'Critical cabin O2.' : undefined },
    { id: 'sudor', label: 'Sweat', score: sweat, level: lvl(sweat), metrics: [{ k: 'Hydration', v: hyd + ' L' }, { k: 'Cabin temp', v: ship.temp + ' °C' }, { k: 'Humidity', v: ship.humidity + ' %' }],
      condition: hyd < 1.5 || ship.temp > 27 ? 'Observation indicator: possible fluid loss from heat or exertion.' : 'No relevant observation signals.',
      spaceflight: 'Without natural convection, sweat does not drip: it pools on the skin and body cooling is less efficient.',
      actions: ['Dry the skin and ventilate during exercise.', 'Replace fluids.', 'Report excessive cabin heat.'],
      disclaimer: 'Sweat is only an observation and hydration indicator. This app does not perform or interpret lab tests.' },
    { id: 'saliva', label: 'Saliva', score: saliva, level: lvl(saliva), metrics: [{ k: 'Hydration', v: hyd + ' L' }, { k: 'Humidity', v: ship.humidity + ' %' }, { k: 'Meals', v: log?.meals ? 'logged' : 'not logged' }],
      condition: hyd < 1.5 || ship.humidity < 25 ? 'Observation indicator: dry mouth possible from low hydration or dry air.' : 'No relevant observation signals.',
      spaceflight: 'NASA has collected saliva samples in research on the immune system and stress; here it is used only as an observation of mouth dryness.',
      actions: ['Sip water throughout the day.', 'Usual oral hygiene.', 'Report persistent dryness to the flight surgeon.'],
      disclaimer: 'Nothing is diagnosed from saliva. It is an observation/hydration indicator, not a lab result.' },
  ];
}
export const LEVEL_COLOR: Record<Level, string> = { estable: 'hsl(172 58% 52%)', vigilar: 'hsl(46 92% 62%)', alerta: 'hsl(352 82% 60%)' };
export const LEVEL_LABEL: Record<Level, string> = { estable: 'Stable', vigilar: 'Watch', alerta: 'Alert' };
export const SYMPTOMS: { id: import('./types').Symptom; label: string; urgent?: boolean }[] = [
  { id: 'dolor_pecho', label: 'Chest pain', urgent: true }, { id: 'falta_aire', label: 'Severe breathing difficulty', urgent: true },
  { id: 'neurologico', label: 'Weakness, altered speech or vision', urgent: true }, { id: 'cefalea', label: 'Headache' },
  { id: 'nauseas', label: 'Nausea / dizziness' }, { id: 'fatiga', label: 'Marked fatigue' }, { id: 'congestion', label: 'Facial congestion' },
];
