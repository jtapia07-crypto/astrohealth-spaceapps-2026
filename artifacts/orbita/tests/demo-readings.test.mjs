import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SHIP, DEMO_CREW, seedLogs, migrateLogs, migrateShip } from '../src/lib/defaults.ts';
import { healthReports } from '../src/lib/health.ts';
import { deriveAlerts } from '../src/lib/alerts.ts';

test('Valeria demo has a red head warning with matching numeric sleep data', () => {
  const latest = seedLogs().find((l) => l.id === 's3');
  const head = healthReports(DEMO_CREW[0], DEFAULT_SHIP, latest).find((r) => r.id === 'cabeza');
  assert.equal(head.level, 'alerta');
  assert.equal(head.score, 46);
  assert.ok(head.metrics.some((m) => m.k === 'Sleep' && m.v === '4.4 h'));
  assert.ok(head.actions.length > 0);
  assert.equal(deriveAlerts(DEFAULT_SHIP, latest, DEMO_CREW[0]).find((a) => a.id === 'h-sleep').severity, 'critico');
});

test('old untouched demo log updates but edited and personal entries are preserved', () => {
  const old = { ...seedLogs()[2], sleepHours: 5.4 };
  assert.equal(migrateLogs([old])[0].sleepHours, 4.4);
  const edited = { ...old, notes: 'My own note' };
  assert.equal(migrateLogs([edited])[0].sleepHours, 5.4);
  const personal = { ...old, id: 'personal' };
  assert.deepEqual(migrateLogs([personal])[0], personal);
});

test('battery default is 93 and legacy default updates without changing other readings', () => {
  assert.equal(DEFAULT_SHIP.energy, 93);
  assert.deepEqual(migrateShip({ ...DEFAULT_SHIP, energy: 84 }), DEFAULT_SHIP);
  const custom = { ...DEFAULT_SHIP, energy: 41 };
  assert.deepEqual(migrateShip(custom), custom);
});
