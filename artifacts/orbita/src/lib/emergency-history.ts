export interface EmergencyInput {
  date: string;
  emergency: string;
  method: string;
  outcome: string;
}

export interface EmergencyRecord extends EmergencyInput {
  id: string;
  profileId: string;
  example: boolean;
}

export function validateEmergency(input: EmergencyInput): EmergencyInput {
  const clean = {
    date: input.date.trim(),
    emergency: input.emergency.trim(),
    method: input.method.trim(),
    outcome: input.outcome.trim(),
  };
  const parsed = new Date(`${clean.date}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean.date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== clean.date) {
    throw new Error('Enter a valid event date.');
  }
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (clean.date > today) throw new Error('A resolved emergency cannot have a future date.');
  for (const field of ['emergency', 'method', 'outcome'] as const) {
    if (!clean[field]) throw new Error('Complete the emergency, method and outcome fields.');
    if (clean[field].length > 2000) throw new Error('Keep each field within 2,000 characters.');
  }
  return clean;
}

export function exampleEmergencies(profileId: string): EmergencyRecord[] {
  return [
    {
      id: `example-${profileId}-1`, profileId, example: true, date: '2026-10-12',
      emergency: 'Simulated severe dizziness during exercise',
      method: 'Exercise was stopped, a crewmate stayed with the astronaut, and the flight surgeon directed evaluation and supervised recovery.',
      outcome: 'Fictional scenario: symptoms resolved after ground-directed assessment. No treatment effectiveness was measured.',
    },
    {
      id: `example-${profileId}-2`, profileId, example: true, date: '2026-10-04',
      emergency: 'Simulated headache with a cabin CO2 alert',
      method: 'Crew notified mission control, checked ventilation under an authorized procedure and followed the flight surgeon’s assessment.',
      outcome: 'Fictional scenario: cabin readings returned to the simulated reference range and the headache resolved.',
    },
  ];
}

export function recordsForProfile(records: EmergencyRecord[], profileId: string): EmergencyRecord[] {
  return [...records.filter((record) => record.profileId === profileId), ...exampleEmergencies(profileId)]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}
