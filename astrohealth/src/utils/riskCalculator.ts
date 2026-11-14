import type { ActiveEvent, Evaluation, Status, TelemetryData } from '../types';

const RANK: Record<Status, number> = { NOMINAL: 0, WARNING: 1, CRITICAL: 2 };
export const worst = (...s: Status[]): Status => s.reduce((a, b) => (RANK[b] > RANK[a] ? b : a), 'NOMINAL' as Status);

const band = (v: number, warnLo: number, warnHi: number, critLo: number, critHi: number): Status =>
  v < critLo || v > critHi ? 'CRITICAL' : v < warnLo || v > warnHi ? 'WARNING' : 'NOMINAL';

export function evaluate(t: TelemetryData): Evaluation {
  const { vitals: v, biomarkers: b, tlx, env: e } = t;
  const tlxAverage = Object.values(tlx).reduce((a, c) => a + c, 0) / 6;

  const m: Record<string, Status> = {
    heartRate: band(v.heartRate, 50, 110, 40, 150),
    hrv: band(v.hrv, 40, 200, 20, 300),
    oxygenSaturation: band(v.oxygenSaturation, 94, 101, 90, 101),
    bloodPressure: band(v.systolic, 95, 140, 80, 180),
    bodyTemp: band(v.bodyTemp, 36, 37.8, 35, 39),
    respiratoryRate: band(v.respiratoryRate, 10, 22, 8, 30),
    gsr: band(v.gsr, 0, 12, -1, 20),
    cortisol: band(b.cortisol, 0, 15, -1, 20),
    calcium: band(b.calcium, 8.6, 10.3, 8, 11),
    tlx: tlxAverage > 7.5 ? 'CRITICAL' : tlxAverage > 6 ? 'WARNING' : 'NOMINAL',
    radiationDoseRate: band(e.radiationDoseRate, 0, 100, -1, 500),
    radiationAccumulated: band(e.radiationAccumulated, 0, 300, -1, 600),
    co2Level: band(e.co2Level, 0, 2000, -1, 5000),
    cabinPressure: band(e.cabinPressure, 95, 105, 80, 110),
    commLatencyMin: band(e.commLatencyMin, 0, 5, -1, 20),
    daysInConfinement: band(e.daysInConfinement, 0, 60, -1, 240),
    gravity: 'NOMINAL',
  };

  const events: ActiveEvent[] = [];
  if (e.radiationDoseRate > 500 && (v.heartRate > 110 || b.cortisol > 15))
    events.push({ code: 'SOLAR_RADIATION_STRESS', status: 'CRITICAL', title: 'Tormenta solar + estrés agudo',
      detail: `Radiación ${e.radiationDoseRate.toFixed(0)} µSv/h con FC ${v.heartRate.toFixed(0)} bpm / cortisol ${b.cortisol.toFixed(1)} nmol/L.` });
  if (e.co2Level > 2000 && v.oxygenSaturation < 93)
    events.push({ code: 'CABIN_HYPOXIA', status: v.oxygenSaturation < 90 || e.co2Level > 5000 ? 'CRITICAL' : 'WARNING',
      title: 'Toxicidad por cabina cerrada',
      detail: `CO₂ ${e.co2Level.toFixed(0)} ppm con SpO₂ ${v.oxygenSaturation.toFixed(0)} %.` });
  if (v.heartRate > 150 && v.hrv < 20)
    events.push({ code: 'CARDIAC_EMERGENCY', status: 'CRITICAL', title: 'Colapso cardiovascular',
      detail: `FC ${v.heartRate.toFixed(0)} bpm con HRV ${v.hrv.toFixed(0)} ms. Activar protocolo de triaje.` });
  if (tlxAverage > 7.5 && e.daysInConfinement > 60 && e.commLatencyMin > 5)
    events.push({ code: 'ISOLATION_FATIGUE', status: b.cortisol > 20 || tlx.frustration >= 9 ? 'CRITICAL' : 'WARNING',
      title: 'Sobrecarga conductual por aislamiento',
      detail: `NASA-TLX ${tlxAverage.toFixed(1)}, ${e.daysInConfinement} días en confinamiento, latencia ${e.commLatencyMin.toFixed(0)} min.` });

  const ev = (code: string): Status => events.find(x => x.code === code)?.status ?? 'NOMINAL';
  const bio = worst(m.heartRate, m.hrv, m.oxygenSaturation, m.bloodPressure, m.bodyTemp, m.respiratoryRate, m.gsr, m.calcium,
    ev('CARDIAC_EMERGENCY'), ev('CABIN_HYPOXIA'), ev('SOLAR_RADIATION_STRESS'));
  const mental = worst(m.tlx, m.cortisol, m.daysInConfinement, ev('ISOLATION_FATIGUE'));
  const envS = worst(m.radiationDoseRate, m.radiationAccumulated, m.co2Level, m.cabinPressure, m.commLatencyMin,
    ev('SOLAR_RADIATION_STRESS'), ev('CABIN_HYPOXIA'));
  return { metrics: m, bio, mental, env: envS, overall: worst(bio, mental, envS), events, tlxAverage };
}
