import test from 'node:test';
import assert from 'node:assert/strict';
import { gardenProgress, scoreGardenDay } from '../src/lib/garden-progress.ts';
import { mergeHealthLog, mergeWellbeingLog, replaceDailyLog } from '../src/lib/daily-log.ts';

const profile = { id: 'a', sleepGoal: 8 };
const day = (date, extra = {}) => ({
  id: date, profileId: 'a', date, wellbeingSaved: true,
  sleepHours: 8, sleepQuality: 5, mood: 5, stress: 1,
  hydration: 2.5, exercise: 120, social: true, meals: 'Meals recorded',
  symptoms: [], notes: '', ...extra,
});
const progress = (logs, today = '2026-11-14') => gardenProgress(logs, 'a', 8, today);

test('all eight parameters have transparent maxima totalling 100', () => {
  const score = scoreGardenDay(day('2026-11-14'), 8);
  assert.equal(score.total, 100);
  assert.equal(score.parts.length, 8);
  assert.equal(score.parts.reduce((s, p) => s + p.max, 0), 100);
  assert.ok(score.parts.every((p) => p.points === p.max && p.rule.length > 0));
});

test('duration, hydration and exercise are proportional, capped, and respect personal sleep goal', () => {
  const parts = scoreGardenDay(day('2026-11-14', { sleepHours: 4, hydration: 1.25, exercise: 60 }), 8).parts;
  assert.equal(parts.find((p) => p.key === 'sleepHours').points, 10);
  assert.equal(parts.find((p) => p.key === 'hydration').points, 8);
  assert.equal(parts.find((p) => p.key === 'exercise').points, 5);
  assert.equal(scoreGardenDay(day('2026-11-14', { sleepHours: 4 }), 10).parts[0].points, 8);
  assert.equal(scoreGardenDay(day('2026-11-14', { sleepHours: 12, hydration: 4, exercise: 180 }), 8).total, 100);
});

test('stress awards inversely while quality and mood award proportionally', () => {
  const low = scoreGardenDay(day('2026-11-14', { stress: 5, sleepQuality: 1, mood: 1 }), 8).parts;
  for (const key of ['stress', 'sleepQuality', 'mood']) assert.equal(low.find((p) => p.key === key).points, 3);
  assert.equal(scoreGardenDay(day('2026-11-14', { meals: '  ', social: false }), 8).total, 90);
});

test('empty progress starts at zero', () => {
  assert.deepEqual(progress([]), { accumulatedPoints: 0, currentStreak: 0, todayPoints: 0, bestStreak: 0, loggedToday: false, loggedDays: 0 });
});

test('streak survives until today ends and breaks after a missed day', () => {
  const logs = ['2026-11-11', '2026-11-12', '2026-11-13'].map((date) => day(date));
  assert.equal(progress(logs).currentStreak, 3);
  assert.equal(progress([...logs, day('2026-11-14')]).currentStreak, 4);
  assert.equal(progress(logs, '2026-11-15').currentStreak, 0);
  assert.equal(progress(logs, '2026-11-15').bestStreak, 3);
});

test('best streak, gaps and month/year/leap boundaries use calendar days', () => {
  const logs = ['2024-02-28', '2024-02-29', '2024-03-01', '2024-12-31', '2025-01-01'].map((date) => day(date));
  const p = progress(logs, '2025-01-01');
  assert.equal(p.bestStreak, 3);
  assert.equal(p.currentStreak, 2);
  assert.equal(p.accumulatedPoints, 500);
});

test('members, Human-only placeholders, future entries and invalid dates cannot earn points', () => {
  const logs = [day('2026-11-14', { profileId: 'b' }), day('2026-11-13', { wellbeingSaved: false }), day('2026-11-15'), day('2026-02-30')];
  assert.equal(progress(logs).accumulatedPoints, 0);
  assert.equal(progress(logs).currentStreak, 0);
  assert.throws(() => progress([], 'not-a-date'));
});

test('edits replace rewards, reload preserves them, and deletes remove them', () => {
  let logs = [day('2026-11-13'), day('2026-11-14')];
  logs = replaceDailyLog(logs, day('2026-11-14', { social: false }));
  assert.equal(progress(logs).accumulatedPoints, 195);
  assert.equal(progress(JSON.parse(JSON.stringify(logs))).todayPoints, 95);
  logs = logs.filter((l) => l.date !== '2026-11-14');
  assert.equal(progress(logs).todayPoints, 0);
  assert.equal(progress(logs).currentStreak, 1);
  assert.equal(progress(logs).accumulatedPoints, 100);
});

test('duplicates award one date only and historical backfill recalculates streak', () => {
  assert.equal(progress([day('2026-11-14'), day('2026-11-14')]).accumulatedPoints, 100);
  const logs = ['2026-11-11', '2026-11-13', '2026-11-14'].map((date) => day(date));
  assert.equal(progress(logs).bestStreak, 2);
  assert.equal(progress([...logs, day('2026-11-12')]).bestStreak, 4);
});

test('new Human-only logs earn nothing until Garden save, notes and scoring flag persist', () => {
  const human = mergeHealthLog([], profile, '2026-11-14', ['cefalea'], 'Notes');
  assert.equal(progress([human]).todayPoints, 0);
  const saved = mergeWellbeingLog([human], { ...human, meals: 'Lunch' });
  assert.equal(saved.wellbeingSaved, true);
  assert.equal(saved.notes, 'Notes');
  assert.ok(progress([saved]).todayPoints > 0);
  const updated = mergeHealthLog([saved], profile, saved.date, [], 'Updated notes');
  assert.equal(progress([updated]).todayPoints, progress([saved]).todayPoints);
});

test('legacy entries keep earned progress without changing stored data', () => {
  const legacy = day('2026-11-14');
  delete legacy.wellbeingSaved;
  assert.equal(progress([legacy]).todayPoints, 100);
});
