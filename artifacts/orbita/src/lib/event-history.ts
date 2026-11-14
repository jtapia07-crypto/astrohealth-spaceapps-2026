import type { Alert, Severity } from './alerts';
import type { AlertState } from './types';

export interface EventRecord {
  id: string; alertId: string; profileId?: string; source: 'salud' | 'nave';
  title: string; cause: string; actions: string[]; contact: string; severity: Severity;
  at: string; note: string; sig: string;
}
export interface EventData { records: EventRecord[]; states: Record<string, AlertState> }

export function eventKey(alert: Pick<Alert, 'id' | 'source'>, profileId: string) {
  return alert.source === 'salud' ? `health:${profileId}:${alert.id}` : `ship:${alert.id}`;
}

export function snapshotEvent(alert: Alert, profileId: string, note: string, at: string): EventRecord {
  if (!note.trim()) throw new Error('Describe how the event was resolved.');
  if (note.length > 10000) throw new Error('Keep the resolution note within 10,000 characters.');
  return {
    id: crypto.randomUUID(), alertId: alert.id, ...(alert.source === 'salud' ? { profileId } : {}),
    source: alert.source, title: alert.title, cause: alert.cause, actions: [...alert.actions],
    contact: alert.contact, severity: alert.severity, at, note: note.trim(), sig: alert.sig,
  };
}

/** Earlier resolutions had no snapshots or crew identity; preserve them without guessing ownership. */
export function legacyEventData(alerts: Record<string, AlertState>): EventData {
  const records: EventRecord[] = [];
  for (const [id, state] of Object.entries(alerts)) {
    if (!state.resolved) continue;
    const source = id.startsWith('u-') || id.startsWith('h-') ? 'salud' : 'nave';
    records.push({
      id: `legacy-${id}-${state.resolved.at}`, alertId: id, source,
      title: `Previously resolved ${source === 'nave' ? 'ship' : 'health'} event (${id})`,
      cause: source === 'salud' ? 'Legacy record: the original crew member and alert details were not recorded.' : 'Legacy record: the original alert details were not recorded.',
      actions: [], contact: 'Follow the authorized mission procedure.', severity: 'info',
      at: state.resolved.at, note: state.resolved.note, sig: state.resolved.sig,
    });
  }
  return { records, states: {} };
}
