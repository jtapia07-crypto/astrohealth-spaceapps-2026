import { useCallback, useEffect, useRef, useState } from 'react';
import type { Evaluation, Status } from '../types';

export type Mood = 'optimal' | 'tired' | 'stressed' | 'overloaded';
export interface LogEntry { id: number; ts: number; sol: number; status: Status; kind: 'auto' | 'manual'; mood?: Mood; text: string }
const KEY = 'astrohealth.crewlog.v1';

export function useCrewLog(ev: Evaluation, sol: number) {
  const [log, setLog] = useState<LogEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(log.slice(0, 200))); } catch { /* offline storage lleno */ } }, [log]);

  const add = useCallback((e: Omit<LogEntry, 'id' | 'ts'>) => setLog(l => [{ ...e, id: Date.now() + Math.random(), ts: Date.now() }, ...l]), []);

  const seen = useRef<Set<string>>(new Set());
  useEffect(() => {
    const now = new Set(ev.events.map(x => x.code));
    ev.events.forEach(x => {
      if (!seen.current.has(x.code)) add({ sol, status: x.status, kind: 'auto', text: `${x.title}: evento detectado. Protocolo disponible en Triaje.` });
    });
    seen.current = now;
  }, [ev.events, sol, add]);
  return { log, add, clear: () => setLog([]) };
}
