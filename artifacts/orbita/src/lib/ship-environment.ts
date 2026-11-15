import type { Destination, Ship } from './types';
import type { SpaceWeather } from '../hooks/use-live-telemetry';

export interface EnvironmentalReading {
  id: string;
  label: string;
  value: string;
  ok: boolean;
}

const within = (value: number, min: number, max: number) =>
  Number.isFinite(value) && value >= min && value <= max;

// Exterior readings describe the nominal orbital demo, not the cabin atmosphere.
export const EXTERNAL_READINGS: EnvironmentalReading[] = [
  { id: 'surface-temp', label: 'Surface temperature', value: '+95 °C', ok: true },
  { id: 'gravity-regime', label: 'Gravity regime', value: 'Microgravity', ok: true },
  { id: 'external-radiation', label: 'Radiation dose rate', value: '1.20 mSv/d', ok: true },
  { id: 'solar-activity', label: 'Solar activity', value: 'Quiet', ok: true },
  { id: 'orbital-altitude', label: 'Orbital altitude', value: '400 km', ok: true },
  { id: 'solar-exposure', label: 'Solar exposure', value: 'Sunlight', ok: true },
  { id: 'debris-risk', label: 'Orbital debris risk', value: 'Low', ok: true },
];

export function liveExternalReadings(
  weather: SpaceWeather,
  ship: Ship,
  destination: Destination
): EnvironmentalReading[] {
  const gravityLabel =
    destination === 'moon'
      ? '0.165 g (Lunar)'
      : destination === 'mars'
        ? '0.38 g (Martian)'
        : 'Microgravity';

  const tempSign = weather.externalTempC > 0 ? '+' : '';
  const isStorming = weather.kpIndex >= 5 || weather.solarFlareClass.startsWith('X');
  const isElevated = weather.kpIndex >= 4 || weather.solarFlareClass.startsWith('M');

  const solarActivityLabel = isStorming
    ? `Storm · ${weather.solarFlareClass} (Kp ${weather.kpIndex})`
    : isElevated
      ? `Active · ${weather.solarFlareClass} (Kp ${weather.kpIndex})`
      : `Quiet · ${weather.solarFlareClass} (Kp ${weather.kpIndex})`;

  const externalRad = Number((ship.radiation * 2.1).toFixed(2));
  const debrisRisk = weather.kpIndex >= 6 ? 'Elevated (Drag)' : 'Low';

  return [
    {
      id: 'surface-temp',
      label: 'Surface temperature',
      value: `${tempSign}${weather.externalTempC.toFixed(1)} °C`,
      ok: within(weather.externalTempC, -130, 125),
    },
    {
      id: 'gravity-regime',
      label: 'Gravity regime',
      value: gravityLabel,
      ok: true,
    },
    {
      id: 'external-radiation',
      label: 'Radiation dose rate',
      value: `${externalRad.toFixed(2)} mSv/d`,
      ok: externalRad <= 2.5,
    },
    {
      id: 'solar-activity',
      label: 'Solar activity',
      value: solarActivityLabel,
      ok: !isStorming,
    },
    {
      id: 'orbital-altitude',
      label: 'Orbital altitude',
      value: `${weather.altitudeKm.toLocaleString('en-US')} km`,
      ok: true,
    },
    {
      id: 'solar-exposure',
      label: 'Solar exposure',
      value: `Sunlight (${weather.solarWindKms} km/s)`,
      ok: true,
    },
    {
      id: 'debris-risk',
      label: 'Orbital debris risk',
      value: debrisRisk,
      ok: weather.kpIndex < 6,
    },
  ];
}

export function lifeSupportStatus(ship: Ship) {
  return [
    { id: 'co2-removal', label: 'CO₂ removal system', ok: within(ship.co2, 0, 4) },
    { id: 'oxygen-generation', label: 'Oxygen generation system', ok: within(ship.o2, 19.5, 23.5) },
  ].map((system) => ({ ...system, value: system.ok ? 'Operational' : 'Check required' }));
}

export function internalReadings(ship: Ship): EnvironmentalReading[] {
  return [
    { id: 'o2', label: 'Oxygen', value: `${ship.o2} %`, ok: within(ship.o2, 19.5, 23.5) },
    { id: 'co2', label: 'CO₂', value: `${ship.co2} mmHg`, ok: within(ship.co2, 0, 4) },
    { id: 'pressure', label: 'Cabin pressure', value: `${ship.pressure} kPa`, ok: within(ship.pressure, 95, 105) },
    { id: 'temp', label: 'Temperature', value: `${ship.temp} °C`, ok: within(ship.temp, 18, 27) },
    { id: 'humidity', label: 'Humidity', value: `${ship.humidity} %`, ok: within(ship.humidity, 25, 75) },
    { id: 'radiation', label: 'Radiation dose rate', value: `${ship.radiation.toFixed(2)} mSv/d`, ok: within(ship.radiation, 0, 1) },
    { id: 'noise', label: 'Noise level', value: '55 dBA', ok: true },
    { id: 'air-circulation', label: 'Air circulation', value: 'Normal', ok: true },
    { id: 'water', label: 'Water reserves', value: `${ship.water} %`, ok: within(ship.water, 30, 100) },
    { id: 'energy', label: 'Battery charge', value: `${ship.energy} %`, ok: within(ship.energy, 30, 100) },
  ];
}