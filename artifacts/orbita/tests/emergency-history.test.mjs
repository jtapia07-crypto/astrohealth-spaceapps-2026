import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEmergency, recordsForProfile } from '../src/lib/emergency-history.ts';
import { saveEmergencyRecords, load, exportAll, wipeAll } from '../src/lib/storage.ts';

const input = { date: '2026-01-10', emergency: '  Test event  ', method: '  Supervised assessment  ', outcome: '  Resolved  ' };

test('resolved records are trimmed and reject missing, invalid and future inputs', () => {
  assert.equal(validateEmergency(input).emergency, 'Test event');
  for (const date of ['invalid', '2026-02-30', '2999-01-01']) {
    assert.throws(() => validateEmergency({ ...input, date }));
  }
  for (const field of ['emergency', 'method', 'outcome']) {
    assert.throws(() => validateEmergency({ ...input, [field]: '  ' }));
    assert.throws(() => validateEmergency({ ...input, [field]: 'a'.repeat(2001) }));
  }
});

test('history is scoped to one member and samples remain explicitly fictional', () => {
  const records = [
    { ...input, id: 'a', profileId: 'crew-a', example: false },
    { ...input, id: 'b', profileId: 'crew-b', example: false },
  ];
  const result = recordsForProfile(records, 'crew-a');
  assert.equal(result.filter((record) => !record.example).length, 1);
  assert.ok(result.every((record) => record.profileId === 'crew-a'));
  assert.equal(result.filter((record) => record.example).length, 2);
  assert.ok(result.filter((record) => record.example).every((record) => record.outcome.includes('Fictional')));
});

test('saved history reloads, exports and clears; failed writes throw rather than claim success', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const data = new Map();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => data.set(key, value),
      removeItem: (key) => data.delete(key),
    },
  });
  try {
    const records = [{ ...input, id: 'a', profileId: 'crew-a', example: false }];
    saveEmergencyRecords(records);
    assert.deepEqual(load('emergencies', []), records);
    assert.deepEqual(exportAll().emergencies, records);
    wipeAll();
    assert.deepEqual(load('emergencies', []), []);
    globalThis.localStorage.setItem = () => { throw new Error('Quota exceeded'); };
    assert.throws(() => saveEmergencyRecords(records), /could not be saved/);
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
  }
});
