import { useEffect, useRef, useState } from 'react';
import type { Destination, Ship } from '../lib/types';

export interface SpaceWeather {
  status: 'ONLINE' | 'OFFLINE';
  kpIndex: number;
  solarFlareClass: string;
  solarWindKms: number;
  externalTempC: number;
  orbitalVelocityKms: number;
  altitudeKm: number;
  lastUpdated: string;
}

const NASA_API_KEY =
  import.meta.env.VITE_NASA_API_KEY || 'dJnLtnQWnjg6NjfNc6DDMdBndTqkjMjcMhM6rpg9';

const DEST_BASELINE: Record<
  Destination,
  { temp: number; vel: number; alt: number; radBase: number }
> = {
  iss: { temp: -18, vel: 7.66, alt: 408, radBase: 0.42 },
  moon: { temp: -53, vel: 1.02, alt: 384400, radBase: 1.35 },
  mars: { temp: -63, vel: 24.07, alt: 225000000, radBase: 1.85 },
};

const clamp = (val: number, min: number, max: number) =>
  Math.min(max, Math.max(min, val));

const round2 = (val: number) => Math.round(val * 100) / 100;

export function useLiveTelemetry(
  destination: Destination,
  liveEnabled: boolean,
  onTickShip?: (updater: (prev: Ship) => Ship) => void
) {
  const base = DEST_BASELINE[destination] ?? DEST_BASELINE.iss;
  const nasaRef = useRef<{ kpIndex: number; flareBoost: number }>({
    kpIndex: 2.3,
    flareBoost: 0,
  });

  const [weather, setWeather] = useState<SpaceWeather>({
    status: 'OFFLINE',
    kpIndex: 2.3,
    solarFlareClass: 'B4.1',
    solarWindKms: 412,
    externalTempC: base.temp,
    orbitalVelocityKms: base.vel,
    altitudeKm: base.alt,
    lastUpdated: new Date().toLocaleTimeString(),
  });

  useEffect(() => {
    setWeather((prev) => ({
      ...prev,
      externalTempC: base.temp,
      orbitalVelocityKms: base.vel,
      altitudeKm: base.alt,
      lastUpdated: new Date().toLocaleTimeString(),
    }));
  }, [destination, base]);

  useEffect(() => {
    const controller = new AbortController();
    const end = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);

    async function fetchNasaDonki() {
      try {
        const [gstRes, flrRes] = await Promise.all([
          fetch(
            `https://api.nasa.gov/DONKI/GST?startDate=${start}&endDate=${end}&api_key=${NASA_API_KEY}`,
            { signal: controller.signal }
          ),
          fetch(
            `https://api.nasa.gov/DONKI/FLR?startDate=${start}&endDate=${end}&api_key=${NASA_API_KEY}`,
            { signal: controller.signal }
          ),
        ]);

        if (!gstRes.ok && !flrRes.ok) throw new Error('DONKI unreachable');

        const gstData = gstRes.ok ? await gstRes.json() : [];
        const flrData = flrRes.ok ? await flrRes.json() : [];

        const latestGst = Array.isArray(gstData) ? gstData.at(-1) : null;
        const latestFlr = Array.isArray(flrData) ? flrData.at(-1) : null;

        const kp = Number(
          latestGst?.allKpIndex?.at(-1)?.kpIndex ?? round2(2.1 + Math.random() * 1.4)
        );
        const flare: string = latestFlr?.classType ?? 'C1.4';

        const flareBoost = flare.startsWith('X')
          ? 0.95
          : flare.startsWith('M')
            ? 0.4
            : 0.05;

        nasaRef.current = { kpIndex: kp, flareBoost };

        setWeather((prev) => ({
          ...prev,
          status: 'ONLINE',
          kpIndex: kp,
          solarFlareClass: flare,
          lastUpdated: new Date().toLocaleTimeString(),
        }));
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setWeather((prev) => ({
          ...prev,
          status: 'OFFLINE',
          lastUpdated: new Date().toLocaleTimeString(),
        }));
      }
    }

    fetchNasaDonki();
    const pollId = setInterval(fetchNasaDonki, 120_000);
    return () => {
      controller.abort();
      clearInterval(pollId);
    };
  }, [destination]);

  useEffect(() => {
    if (!liveEnabled) return;

    const tick = setInterval(() => {
      const jitter = () => (Math.random() - 0.5) * 2;
      const { kpIndex, flareBoost } = nasaRef.current;

      setWeather((prev) => ({
        ...prev,
        solarWindKms: Math.round(clamp(prev.solarWindKms + jitter() * 9, 310, 780)),
        externalTempC: round2(base.temp + jitter() * 3.5),
        orbitalVelocityKms: round2(base.vel + jitter() * 0.03),
        altitudeKm: Math.round(base.alt + jitter() * (destination === 'iss' ? 2 : 15)),
        lastUpdated: new Date().toLocaleTimeString(),
      }));

      if (onTickShip) {
        onTickShip((prev) => ({
          ...prev,
          o2: round2(clamp(prev.o2 + jitter() * 0.06, 18.5, 23.0)),
          co2: round2(clamp(prev.co2 + jitter() * 0.08, 0.4, 5.2)),
          pressure: round2(clamp(prev.pressure + jitter() * 0.12, 96.0, 104.0)),
          temp: round2(clamp(prev.temp + jitter() * 0.15, 19.0, 25.5)),
          humidity: Math.round(clamp(prev.humidity + jitter() * 1, 35, 68)),
          radiation: round2(
            clamp(
              base.radBase + (kpIndex / 10) * 0.35 + flareBoost + jitter() * 0.04,
              0.1,
              4.5
            )
          ),
        }));
      }
    }, 2000);

    return () => clearInterval(tick);
  }, [destination, liveEnabled, base, onTickShip]);

  return weather;
}