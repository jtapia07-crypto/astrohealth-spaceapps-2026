export type PlantType = 'helecho' | 'girasol' | 'suculenta' | 'bonsai';
export type Climate = 'bosque' | 'desierto' | 'tropical' | 'tundra';
export interface Profile {
  id: string; demo: boolean; name: string; age: number; role: string;
  conditions: string; allergies: string; medications: string; bloodGroup: string;
  hr: number; sbp: number; dbp: number; spo2: number; temp: number; weight: number;
  sleepGoal: number; plant: PlantType; climate: Climate; plantName: string;
}
export type Symptom = 'dolor_pecho' | 'falta_aire' | 'neurologico' | 'cefalea' | 'nauseas' | 'fatiga' | 'congestion';
export interface DailyLog {
  id: string; profileId: string; date: string;
  /** False for new Human-only entries; undefined preserves legacy Garden logs. */
  wellbeingSaved?: boolean;
  sleepHours: number; sleepQuality: number; meals: string; hydration: number;
  mood: number; stress: number; exercise: number; social: boolean; notes: string; symptoms: Symptom[];
}
export type PartState = 'nominal' | 'degradado' | 'falla';
export interface Ship {
  o2: number; co2: number; pressure: number; temp: number; gravity: number; humidity: number;
  radiation: number; water: number; energy: number;
  windows: PartState; thrusters: PartState; solar: PartState; hull: PartState; comms: PartState;
}
export type Destination = 'iss' | 'moon' | 'mars';
export interface Mission { destination: Destination; startDate: string; durationDays: number; crewCount: number; callsign: string; }
export interface AlertState { ack?: string; resolved?: { at: string; note: string; sig: string } }
