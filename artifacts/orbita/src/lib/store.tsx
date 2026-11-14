import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AlertState, DailyLog, Mission, Profile, Ship } from './types';
import { DEFAULT_MISSION, DEFAULT_SHIP, DEMO_CREW, blankProfile, migrateLogs, migrateMission, migrateProfiles, seedLogs } from './defaults';
import { load, save, wipeAll } from './storage';

interface Store {
  crew: Profile[]; selected: Profile; selectId: (id: string) => void;
  updateProfile: (p: Profile) => void; addProfile: () => string; removeProfile: (id: string) => void;
  logs: DailyLog[]; myLogs: DailyLog[]; upsertLog: (l: DailyLog) => void; deleteLog: (id: string) => void;
  ship: Ship; setShip: (s: Ship) => void; resetShip: () => void;
  mission: Mission; setMission: (m: Mission) => void;
  alerts: Record<string, AlertState>; setAlert: (id: string, s: AlertState) => void;
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
  useEffect(() => save('crew', crew), [crew]);
  useEffect(() => save('selected', selectedId), [selectedId]);
  useEffect(() => save('logs', logs), [logs]);
  useEffect(() => save('ship', ship), [ship]);
  useEffect(() => save('mission', mission), [mission]);
  useEffect(() => save('alerts', alerts), [alerts]);

  const value = useMemo<Store>(() => {
    const selected = crew.find((c) => c.id === selectedId) ?? crew[0] ?? DEMO_CREW[0];
    return {
      crew, selected, selectId: setSelectedId,
      updateProfile: (p) => setCrew((c) => c.map((x) => (x.id === p.id ? p : x))),
      addProfile: () => { const id = 'u-' + Date.now().toString(36); setCrew((c) => [...c, blankProfile(id)]); setSelectedId(id); return id; },
      removeProfile: (id) => { setCrew((c) => { const n = c.filter((x) => x.id !== id); return n.length ? n : DEMO_CREW; }); setLogs((l) => l.filter((x) => x.profileId !== id)); setSelectedId((s) => (s === id ? DEMO_CREW[0].id : s)); },
      logs, myLogs: logs.filter((l) => l.profileId === selected.id).sort((a, b) => b.date.localeCompare(a.date)),
      upsertLog: (l) => setLogs((all) => [...all.filter((x) => !(x.profileId === l.profileId && x.date === l.date) && x.id !== l.id), l]),
      deleteLog: (id) => setLogs((all) => all.filter((x) => x.id !== id)),
      ship, setShip, resetShip: () => setShip(DEFAULT_SHIP),
      mission, setMission,
      alerts, setAlert: (id, s) => setAlerts((a) => ({ ...a, [id]: s })),
      resetAll: () => { wipeAll(); setCrew(DEMO_CREW); setSelectedId(DEMO_CREW[0].id); setLogs(seedLogs()); setShip(DEFAULT_SHIP); setMission(DEFAULT_MISSION()); setAlerts({}); },
    };
  }, [crew, selectedId, logs, ship, mission, alerts]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useStore() { const s = useContext(Ctx); if (!s) throw new Error('StoreProvider missing'); return s; }
