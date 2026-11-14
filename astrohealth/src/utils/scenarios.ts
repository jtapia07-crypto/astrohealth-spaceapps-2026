import type { ScenarioId, TelemetryData } from '../types';

export const NOMINAL: TelemetryData = {
  vitals: { heartRate: 68, hrv: 62, oxygenSaturation: 98, systolic: 118, diastolic: 76, bodyTemp: 36.7, respiratoryRate: 15, gsr: 5 },
  biomarkers: { cortisol: 8, calcium: 9.4 },
  tlx: { mental: 3, physical: 3, temporal: 3, performance: 3, effort: 3, frustration: 2 },
  env: { radiationDoseRate: 38, radiationAccumulated: 62, co2Level: 900, cabinPressure: 101.3, earthDistanceKm: 384400, commLatencyMin: 0.02, daysInConfinement: 14, gravity: 0.16 },
};
const n = (): TelemetryData => structuredClone(NOMINAL);

export const SCENARIOS: { id: ScenarioId; label: string; make: () => TelemetryData }[] = [
  { id: 'NOMINAL', label: 'Nominal', make: n },
  { id: 'SOLAR', label: 'Tormenta Solar SPE', make: () => ({ ...n(),
    vitals: { ...NOMINAL.vitals, heartRate: 122, hrv: 34, respiratoryRate: 21, gsr: 14 },
    biomarkers: { cortisol: 19, calcium: 9.3 },
    env: { ...NOMINAL.env, radiationDoseRate: 780, radiationAccumulated: 190 } }) },
  { id: 'CO2', label: 'Toxicidad CO₂', make: () => ({ ...n(),
    vitals: { ...NOMINAL.vitals, heartRate: 96, oxygenSaturation: 91, respiratoryRate: 24 },
    env: { ...NOMINAL.env, co2Level: 3600, cabinPressure: 97 } }) },
  { id: 'CARDIAC', label: 'Emergencia Cardíaca', make: () => ({ ...n(),
    vitals: { ...NOMINAL.vitals, heartRate: 168, hrv: 12, oxygenSaturation: 92, systolic: 92, diastolic: 58, respiratoryRate: 26, gsr: 16 } }) },
  { id: 'ISOLATION', label: 'Fatiga por Aislamiento', make: () => ({ ...n(),
    biomarkers: { cortisol: 17, calcium: 8.8 },
    tlx: { mental: 9, physical: 6, temporal: 8, performance: 8, effort: 9, frustration: 9 },
    env: { ...NOMINAL.env, earthDistanceKm: 225000000, commLatencyMin: 12.5, daysInConfinement: 142, gravity: 0.38 } }) },
];
