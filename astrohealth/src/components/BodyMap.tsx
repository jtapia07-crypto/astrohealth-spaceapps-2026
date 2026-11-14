import { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { worst } from '../utils/riskCalculator';
import { Badge } from './ui';
import type { Status } from '../types';

type Zone = 'brain' | 'heart' | 'bone';
const DIAG: Record<Zone, Record<Status, string>> = {
  brain: { NOMINAL: 'Carga cognitiva y estrés dentro de rango.', WARNING: 'Fatiga cognitiva: reduzca tareas y respire.', CRITICAL: 'Sobrecarga severa: pausa operativa y soporte.' },
  heart: { NOMINAL: 'Ritmo y oxigenación estables.', WARNING: 'Parámetros cardiorrespiratorios alterados: reposo y reevaluar.', CRITICAL: 'Riesgo cardiovascular: abra el protocolo de Triaje.' },
  bone: { NOMINAL: 'Calcio estable; la gravedad no muestra efecto.', WARNING: 'Calcio fuera de rango: posible pérdida ósea.', CRITICAL: 'Calcio crítico: contacte soporte y proteja el esqueleto.' },
};

export default function BodyMap() {
  const { data, evaluation: ev } = useMission();
  const [zone, setZone] = useState<Zone>('heart');
  const m = ev.metrics;
  const st: Record<Zone, Status> = { brain: worst(m.tlx, m.cortisol), heart: worst(m.heartRate, m.hrv, m.oxygenSaturation), bone: m.calcium };
  const g = data.env.gravity;
  const info: Record<Zone, string> = {
    brain: `NASA-TLX ${ev.tlxAverage.toFixed(1)} · Cortisol ${data.biomarkers.cortisol.toFixed(1)} nmol/L`,
    heart: `${data.vitals.heartRate.toFixed(0)} bpm · HRV ${data.vitals.hrv.toFixed(0)} ms · SpO₂ ${data.vitals.oxygenSaturation.toFixed(0)} %`,
    bone: `Calcio ${data.biomarkers.calcium.toFixed(1)} mg/dL · Gravedad ${g} g`,
  };
  const names: Record<Zone, string> = { brain: 'Cabeza / Cerebro', heart: 'Corazón / Tórax', bone: 'Sistema óseo' };
  const pos: Record<Zone, [number, number]> = { brain: [100, 36], heart: [100, 118], bone: [100, 255] };
  const node = (z: Zone, extra?: [number, number]) => {
    const [x, y] = extra ?? pos[z];
    return (
      <g key={`${z}${x}`} className={`node ${st[z].toLowerCase()} ${zone === z ? 'sel' : ''}`} onMouseEnter={() => setZone(z)} onClick={() => setZone(z)} tabIndex={0} onFocus={() => setZone(z)}>
        <circle cx={x} cy={y} r="16" className="node-ring" /><circle cx={x} cy={y} r="7" className={`node-core ${z === 'heart' ? 'beat' : ''}`}
          style={z === 'heart' ? { animationDuration: `${60 / Math.max(30, data.vitals.heartRate)}s` } : undefined} />
      </g>
    );
  };
  return (
    <div className="body-wrap">
      <svg viewBox="0 0 200 330" className="body-svg" role="img" aria-label="Cuerpo humano interactivo">
        <defs><linearGradient id="bodyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A855F7" stopOpacity=".35" /><stop offset="1" stopColor="#22D3EE" stopOpacity=".15" /></linearGradient></defs>
        <g fill="url(#bodyg)" stroke="#A855F7" strokeOpacity=".6" strokeWidth="1.5">
          <circle cx="100" cy="36" r="24" />
          <rect x="92" y="58" width="16" height="14" rx="6" />
          <rect x="62" y="70" width="76" height="110" rx="34" />
          <rect x="34" y="78" width="22" height="104" rx="11" /><rect x="144" y="78" width="22" height="104" rx="11" />
          <rect x="70" y="172" width="25" height="140" rx="12" /><rect x="105" y="172" width="25" height="140" rx="12" />
        </g>
        <g className="bone-lines" stroke="#22D3EE" strokeOpacity=".4" strokeWidth="2" strokeLinecap="round"><path d="M82 190V300M118 190V300M45 92V170M155 92V170" /></g>
        {node('brain')}{node('heart')}{node('bone')}{node('bone', [100, 205])}
      </svg>
      <div className={`float-card ${st[zone].toLowerCase()}`} key={zone}>
        <div className="fc-head"><strong>{names[zone]}</strong><Badge status={st[zone]} /></div>
        <p className="fc-num">{info[zone]}</p><p className="muted">{DIAG[zone][st[zone]]}</p>
      </div>
    </div>
  );
}
