import type { DailyLog, Profile, Symptom } from './types';

export function blankDailyLog(profile: Profile, date: string): DailyLog {
  return { id: crypto.randomUUID(), profileId: profile.id, date, sleepHours: profile.sleepGoal, sleepQuality: 3, meals: '', hydration: 2, mood: 3, stress: 3, exercise: 60, social: false, notes: '', symptoms: [] };
}

export function validateLogDate(date: string) {
  const parsed = new Date(`${date}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) throw new Error('Choose a valid log date.');
}

export function mergeHealthLog(logs: DailyLog[], profile: Profile, date: string, symptoms: Symptom[], notes: string): DailyLog {
  validateLogDate(date);
  if (notes.length > 10000) throw new Error('Keep notes within 10,000 characters.');
  const existing = logs.find((log) => log.profileId === profile.id && log.date === date);
  return { ...(existing ?? blankDailyLog(profile, date)), symptoms: [...new Set(symptoms)], notes };
}

export function mergeWellbeingLog(logs: DailyLog[], input: DailyLog): DailyLog {
  validateLogDate(input.date);
  const existing = logs.find((log) => log.profileId === input.profileId && log.date === input.date);
  return { ...input, id: existing?.id ?? input.id, symptoms: existing?.symptoms ?? [], notes: existing?.notes ?? '' };
}

export function replaceDailyLog(logs: DailyLog[], log: DailyLog): DailyLog[] {
  return [...logs.filter((item) => !(item.profileId === log.profileId && item.date === log.date) && item.id !== log.id), log];
}
