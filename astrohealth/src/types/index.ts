export type Status = 'NOMINAL' | 'WARNING' | 'CRITICAL';
export type EventCode = 'SOLAR_RADIATION_STRESS' | 'CABIN_HYPOXIA' | 'CARDIAC_EMERGENCY' | 'ISOLATION_FATIGUE';
export type ScenarioId = 'NOMINAL' | 'SOLAR' | 'CO2' | 'CARDIAC' | 'ISOLATION';

export interface VitalSigns {
  heartRate: number; hrv: number; oxygenSaturation: number; systolic: number; diastolic: number;
  bodyTemp: number; respiratoryRate: number; gsr: number;
}
export interface Biomarkers { cortisol: number; calcium: number }
export interface NasaTLX { mental: number; physical: number; temporal: number; performance: number; effort: number; frustration: number }
export interface Environment {
  radiationDoseRate: number; radiationAccumulated: number; co2Level: number; cabinPressure: number;
  earthDistanceKm: number; commLatencyMin: number; daysInConfinement: number; gravity: number;
}
export interface TelemetryData { vitals: VitalSigns; biomarkers: Biomarkers; tlx: NasaTLX; env: Environment }

export interface ActiveEvent { code: EventCode; status: Status; title: string; detail: string }
export interface Evaluation {
  metrics: Record<string, Status>;
  bio: Status; env: Status; mental: Status; overall: Status;
  events: ActiveEvent[]; tlxAverage: number;
}
export interface SpaceWeather {
  source: 'LIVE' | 'OFFLINE'; flareCount: number; topFlareClass: string; sepCount: number; radiationBoost: number; fetchedAt: number;
}
