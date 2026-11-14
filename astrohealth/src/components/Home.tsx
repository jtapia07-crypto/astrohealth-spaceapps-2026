import { useMission } from '../context/MissionContext';
import BodyMap from './BodyMap';
import { Badge } from './ui';
import type { Status } from '../types';

export type TabId = 'home' | 'bio' | 'env' | 'triage' | 'flora';
const Light = ({ s, label, go }: { s: Status; label: string; go: () => void }) => (
  <button className={`light ${s.toLowerCase()}`} onClick={go}><span className="sem-light" />{label}<Badge status={s} /></button>
);
const Chip = ({ l, v, s }: { l: string; v: string; s: Status }) => <div className={`chip ${s.toLowerCase()}`}><span>{l}</span><b>{v}</b></div>;

export default function Home({ go }: { go: (t: TabId) => void }) {
  const { evaluation: ev, data } = useMission(); const e = data.env, m = ev.metrics;
  return (
    <div className="home">
      <section className={`frame global-frame ${ev.overall.toLowerCase()}`}>
        <h3>Estado global</h3>
        <div className="orb"><span className="orb-core" /><span className="orb-ring" /><span className="orb-ring r2" /></div>
        <Badge status={ev.overall} />
        <div className="lights"><Light s={ev.bio} label="Biometría" go={() => go('bio')} /><Light s={ev.env} label="Entorno" go={() => go('env')} /><Light s={ev.mental} label="Salud mental" go={() => go('flora')} /></div>
        <p className="muted">{ev.events.length ? ev.events.map(x => x.title).join(' · ') : 'Sin eventos combinados activos.'}</p>
        {ev.events.length > 0 && <button className="neon small" onClick={() => go('triage')}>Abrir protocolo</button>}
      </section>
      <section className="frame body-frame"><h3>Cuerpo humano interactivo</h3><BodyMap /></section>
      <section className="frame env-frame">
        <h3>Resumen de entorno</h3>
        <div className="chips">
          <Chip l="Radiación" v={`${e.radiationDoseRate.toFixed(0)} µSv/h`} s={m.radiationDoseRate} />
          <Chip l="CO₂" v={`${e.co2Level.toFixed(0)} ppm`} s={m.co2Level} />
          <Chip l="Latencia" v={`${e.commLatencyMin.toFixed(1)} min`} s={m.commLatencyMin} />
          <Chip l="Confinamiento" v={`${e.daysInConfinement} días`} s={m.daysInConfinement} />
        </div>
        <button className="neon small" onClick={() => go('env')}>Ver peligros HRP</button>
      </section>
    </div>
  );
}
