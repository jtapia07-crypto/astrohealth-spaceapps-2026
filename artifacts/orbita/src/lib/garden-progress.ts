import type { DailyLog } from './types';

export interface GardenPointsPart {
  key: 'sleepHours' | 'sleepQuality' | 'mood' | 'stress' | 'hydration' | 'exercise' | 'social' | 'meals';
  label: string;
  points: number;
  max: number;
  rule: string;
}
export interface GardenProgress {
  accumulatedPoints: number;
  currentStreak: number;
  todayPoints: number;
  bestStreak: number;
  loggedToday: boolean;
  loggedDays: number;
}

const ratio = (value: number, goal: number) => Number.isFinite(value) ? Math.max(0, Math.min(1, value / goal)) : 0;

/** Illustrative game points, not clinical targets or a health assessment. */
export function scoreGardenDay(log: DailyLog, sleepGoal: number): { total: number; parts: GardenPointsPart[] } {
  const goal = Number.isFinite(sleepGoal) && sleepGoal > 0 ? sleepGoal : 8;
  const part = (key: GardenPointsPart['key'], label: string, max: number, fraction: number, rule: string): GardenPointsPart =>
    ({ key, label, max, points: Math.round(max * fraction), rule });
  const parts = [
    part('sleepHours', 'Sleep duration', 20, ratio(log.sleepHours, goal), `Proportional to your ${goal} h sleep goal; capped at 20.`),
    part('sleepQuality', 'Sleep quality', 15, ratio(log.sleepQuality, 5), '3 points per rating level, up to 15.'),
    part('mood', 'Mood', 15, ratio(log.mood, 5), '3 points per rating level, up to 15.'),
    part('stress', 'Stress', 15, Number.isFinite(log.stress) ? ratio(6 - Math.max(1, log.stress), 5) : 0, 'Inverse scale: 1 = 15 points; 5 = 3 points.'),
    part('hydration', 'Hydration', 15, ratio(log.hydration, 2.5), 'Proportional to 2.5 L, capped at 15.'),
    part('exercise', 'Exercise', 10, ratio(log.exercise, 120), 'Proportional to 120 min, capped at 10.'),
    part('social', 'Social contact', 5, log.social ? 1 : 0, '5 points for a recorded meaningful connection.'),
    part('meals', 'Meals', 5, log.meals.trim() ? 1 : 0, '5 points for logging meals, not their nutritional quality.'),
  ];
  return { total: parts.reduce((sum, p) => sum + p.points, 0), parts };
}

function validDay(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}
function previousDay(day: string) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

/** Derived from saved days: edits replace points, deletion removes them, profiles never mix. */
export function gardenProgress(logs: DailyLog[], profileId: string, sleepGoal: number, today: string): GardenProgress {
  if (!validDay(today)) throw new Error('Choose a valid current date for garden progress.');
  const byDay = new Map<string, DailyLog>();
  for (const log of logs) {
    if (log.profileId === profileId && validDay(log.date) && log.date <= today) byDay.set(log.date, log);
  }
  const days = [...byDay.values()].filter((l) => l.wellbeingSaved !== false).sort((a, b) => a.date.localeCompare(b.date));
  const dates = new Set(days.map((l) => l.date));
  let currentStreak = 0;
  let cursor = dates.has(today) ? today : previousDay(today);
  while (dates.has(cursor)) { currentStreak++; cursor = previousDay(cursor); }
  let run = 0; let bestStreak = 0; let last = '';
  for (const log of days) {
    run = last === previousDay(log.date) ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    last = log.date;
  }
  const todayLog = days.find((l) => l.date === today);
  return {
    accumulatedPoints: days.reduce((sum, l) => sum + scoreGardenDay(l, sleepGoal).total, 0),
    currentStreak, bestStreak, todayPoints: todayLog ? scoreGardenDay(todayLog, sleepGoal).total : 0,
    loggedToday: !!todayLog, loggedDays: days.length,
  };
}
