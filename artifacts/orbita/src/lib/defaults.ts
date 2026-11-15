import type { DailyLog, Mission, Profile, Ship } from './types';
const base = { conditions: '', allergies: '', medications: '', sleepGoal: 8 };
export const DEMO_CREW: Profile[] = [
  { ...base, id: 'demo-valeria', demo: true, name: 'Valeria Quispe', age: 41, role: 'Commander', conditions: 'Mild corrected myopia', allergies: 'None known', medications: 'None', bloodGroup: 'O+', hr: 58, sbp: 116, dbp: 74, spo2: 98, temp: 36.6, weight: 63.4, plant: 'girasol', climate: 'tropical', plantName: 'Inti' },
  { ...base, id: 'demo-tomas', demo: true, name: 'Tomás Arriagada', age: 37, role: 'Flight engineer', conditions: 'Seasonal rhinitis', allergies: 'Grass pollen', medications: 'Per flight surgeon plan', bloodGroup: 'A-', hr: 64, sbp: 122, dbp: 79, spo2: 97, temp: 36.7, weight: 78.1, plant: 'bonsai', climate: 'bosque', plantName: 'Kodama' },
  { ...base, id: 'demo-nadia', demo: true, name: 'Nadia Ferrer', age: 33, role: 'Mission specialist', conditions: 'None recorded', allergies: 'Penicillin (fictional)', medications: 'None', bloodGroup: 'B+', hr: 61, sbp: 112, dbp: 70, spo2: 99, temp: 36.5, weight: 57.8, plant: 'suculenta', climate: 'desierto', plantName: 'Duna' },
];
export const blankProfile = (id: string): Profile => ({ ...base, id, demo: false, name: 'New astronaut', age: 35, role: 'Mission specialist', bloodGroup: 'O+', hr: 62, sbp: 118, dbp: 76, spo2: 98, temp: 36.6, weight: 70, plant: 'helecho', climate: 'bosque', plantName: 'Sprout' });
export const DEFAULT_SHIP: Ship = { o2: 20.9, co2: 2.8, pressure: 101.3, temp: 22.4, gravity: 0, humidity: 46, radiation: 0.62, water: 78, energy: 93, windows: 'nominal', thrusters: 'nominal', solar: 'nominal', hull: 'nominal', comms: 'nominal' };
export const migrateShip = (ship: Ship): Ship => ship.energy === 84 ? { ...ship, energy: 93 } : ship;
export const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
export const shiftISO = (iso: string, days: number) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };
export const DEFAULT_MISSION = (): Mission => ({ destination: 'moon', startDate: todayISO(), durationDays: 12, crewCount: 3, callsign: 'Guardian-1' });
export const seedLogs = (): DailyLog[] => {
  const t = todayISO();
  return [
    { id: 's1', profileId: 'demo-valeria', date: shiftISO(t, -3), sleepHours: 6.2, sleepQuality: 3, meals: 'Rehydrated oatmeal, chicken tortillas, dried fruit', hydration: 2.1, mood: 3, stress: 3, exercise: 95, social: true, notes: 'Video call with family. Cabin fan noise.', symptoms: [] },
    { id: 's2', profileId: 'demo-valeria', date: shiftISO(t, -2), sleepHours: 7.1, sleepQuality: 4, meals: 'Eggs, rice with vegetables, chocolate', hydration: 2.4, mood: 4, stress: 2, exercise: 120, social: true, notes: 'View of Earth at sunrise.', symptoms: [] },
    { id: 's3', profileId: 'demo-valeria', date: shiftISO(t, -1), sleepHours: 4.4, sleepQuality: 2, meals: 'Cereal bar, soup, pasta', hydration: 1.6, mood: 3, stress: 4, exercise: 60, social: false, notes: 'Long maintenance shift.', symptoms: ['cefalea'] },
  ];
};

/** Exact Spanish built-in defaults from earlier versions mapped to English. Only exact matches are migrated. */
const LEGACY: Record<string, string> = {
  'Comandante': 'Commander', 'Ingeniero de vuelo': 'Flight engineer', 'Especialista de misión': 'Mission specialist',
  'Miopía leve corregida': 'Mild corrected myopia', 'Ninguna conocida': 'None known', 'Ninguna': 'None',
  'Rinitis estacional': 'Seasonal rhinitis', 'Polen de gramíneas': 'Grass pollen', 'Según plan del cirujano de vuelo': 'Per flight surgeon plan',
  'Ninguna registrada': 'None recorded', 'Penicilina (ficticio)': 'Penicillin (fictional)', 'Nuevo astronauta': 'New astronaut', 'Brote': 'Sprout',
  'Avena rehidratada, tortillas con pollo, fruta deshidratada': 'Rehydrated oatmeal, chicken tortillas, dried fruit',
  'Videollamada con familia. Ruido del ventilador de cabina.': 'Video call with family. Cabin fan noise.',
  'Huevos, arroz con verduras, chocolate': 'Eggs, rice with vegetables, chocolate', 'Vista de la Tierra al amanecer.': 'View of Earth at sunrise.',
  'Barra de cereal, soup, pasta': 'Cereal bar, soup, pasta', 'Barra de cereal, sopa, pasta': 'Cereal bar, soup, pasta', 'Jornada larga de mantenimiento.': 'Long maintenance shift.',
};
const tr = (v: string) => LEGACY[v] ?? v;
export function migrateProfiles(crew: Profile[]): Profile[] {
  return crew.map((p) => {
    if (p.demo || p.id.startsWith('demo-')) return { ...p, role: tr(p.role), conditions: tr(p.conditions), allergies: tr(p.allergies), medications: tr(p.medications) };
    return { ...p, name: p.name === 'Nuevo astronauta' ? 'New astronaut' : p.name, role: p.role === 'Especialista de misión' ? 'Mission specialist' : p.role, plantName: p.plantName === 'Brote' ? 'Sprout' : p.plantName };
  });
}
export function migrateLogs(logs: DailyLog[]): DailyLog[] {
  return logs.map((l) => {
    if (!['s1', 's2', 's3'].includes(l.id)) return l;
    const next = { ...l, meals: tr(l.meals), notes: tr(l.notes) };
    const originalDemo = next.id === 's3' && next.profileId === 'demo-valeria'
      && next.sleepHours === 5.4 && next.sleepQuality === 2 && next.hydration === 1.6
      && next.mood === 3 && next.stress === 4 && next.exercise === 60 && !next.social
      && next.meals === 'Cereal bar, soup, pasta' && next.notes === 'Long maintenance shift.'
      && next.symptoms.length === 1 && next.symptoms[0] === 'cefalea';
    return originalDemo ? { ...next, sleepHours: 4.4 } : next;
  });
}
export function migrateMission(m: Mission): Mission { return (m.callsign === 'Órbita-1' || m.callsign === 'Orbita-1') ? { ...m, callsign: 'Guardian-1' } : m; }
