import test from 'node:test';
import assert from 'node:assert/strict';
import { healthReports } from '../src/lib/health.ts';

const profile = {
  id: 'test', demo: true, name: 'Test astronaut', age: 35, role: 'Commander',
  conditions: '', allergies: '', medications: '', bloodGroup: 'O+',
  hr: 62, sbp: 118, dbp: 76, spo2: 98, temp: 36.6, weight: 70,
  sleepGoal: 8, plant: 'helecho', climate: 'bosque', plantName: 'Test',
};
const ship = { gravity: 1, co2: 2.8, o2: 20.9, temp: 22, humidity: 46, radiation: 0.5 };
const log = { sleepHours: 8, hydration: 2.2, exercise: 90, stress: 2, symptoms: [] };
const heart = (p) => healthReports(p, ship, log).find((r) => r.id === 'corazon');

test('normal inputs have no flagged reports', () => {
  assert.ok(healthReports(profile, ship, log).every((r) => r.level === 'estable'));
});

test('elevated systolic or diastolic baseline produces a clear heart warning and numeric data', () => {
  for (const [sbp, dbp] of [[150, 76], [118, 95]]) {
    const report = heart({ ...profile, sbp, dbp });
    assert.equal(report.level, 'vigilar');
    assert.match(report.condition, /High blood pressure/);
    assert.ok(report.metrics.some((m) => m.v === `${sbp}/${dbp} mmHg`));
    assert.ok(report.actions.some((action) => action.includes('repeat blood pressure')));
    assert.ok(!report.actions.some((action) => action.includes('Keep the scheduled cardiovascular')));
  }
});

test('very high baseline and chest pain preserve escalation guidance', () => {
  assert.equal(heart({ ...profile, sbp: 180 }).level, 'alerta');
  assert.match(heart({ ...profile, dbp: 120 }).warning, /flight surgeon/);
  const report = healthReports(profile, ship, { ...log, symptoms: ['dolor_pecho'] }).find((r) => r.id === 'corazon');
  assert.equal(report.level, 'alerta');
  assert.match(report.warning, /URGENT: chest pain/);
});

test('flagged hydration, sleep and oxygen reports explain their actual input values', () => {
  const reports = healthReports(profile, { ...ship, o2: 17.5 }, { ...log, hydration: 1, sleepHours: 3 });
  assert.match(reports.find((r) => r.id === 'sudor').condition, /1 \/ 2.2 L/);
  assert.match(reports.find((r) => r.id === 'cabeza').condition, /3 \/ 8 h/);
  assert.match(reports.find((r) => r.id === 'sangre').condition, /17.5%/);
});
