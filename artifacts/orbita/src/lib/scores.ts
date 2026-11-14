import type { DailyLog, Ship } from './types';
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
export function shipScore(s: Ship) {
  let p = 0;
  p += Math.max(0, s.co2 - 4) * 9; p += Math.max(0, 19.5 - s.o2) * 14 + Math.max(0, s.o2 - 23.5) * 8;
  p += Math.max(0, Math.abs(s.pressure - 101.3) - 4) * 2; p += Math.max(0, Math.abs(s.temp - 22.5) - 4.5) * 4;
  p += Math.max(0, 25 - s.humidity) + Math.max(0, s.humidity - 75); p += Math.max(0, s.radiation - 1) * 8;
  p += Math.max(0, 30 - s.water) * 1.2 + Math.max(0, 30 - s.energy) * 1.2;
  (['windows', 'thrusters', 'solar', 'hull', 'comms'] as const).forEach((k) => { p += s[k] === 'falla' ? 18 : s[k] === 'degradado' ? 7 : 0; });
  return clamp(100 - p);
}
export type Weather = 'soleado' | 'nublado' | 'tormenta';
export const weatherFor = (score: number): Weather => (score >= 80 ? 'soleado' : score >= 55 ? 'nublado' : 'tormenta');
export interface Wellness { score: number; parts: { label: string; value: number; weight: number; detail: string }[]; days: number }
export function wellness(logs: DailyLog[], sleepGoal: number): Wellness | null {
  const recent = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  if (!recent.length) return null;
  const avg = (f: (l: DailyLog) => number) => recent.reduce((s, l) => s + f(l), 0) / recent.length;
  const sleep = clamp((avg((l) => l.sleepHours) / sleepGoal) * 70 + avg((l) => l.sleepQuality) * 6);
  const hyd = clamp((avg((l) => l.hydration) / 2.5) * 100);
  const mood = clamp(avg((l) => l.mood) * 20);
  const calm = clamp((6 - avg((l) => l.stress)) * 20);
  const ex = clamp((avg((l) => l.exercise) / 120) * 100);
  const social = clamp(avg((l) => (l.social ? 100 : 30)));
  const parts = [
    { label: 'Sleep', value: sleep, weight: 0.25, detail: `${avg((l) => l.sleepHours).toFixed(1)} h average` },
    { label: 'Hydration', value: hyd, weight: 0.15, detail: `${avg((l) => l.hydration).toFixed(1)} L/day` },
    { label: 'Mood', value: mood, weight: 0.2, detail: `${avg((l) => l.mood).toFixed(1)} / 5` },
    { label: 'Calm', value: calm, weight: 0.15, detail: `stress ${avg((l) => l.stress).toFixed(1)} / 5` },
    { label: 'Exercise', value: ex, weight: 0.15, detail: `${Math.round(avg((l) => l.exercise))} min/day` },
    { label: 'Social contact', value: social, weight: 0.1, detail: `${recent.filter((l) => l.social).length} of ${recent.length} days` },
  ];
  return { score: clamp(parts.reduce((s, p) => s + p.value * p.weight, 0)), parts, days: recent.length };
}
export const growthStage = (logCount: number, score: number) => Math.min(5, Math.floor(logCount / 2) + (score > 70 ? 1 : 0));
