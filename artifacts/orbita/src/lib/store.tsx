import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AlertState, DailyLog, Mission, Profile, Ship, Symptom } from './types';
import { DEFAULT_MISSION, DEFAULT_SHIP, DEMO_CREW, blankProfile, migrateLogs, migrateMission, migrateProfiles, seedLogs } from './defaults';
import { load, save, saveStrict, saveEmergencyRecords, wipeAll } from './storage';
import { validateEmergency, type EmergencyInput, type EmergencyRecord } from './emergency-history';
import { mergeHealthLog, mergeWellbeingLog, replaceDailyLog } from './daily-log';
import { eventKey, legacyEventData, snapshotEvent, type EventData, type EventRecord } from './event-history';
import type { Alert } from './alerts';

interface Store {
  crew: Profile[]; selected: Profile; selectId: (id: string) => void;
  updateProfile: (p: Profile) => void; addProfile: () => string; removeProfile: (id: string) => void;
  logs: DailyLog[]; myLogs: DailyLog[]; upsertLog: (l: DailyLog) => void; deleteLog: (id: string) => void;
  saveHealthLog: (profileId: string, date: string, symptoms: Symptom[], notes: string) => void;
  saveWellbeingLog: (log: DailyLog) => void;
  ship: Ship; setShip: (s: Ship) => void; resetShip: () => void;
  mission: Mission; setMission: (m: Mission) => void;
  alerts: Record<string, AlertState>; setAlert: (id: string, s: AlertState) => void;
  eventRecords: EventRecord[];
  getEventState: (alert: Alert) => AlertState | undefined;
  acknowledgeEvent: (alert: Alert) => void;
  resolveEvent: (alert: Alert, note: string) => void;
  emergencyRecords: EmergencyRecord[];
  addEmergencyRecord: (profileId: string, input: EmergencyInput) => void;
  resetAll: () => void;
}
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [crew, setCrew] = useState<Profile[]>(() => migrateProfiles(load('crew', DEMO_CREW)));
  const [selectedId, setSelectedId] = useState<string>(() => load('selected', DEMO_CREW[0].id));
  const [logs, setLogs] = useState<DailyLog[]>(() => migrateLogs(load('logs', seedLogs())));
  const [ship, setShip] = useState<Ship>(() => load('ship', DEFAULT_SHIP));
  const [mission, setMission] = useState<Mission>(() => migrateMission(load('mission', DEFAULT_MISSION())));
  const [alerts, setAlerts] = useState<Record<string, AlertState>>(() => load('alerts', {}));
  const [emergencyRecords, setEmergencyRecords] = useState<EmergencyRecord[]>(() => load('emergencies', []));
  const [events, setEvents] = useState<EventData>(() => load('events', legacyEventData(load('alerts', {}))));
  useEffect(() => save('crew', crew), [crew]);
  useEffect(() => save('selected', selectedId), [selectedId]);
  useEffect(() => save('ship', ship), [ship]);
  useEffect(() => save('mission', mission), [mission]);
  useEffect(() => save('alerts', alerts), [alerts]);

  const value = useMemo<Store>(() => {
    const selected = crew.find((c) => c.id === selectedId) ?? crew[0] ?? DEMO_CREW[0];
    const commitLog = (log: DailyLog) => {
      const next = replaceDailyLog(logs, log);
      saveStrict('logs', next);
      setLogs(next);
    };
    const getEventState = (alert: Alert) => events.states[eventKey(alert, selected.id)] ?? (alert.source === 'nave' ? alerts[alert.id] : undefined);
    const commitEvents = (next: EventData) => { saveStrict('events', next); setEvents(next); };
    return {
      crew, selected, selectId: setSelectedId,
      updateProfile: (p) => setCrew((c) => c.map((x) => (x.id === p.id ? p : x))),
      addProfile: () => { const id = 'u-' + Date.now().toString(36); setCrew((c) => [...c, blankProfile(id)]); setSelectedId(id); return id; },
      removeProfile: (id) => {
        const remainingRecords = emergencyRecords.filter((record) => record.profileId !== id);
        const remainingLogs = logs.filter((log) => log.profileId !== id);
        const remainingEvents = { records: events.records.filter((record) => record.profileId !== id), states: Object.fromEntries(Object.entries(events.states).filter(([key]) => !key.startsWith(`health:${id}:`))) };
        saveStrict('logs', remainingLogs); saveStrict('events', remainingEvents); saveEmergencyRecords(remainingRecords);
        setEmergencyRecords(remainingRecords); setLogs(remainingLogs); setEvents(remainingEvents);
        setCrew((c) => { const n = c.filter((x) => x.id !== id); return n.length ? n : DEMO_CREW; });
        setSelectedId((s) => (s === id ? DEMO_CREW[0].id : s));
      },
      logs, myLogs: logs.filter((l) => l.profileId === selected.id).sort((a, b) => b.date.localeCompare(a.date)),
      upsertLog: commitLog,
      saveHealthLog: (profileId, date, symptoms, notes) => {
        const profile = crew.find((member) => member.id === profileId);
        if (!profile) throw new Error('Select an existing crew member.');
        commitLog(mergeHealthLog(logs, profile, date, symptoms, notes));
      },
      saveWellbeingLog: (log) => commitLog(mergeWellbeingLog(logs, log)),
      deleteLog: (id) => { const next = logs.filter((item) => item.id !== id); saveStrict('logs', next); setLogs(next); },
      ship, setShip, resetShip: () => setShip(DEFAULT_SHIP),
      mission, setMission,
      alerts, setAlert: (id, s) => setAlerts((a) => ({ ...a, [id]: s })),
      eventRecords: events.records, getEventState,
      acknowledgeEvent: (alert) => {
        const key = eventKey(alert, selected.id);
        commitEvents({ ...events, states: { ...events.states, [key]: { ...getEventState(alert), ack: new Date().toISOString() } } });
      },
      resolveEvent: (alert, note) => {
        const key = eventKey(alert, selected.id);
        const record = snapshotEvent(alert, selected.id, note, new Date().toISOString());
        commitEvents({ records: [...events.records, record], states: { ...events.states, [key]: { ...getEventState(alert), resolved: { at: record.at, note: record.note, sig: alert.sig } } } });
      },
      emergencyRecords,
      addEmergencyRecord: (profileId, input) => {
        if (!crew.some((profile) => profile.id === profileId)) throw new Error('Select an existing crew member before saving.');
        const next = [...emergencyRecords, { ...validateEmergency(input), id: crypto.randomUUID(), profileId, example: false }];
        saveEmergencyRecords(next);
        setEmergencyRecords(next);
      },
      resetAll: () => { wipeAll(); setCrew(DEMO_CREW); setSelectedId(DEMO_CREW[0].id); setLogs(seedLogs()); setShip(DEFAULT_SHIP); setMission(DEFAULT_MISSION()); setAlerts({}); setEmergencyRecords([]); setEvents({ records: [], states: {} }); },
    };
  }, [crew, selectedId, logs, ship, mission, alerts, emergencyRecords, events]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useStore() { const s = useContext(Ctx); if (!s) throw new Error('StoreProvider missing'); return s; }
