import { useMission } from '../context/MissionContext';
import { Badge, Metric, Panel } from './ui';
import type { NasaTLX } from '../types';

const TLX: [keyof NasaTLX, string][] = [['mental', 'Demanda Mental'], ['physical', 'Demanda Física'], ['temporal', 'Demanda Temporal'],
  ['performance', 'Rendimiento'], ['effort', 'Esfuerzo'], ['frustration', 'Frustración']];
const f = (n: number, d = 0) => n.toLocaleString('es-CL', { maximumFractionDigits: d, minimumFractionDigits: d });

export default function Dashboard({ view }: { view: 'bio' | 'env' }) {
  const { data, evaluation: ev, setTlx, weather, forceOffline, toggleOffline, refreshWeather } = useMission();
  const { vitals: v, biomarkers: b, env: e } = data; const m = ev.metrics;
  const g = e.gravity === 0 ? '0 g Micro' : `${e.gravity} g ${e.gravity < 0.2 ? 'Luna' : 'Marte'}`;
  return (
    <div className="stack">
      <div className="stack">
        {view === 'bio' && <Panel title="Módulo 1 · Biometría interna" subtitle="Signos vitales, biomarcadores HRP y NASA-TLX" status={ev.bio}>
          <div className="metrics">
            <Metric label="Frec. cardíaca" value={f(v.heartRate)} unit="bpm" status={m.heartRate} />
            <Metric label="HRV" value={f(v.hrv)} unit="ms" status={m.hrv} />
            <Metric label="SpO₂" value={f(v.oxygenSaturation)} unit="%" status={m.oxygenSaturation} />
            <Metric label="Presión arterial" value={`${f(v.systolic)}/${f(v.diastolic)}`} unit="mmHg" status={m.bloodPressure} />
            <Metric label="Temperatura" value={f(v.bodyTemp, 1)} unit="°C" status={m.bodyTemp} />
            <Metric label="Resp." value={f(v.respiratoryRate)} unit="rpm" status={m.respiratoryRate} />
            <Metric label="Resp. galvánica" value={f(v.gsr, 1)} unit="µS" status={m.gsr} />
            <Metric label="Cortisol salival" value={f(b.cortisol, 1)} unit="nmol/L" status={m.cortisol} />
            <Metric label="Calcio en sangre" value={f(b.calcium, 1)} unit="mg/dL" status={m.calcium} />
          </div>
          <div className="tlx">
            <div className="tlx-head"><h3>Autoevaluación NASA-TLX</h3><span>Promedio {f(ev.tlxAverage, 1)} <Badge status={m.tlx} /></span></div>
            {TLX.map(([k, label]) => (
              <label key={k} className="slider"><span>{label}</span>
                <input type="range" min={1} max={10} value={Math.round(data.tlx[k])} onChange={x => setTlx(k, +x.target.value)} />
                <b>{Math.round(data.tlx[k])}</b></label>
            ))}
          </div>
        </Panel>}

        {view === 'env' && <Panel title="Módulo 2 · Peligros externos HRP" subtitle="Los 5 peligros del vuelo espacial tripulado" status={ev.env}>
          <div className="hazard"><h3>1 · Radiación espacial <em>(estándar CSA)</em></h3>
            <div className="metrics two">
              <Metric label="Tasa instantánea" value={f(e.radiationDoseRate)} unit="µSv/h" status={m.radiationDoseRate} />
              <Metric label="Dosis acumulada" value={f(e.radiationAccumulated)} unit="mSv" status={m.radiationAccumulated} />
            </div></div>
          <div className="hazard"><h3>2 · Entorno cerrado hostil</h3>
            <div className="metrics two">
              <Metric label="CO₂" value={f(e.co2Level)} unit="ppm" status={m.co2Level} />
              <Metric label="Presión de cabina" value={f(e.cabinPressure, 1)} unit="kPa" status={m.cabinPressure} />
            </div></div>
          <div className="hazard"><h3>3 · Distancia de la Tierra</h3>
            <div className="metrics two">
              <Metric label="Distancia" value={f(e.earthDistanceKm)} unit="km" status="NOMINAL" />
              <Metric label="Latencia de comunicación" value={f(e.commLatencyMin, 1)} unit="min" status={m.commLatencyMin} />
            </div></div>
          <div className="hazard"><h3>4 · Aislamiento y confinamiento</h3>
            <div className="metrics two"><Metric label="Días en misión" value={f(e.daysInConfinement)} unit="días" status={m.daysInConfinement} /></div></div>
          <div className="hazard"><h3>5 · Campos gravitatorios alterados</h3>
            <div className="metrics two"><Metric label="Gravedad actual" value={g} unit="" status={m.gravity} /></div></div>
          <div className="weather">
            <div><strong>NASA DONKI</strong> · <span className={weather.source === 'LIVE' ? 'live' : 'off'}>{weather.source === 'LIVE' ? '● EN VIVO' : '● OFFLINE (telemetría local HRP)'}</span></div>
            <div className="muted">Llamaradas 30 d: {weather.flareCount} (máx. {weather.topFlareClass}) · Eventos SEP: {weather.sepCount}</div>
            <div className="row">
              <button className="neon small" onClick={refreshWeather}>Actualizar</button>
              <button className={`neon small ${forceOffline ? 'on' : ''}`} onClick={toggleOffline}>{forceOffline ? 'Modo lejano: ON' : 'Simular distancia de la Tierra'}</button>
            </div>
          </div>
        </Panel>}
      </div>
    </div>
  );
}
