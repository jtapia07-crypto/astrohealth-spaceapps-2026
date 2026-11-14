import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeHealthLog, mergeWellbeingLog, replaceDailyLog } from '../src/lib/daily-log.ts';
import { eventKey, legacyEventData, snapshotEvent } from '../src/lib/event-history.ts';

const profile = { id: 'member-a', sleepGoal: 8 };
const log = { id: 'a', profileId: profile.id, date: '2026-01-10', sleepHours: 7.5, hydration: 2.4, sleepQuality: 4, mood: 4, stress: 2, exercise: 100, social: true, meals: 'Saved meals', notes: 'Saved health note', symptoms: ['cefalea'] };

test('Human save only replaces symptoms and notes, keeping all Garden fields', () => {
  const next = mergeHealthLog([log], profile, log.date, ['fatiga'], 'New note');
  assert.deepEqual(next, { ...log, symptoms: ['fatiga'], notes: 'New note' });
  assert.equal(replaceDailyLog([log], next).length, 1);
});

test('Garden save keeps the latest health fields even when its draft is stale', () => {
  const stale = { ...log, sleepHours: 9, symptoms: [], notes: 'stale' };
  const next = mergeWellbeingLog([log], stale);
  assert.deepEqual(next.symptoms, ['cefalea']);
  assert.equal(next.notes, log.notes);
  assert.equal(next.sleepHours, 9);
});

test('new dates and different crew never inherit another record', () => {
  const next = mergeHealthLog([log], { ...profile, id: 'member-b' }, log.date, [], 'Other member');
  assert.equal(next.profileId, 'member-b');
  assert.equal(next.sleepHours, 8);
  assert.equal(replaceDailyLog([log], next).length, 2);
  assert.throws(() => mergeHealthLog([], profile, '2026-02-30', [], 'bad date'));
});

const alert = { id: 'u-chest', source: 'salud', sig: '2026-01-10', title: 'Chest pain reported', severity: 'urgente', cause: 'Test trigger', actions: ['Call flight surgeon'], contact: 'Flight surgeon', link: '/' };
test('health states are per member while ship states are shared', () => {
  assert.notEqual(eventKey(alert, 'a'), eventKey(alert, 'b'));
  assert.equal(eventKey({ ...alert, source: 'nave' }, 'a'), eventKey({ ...alert, source: 'nave' }, 'b'));
});

test('resolved snapshot retains details independently of current triggers', () => {
  const snapshot = snapshotEvent(alert, 'member-a', '  Authorized assessment completed  ', '2026-01-10T12:00:00Z');
  assert.equal(snapshot.profileId, 'member-a');
  assert.equal(snapshot.note, 'Authorized assessment completed');
  alert.actions.push('Later change');
  assert.deepEqual(snapshot.actions, ['Call flight surgeon']);
  assert.throws(() => snapshotEvent(alert, 'member-a', ' ', 'now'));
});

test('legacy resolution notes are retained without inventing crew identity', () => {
  const migrated = legacyEventData({ 'h-sleep': { resolved: { at: '2026-01-01', sig: 'old', note: 'Rest scheduled' } }, co2: { resolved: { at: '2026-01-02', sig: 'c', note: 'Ventilation checked' } } });
  assert.equal(migrated.records.length, 2);
  assert.ok(migrated.records.every((record) => record.profileId === undefined));
  assert.equal(migrated.records.find((record) => record.source === 'salud').note, 'Rest scheduled');
});
