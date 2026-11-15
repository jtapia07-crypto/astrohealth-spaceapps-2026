import test from 'node:test';
import assert from 'node:assert/strict';
import { EXTERNAL_READINGS, internalReadings, lifeSupportStatus } from '../src/lib/ship-environment.ts';

const cabin = { o2: 22.1, co2: 2.8, pressure: 101.3, temp: 22.4, humidity: 46, radiation: 0.62, water: 78, energy: 93 };

test('internal readings match the requested ten parameters and units', () => {
  const readings = internalReadings(cabin);
  assert.deepEqual(readings.map((r) => r.label), ['Oxygen', 'CO₂', 'Cabin pressure', 'Temperature', 'Humidity', 'Radiation dose rate', 'Noise level', 'Air circulation', 'Water reserves', 'Battery charge']);
  assert.deepEqual(readings.map((r) => r.value), ['22.1 %', '2.8 mmHg', '101.3 kPa', '22.4 °C', '46 %', '0.62 mSv/d', '55 dBA', 'Normal', '78 %', '93 %']);
  assert.ok(readings.every((r) => r.ok));
});

test('external scenario has seven distinct readings, not cabin measurements', () => {
  assert.deepEqual(EXTERNAL_READINGS.map((r) => r.value), ['+95 °C', 'Microgravity', '1.20 mSv/d', 'Quiet', '400 km', 'Sunlight', 'Low']);
  assert.ok(!EXTERNAL_READINGS.some((r) => ['Oxygen', 'Cabin pressure', 'Water', 'Power'].includes(r.label)));
  assert.equal(internalReadings({ ...cabin, radiation: 0.3 })[5].value, '0.30 mSv/d');
  assert.equal(EXTERNAL_READINGS[2].value, '1.20 mSv/d');
});

test('life support statuses reflect cabin readings, including out-of-range values', () => {
  assert.ok(lifeSupportStatus(cabin).every((r) => r.value === 'Operational'));
  assert.ok(lifeSupportStatus({ ...cabin, co2: 8, o2: 14 }).every((r) => r.value === 'Check required' && !r.ok));
  assert.equal(lifeSupportStatus({ ...cabin, co2: NaN })[0].ok, false);
  assert.equal(internalReadings({ ...cabin, pressure: 70 })[2].ok, false);
});
