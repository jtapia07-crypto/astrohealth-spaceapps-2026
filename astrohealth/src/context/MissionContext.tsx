import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Evaluation, NasaTLX, ScenarioId, SpaceWeather, TelemetryData } from '../types';
import { evaluate } from '../utils/riskCalculator';
import { SCENARIOS } from '../utils/scenarios';
import { fetchSpaceWeather, OFFLINE_WEATHER } from '../services/nasaApi';

interface Ctx {
  data: TelemetryData; evaluation: Evaluation; scenario: ScenarioId; weather: SpaceWeather; forceOffline: boolean;
  setScenario: (id: ScenarioId) => void; setTlx: (k: keyof NasaTLX, v: number) => void;
  toggleOffline: () => void; refreshWeather: () => void; selfCare: (kind: 'breathing' | 'journal') => void;
}
const MissionContext = createContext<Ctx | null>(null);
const jitter = (v: number, amp: number) => v + (Math.random() - 0.5) * amp;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function MissionProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenarioState] = useState<ScenarioId>('NOMINAL');
  const [base, setBase] = useState<TelemetryData>(() => SCENARIOS[0].make());
  const [tick, setTick] = useState(0);
  const [weather, setWeather] = useState<SpaceWeather>(OFFLINE_WEATHER);
  const [forceOffline, setForceOffline] = useState(false);

  const refreshWeather = useCallback(() => {
    if (forceOffline || !navigator.onLine) { setWeather({ ...OFFLINE_WEATHER, fetchedAt: Date.now() }); return; }
    fetchSpaceWeather().then(setWeather);
  }, [forceOffline]);
  useEffect(() => { refreshWeather(); }, [refreshWeather]);
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 1500); return () => clearInterval(id); }, []);

  const data = useMemo<TelemetryData>(() => {
    void tick;
    const { vitals: v, env: e } = base;
    const boost = scenario === 'NOMINAL' ? weather.radiationBoost : 0;
    return {
      ...base,
      vitals: { ...v, heartRate: jitter(v.heartRate, 3), hrv: Math.max(5, jitter(v.hrv, 3)),
        oxygenSaturation: clamp(jitter(v.oxygenSaturation, 0.6), 70, 100), respiratoryRate: jitter(v.respiratoryRate, 1),
        bodyTemp: jitter(v.bodyTemp, 0.1), gsr: Math.max(0, jitter(v.gsr, 0.6)) },
      env: { ...e, radiationDoseRate: Math.max(0, jitter(e.radiationDoseRate + boost, 4)), co2Level: Math.max(300, jitter(e.co2Level, 40)),
        cabinPressure: jitter(e.cabinPressure, 0.2) },
    };
  }, [base, tick, weather, scenario]);

  const evaluation = useMemo(() => evaluate(data), [data]);
  const setScenario = (id: ScenarioId) => { setScenarioState(id); setBase(SCENARIOS.find(s => s.id === id)!.make()); };
  const setTlx = (k: keyof NasaTLX, val: number) => setBase(b => ({ ...b, tlx: { ...b.tlx, [k]: val } }));
  const selfCare = (kind: 'breathing' | 'journal') => setBase(b => {
    const dC = kind === 'breathing' ? 4 : 2.5, dT = kind === 'breathing' ? 1.5 : 1;
    const tlx = Object.fromEntries(Object.entries(b.tlx).map(([k, x]) => [k, clamp(x - dT, 1, 10)])) as unknown as NasaTLX;
    return { ...b, biomarkers: { ...b.biomarkers, cortisol: Math.max(3, b.biomarkers.cortisol - dC) }, tlx };
  });

  return (
    <MissionContext.Provider value={{ data, evaluation, scenario, weather, forceOffline, setScenario, setTlx, selfCare, refreshWeather,
      toggleOffline: () => setForceOffline(f => !f) }}>
      {children}
    </MissionContext.Provider>
  );
}
export const useMission = () => { const c = useContext(MissionContext); if (!c) throw new Error('MissionProvider missing'); return c; };
