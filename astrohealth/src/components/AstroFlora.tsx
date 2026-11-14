import { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { Badge } from './ui';
import type { LogEntry, Mood } from '../hooks/useCrewLog';
import type { Status } from '../types';

const MSG = { NOMINAL: '¡Florezco feliz! Tu equilibrio es estable.', WARNING: 'Me siento cansada… tomemos una pausa.', CRITICAL: 'Estoy muy agobiada. ¡Respiremos juntos!' };
const COL: Record<Status, [string, string, string]> = { NOMINAL: ['#10B981', '#A855F7', '#22D3EE'], WARNING: ['#b9892a', '#F59E0B', '#FDE68A'], CRITICAL: ['#8a2f45', '#F43F5E', '#fecdd3'] };
const MOODS: { id: Mood; label: string; mouth: string }[] = [
  { id: 'optimal', label: 'Óptimo', mouth: 'M12 26 Q20 34 28 26' }, { id: 'tired', label: 'Cansado', mouth: 'M12 28 H28' },
  { id: 'stressed', label: 'Estresado', mouth: 'M12 30 Q16 25 20 30 Q24 25 28 30' }, { id: 'overloaded', label: 'Sobrecargado', mouth: 'M12 32 Q20 22 28 32' },
];
const Face = ({ mouth }: { mouth: string }) => <svg viewBox="0 0 40 40" width="38" height="38"><circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="14" cy="17" r="2" fill="currentColor" /><circle cx="26" cy="17" r="2" fill="currentColor" /><path d={mouth} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;

export default function AstroFlora({ log, add, clear, sol }: { log: LogEntry[]; add: (e: Omit<LogEntry, 'id' | 'ts'>) => void; clear: () => void; sol: number }) {
  const { evaluation: ev, data, selfCare } = useMission();
  const [busy, setBusy] = useState(false); const [mood, setMood] = useState<Mood | null>(null); const [note, setNote] = useState('');
  const s = ev.mental; const [stem, petal, glow] = COL[s];
  const mouth = s === 'NOMINAL' ? 'M122 128 Q130 137 138 128' : s === 'WARNING' ? 'M123 130 H137' : 'M122 135 Q130 126 138 135';
  const water = () => { setBusy(true); setTimeout(() => { selfCare('breathing'); setBusy(false); add({ sol, status: s, kind: 'auto', text: 'Sesión de respiración de 2 min completada (demo comprimida).' }); }, 5000); };
  const save = () => { if (!mood && !note.trim()) return; add({ sol, status: s, kind: 'manual', mood: mood ?? undefined, text: note.trim() || 'Estado de ánimo registrado.' }); selfCare('journal'); setNote(''); setMood(null); };
  const fmt = (t: number) => new Date(t).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="flora-wrap">
      <section className={`panel ${s.toLowerCase()}`}>
        <header className="panel-head"><div><h2>AstroFlora</h2><p>Tu planta bio-empática</p></div><Badge status={s} /></header>
        <svg viewBox="0 0 260 320" className={`flora2 ${s.toLowerCase()} ${busy ? 'growing' : ''}`} role="img" aria-label={`AstroFlora ${s}`}>
          <circle cx="130" cy="140" r="115" fill={glow} opacity=".08" />
          {s === 'NOMINAL' && [0, 1, 2, 3, 4, 5].map(i => <circle key={i} className="spark" cx={60 + i * 28} cy="230" r="3" fill={glow} style={{ animationDelay: `${i * 0.5}s` }} />)}
          <g className="pot-float">
            <g className="plant">
              <path d="M130 250 C118 215 144 185 130 135" stroke={stem} strokeWidth="7" fill="none" strokeLinecap="round" />
              <path className="leaf l1" d="M128 215 C95 195 72 208 66 232 C96 238 120 232 128 215Z" fill={stem} />
              <path className="leaf l2" d="M133 188 C165 168 190 180 196 204 C166 210 140 204 133 188Z" fill={stem} />
              <g className="flower">
                {[0, 1, 2, 3, 4, 5, 6].map(i => <ellipse key={i} cx="130" cy="94" rx="14" ry="30" fill={petal} opacity=".9" transform={`rotate(${i * (360 / 7)} 130 122)`} />)}
                <circle cx="130" cy="122" r="22" fill={glow} />
                <circle cx="122" cy="118" r="3" fill="#100E24" /><circle cx="138" cy="118" r="3" fill="#100E24" />
                <path d={mouth} stroke="#100E24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </g>
            </g>
            <path d="M82 248 H178 L166 300 Q130 312 94 300Z" fill="#241b4d" stroke="#A855F7" strokeWidth="2" />
            <rect x="76" y="240" width="108" height="14" rx="7" fill="#33256b" stroke="#22D3EE" strokeWidth="1.5" />
            <circle cx="130" cy="276" r="6" fill="#22D3EE" opacity=".8" />
          </g>
          {s === 'WARNING' && <path className="drop-icon" d="M214 60 C204 78 204 90 214 90 C224 90 224 78 214 60Z" fill="#F59E0B" />}
          {busy && <g className="can"><path d="M190 40 h40 l6 30 h-52z" fill="#22D3EE" /><path d="M190 48 l-24 -8" stroke="#22D3EE" strokeWidth="5" />
            {[0, 1, 2, 3, 4].map(i => <circle key={i} className="rain" cx={168 - i * 5} cy="52" r="3" fill="#7dd3fc" style={{ animationDelay: `${i * 0.25}s` }} />)}</g>}
          {busy && [0, 1, 2].map(i => <circle key={i} className="wave" cx="130" cy="122" r="20" fill="none" stroke="#22D3EE" strokeWidth="2" style={{ animationDelay: `${i * 1}s` }} />)}
        </svg>
        <p className="flora-msg">{busy ? 'Inhala 4 s · exhala 6 s…' : MSG[s]}</p>
        <div className="row center"><button className="neon" disabled={busy} onClick={water}>💧 Regar y Respirar (2 min)</button></div>
        <p className="muted center-t">Demo: 2 min comprimidos a 5 s · NASA-TLX {ev.tlxAverage.toFixed(1)} · cortisol {data.biomarkers.cortisol.toFixed(1)}</p>
      </section>
      <section className="panel nominal">
        <header className="panel-head"><div><h2>Bitácora del astronauta</h2><p>Guardada localmente · SOL {sol}</p></div><button className="neon small" onClick={clear}>Limpiar</button></header>
        <div className="moods">{MOODS.map(o => <button key={o.id} className={`mood ${o.id} ${mood === o.id ? 'on' : ''}`} onClick={() => setMood(o.id)}><Face mouth={o.mouth} /><span>{o.label}</span></button>)}</div>
        <textarea className="note" rows={3} placeholder="Nota rápida de misión…" value={note} onChange={e => setNote(e.target.value)} />
        <button className="neon" onClick={save}>Guardar entrada</button>
        <ul className="timeline">
          {log.length === 0 && <li className="muted">Sin entradas todavía.</li>}
          {log.map(l => (
            <li key={l.id} className={l.status.toLowerCase()}><span className="tl-dot" />
              <div><small>SOL {l.sol} · {fmt(l.ts)} · {l.kind === 'auto' ? 'AUTO' : MOODS.find(x => x.id === l.mood)?.label ?? 'NOTA'}</small><p>{l.text}</p></div></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
