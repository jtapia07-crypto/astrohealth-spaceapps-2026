import type { SpaceWeather } from '../types';

const BASE = 'https://api.nasa.gov/DONKI';
const KEY = 'DEMO_KEY';
const fmt = (d: Date) => d.toISOString().slice(0, 10);

/** Telemetría local calibrada con valores de referencia NASA HRP (fallback offline-first). */
export const OFFLINE_WEATHER: SpaceWeather = {
  source: 'OFFLINE', flareCount: 0, topFlareClass: '—', sepCount: 0, radiationBoost: 0, fetchedAt: Date.now(),
};

async function getJson(path: string, ms = 6000): Promise<unknown[]> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 86400000);
    const res = await fetch(`${BASE}/${path}?startDate=${fmt(start)}&endDate=${fmt(end)}&api_key=${KEY}`, { signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`); // 429 = límite de DEMO_KEY
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } finally {
    clearTimeout(timer);
  }
}

const classWeight = (c: string) => {
  const base = ({ X: 3, M: 2, C: 1, B: 0.5, A: 0.25 } as Record<string, number>)[c[0]] ?? 0;
  return base * (parseFloat(c.slice(1)) || 1);
};

/** Consulta DONKI FLR + SEP. Si falla (sin red, límite de clave), devuelve el fallback offline sin lanzar errores. */
export async function fetchSpaceWeather(): Promise<SpaceWeather> {
  try {
    const [flr, sep] = await Promise.all([getJson('FLR'), getJson('SEP')]);
    const classes = (flr as { classType?: string }[]).map(f => f.classType ?? '').filter(Boolean);
    const top = classes.sort((a, b) => classWeight(b) - classWeight(a))[0] ?? '—';
    const letter = top[0];
    const boost = (letter === 'X' ? 60 : letter === 'M' ? 25 : letter === 'C' ? 8 : 0) + sep.length * 15;
    return { source: 'LIVE', flareCount: flr.length, topFlareClass: top, sepCount: sep.length, radiationBoost: boost, fetchedAt: Date.now() };
  } catch {
    return { ...OFFLINE_WEATHER, fetchedAt: Date.now() };
  }
}
