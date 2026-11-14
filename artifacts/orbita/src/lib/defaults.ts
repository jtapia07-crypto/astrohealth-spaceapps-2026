import type { DailyLog, Mission, Profile, Ship } from './types';
const base = { conditions: '', allergies: '', medications: '', sleepGoal: 8 };
export const DEMO_CREW: Profile[] = [
  { ...base, id: 'demo-valeria', demo: true, name: 'Valeria Quispe', age: 41, role: 'Comandante', conditions: 'Miopía leve corregida', allergies: 'Ninguna conocida', medications: 'Ninguna', bloodGroup: 'O+', hr: 58, sbp: 116, dbp: 74, spo2: 98, temp: 36.6, weight: 63.4, plant: 'girasol', climate: 'tropical', plantName: 'Inti' },
  { ...base, id: 'demo-tomas', demo: true, name: 'Tomás Arriagada', age: 37, role: 'Ingeniero de vuelo', conditions: 'Rinitis estacional', allergies: 'Polen de gramíneas', medications: 'Según plan del cirujano de vuelo', bloodGroup: 'A-', hr: 64, sbp: 122, dbp: 79, spo2: 97, temp: 36.7, weight: 78.1, plant: 'bonsai', climate: 'bosque', plantName: 'Kodama' },
  { ...base, id: 'demo-nadia', demo: true, name: 'Nadia Ferrer', age: 33, role: 'Especialista de misión', conditions: 'Ninguna registrada', allergies: 'Penicilina (ficticio)', medications: 'Ninguna', bloodGroup: 'B+', hr: 61, sbp: 112, dbp: 70, spo2: 99, temp: 36.5, weight: 57.8, plant: 'suculenta', climate: 'desierto', plantName: 'Duna' },
];
export const blankProfile = (id: string): Profile => ({ ...base, id, demo: false, name: 'Nuevo astronauta', age: 35, role: 'Especialista de misión', bloodGroup: 'O+', hr: 62, sbp: 118, dbp: 76, spo2: 98, temp: 36.6, weight: 70, plant: 'helecho', climate: 'bosque', plantName: 'Brote' });
export const DEFAULT_SHIP: Ship = { o2: 20.9, co2: 2.8, pressure: 101.3, temp: 22.4, gravity: 0, humidity: 46, radiation: 0.62, water: 78, energy: 84, windows: 'nominal', thrusters: 'nominal', solar: 'nominal', hull: 'nominal', comms: 'nominal' };
export const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
export const shiftISO = (iso: string, days: number) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };
export const DEFAULT_MISSION = (): Mission => ({ destination: 'moon', startDate: todayISO(), durationDays: 12, crewCount: 3, callsign: 'Órbita-1' });
export const seedLogs = (): DailyLog[] => {
  const t = todayISO();
  return [
    { id: 's1', profileId: 'demo-valeria', date: shiftISO(t, -3), sleepHours: 6.2, sleepQuality: 3, meals: 'Avena rehidratada, tortillas con pollo, fruta deshidratada', hydration: 2.1, mood: 3, stress: 3, exercise: 95, social: true, notes: 'Videollamada con familia. Ruido del ventilador de cabina.', symptoms: [] },
    { id: 's2', profileId: 'demo-valeria', date: shiftISO(t, -2), sleepHours: 7.1, sleepQuality: 4, meals: 'Huevos, arroz con verduras, chocolate', hydration: 2.4, mood: 4, stress: 2, exercise: 120, social: true, notes: 'Vista de la Tierra al amanecer.', symptoms: [] },
    { id: 's3', profileId: 'demo-valeria', date: shiftISO(t, -1), sleepHours: 5.4, sleepQuality: 2, meals: 'Barra de cereal, sopa, pasta', hydration: 1.6, mood: 3, stress: 4, exercise: 60, social: false, notes: 'Jornada larga de mantenimiento.', symptoms: ['cefalea'] },
  ];
};
