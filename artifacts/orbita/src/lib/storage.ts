const PREFIX = 'orbita:v1:';
export const KEYS = ['crew', 'selected', 'logs', 'ship', 'mission', 'alerts', 'emergencies', 'events'] as const;
export function load<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(PREFIX + key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}
export function save(key: string, value: unknown) { try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* cuota */ } }
export function saveStrict(key: string, value: unknown) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); }
  catch { throw new Error('Changes could not be saved on this device. Check browser storage permissions or available space and try again.'); }
}
export function saveEmergencyRecords(value: unknown) {
  try { localStorage.setItem(PREFIX + 'emergencies', JSON.stringify(value)); }
  catch { throw new Error('The record could not be saved on this device. Check browser storage permissions or available space and try again.'); }
}
export function exportAll() { const out: Record<string, unknown> = {}; KEYS.forEach((k) => { out[k] = load(k, null); }); return out; }
export function wipeAll() { KEYS.forEach((k) => localStorage.removeItem(PREFIX + k)); }
