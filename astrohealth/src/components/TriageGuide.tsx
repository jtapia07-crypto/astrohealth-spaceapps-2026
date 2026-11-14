import { useEffect, useState } from 'react';
import { useMission } from '../context/MissionContext';
import { Badge } from './ui';
import type { EventCode } from '../types';

type Proto = { title: string; steps: [string, string][] };
const PROTOCOLS: Record<EventCode | 'NONE', Proto> = {
  CARDIAC_EMERGENCY: { title: 'Paro cardíaco / arritmia', steps: [
    ['Asegure la zona', 'Fije al tripulante a una superficie rígida o a un arnés. Avise a toda la tripulación.'],
    ['Verifique respuesta y respiración', 'Llámelo en voz alta, toque el hombro y observe el pecho durante 10 segundos.'],
    ['Conecte el desfibrilador (AED)', 'Coloque los parches como indica el dibujo del equipo y siga las instrucciones de voz.'],
    ['Compresiones torácicas', 'Dos manos en el centro del pecho, 100-120 por minuto. En microgravedad use la técnica de arnés o de pies.'],
    ['Oxigenación', 'Administre oxígeno con mascarilla y vigile SpO₂ en el panel.'],
    ['Registre y reevalúe', 'Anote la hora, repita la evaluación cada 2 minutos y prepare el mensaje diferido a Tierra.'] ] },
  SOLAR_RADIATION_STRESS: { title: 'Tormenta solar (SPE) y estrés agudo', steps: [
    ['Refugio inmediato', 'Muévase al módulo con mayor blindaje (zona de refugio de tormenta).'],
    ['Reduzca la exposición', 'Suspenda actividades extravehiculares y apague equipos no críticos.'],
    ['Calme el estrés', 'Haga 2 minutos de respiración lenta: inhale 4 s, exhale 6 s.'],
    ['Controle síntomas', 'Vigile náuseas, vómito o fatiga; registre en la bitácora.'],
    ['Monitoree dosis', 'Permanezca hasta que la tasa baje de 100 µSv/h y revise la dosis acumulada.'] ] },
  CABIN_HYPOXIA: { title: 'Toxicidad por CO₂ / hipoxia de cabina', steps: [
    ['Active circulación de aire', 'Encienda ventiladores y abra rutas de flujo entre módulos.'],
    ['Cambie de módulo', 'Muévase al área con menor CO₂ en el panel.'],
    ['Reemplace cartuchos', 'Cambie los cartuchos del depurador de CO₂.'],
    ['Oxígeno suplementario', 'Use mascarilla si SpO₂ está bajo 93 %.'],
    ['Reevalúe', 'Verifique CO₂, presión y SpO₂ cada 5 minutos.'] ] },
  ISOLATION_FATIGUE: { title: 'Sobrecarga conductual por aislamiento', steps: [
    ['Pausa operativa', 'Delegue o posponga tareas no críticas por 30 minutos.'],
    ['Sesión de respiración', 'Complete la sesión guiada de 2 minutos en AstroFlora.'],
    ['Bitácora emocional', 'Registre cómo se siente, sin juzgar.'],
    ['Contacto social', 'Converse con un compañero o escuche un mensaje de familiares.'],
    ['Escale si persiste', 'Si NASA-TLX sigue sobre 7.5 por 24 h, programe consulta diferida con psicología de vuelo.'] ] },
  NONE: { title: 'Sin emergencia activa · Lista de revisión rutinaria', steps: [
    ['Revise semáforos', 'Confirme que Biometría y Peligros externos estén en NOMINAL.'],
    ['Actualice NASA-TLX', 'Registre su carga de trabajo al finalizar cada turno.'],
    ['Hidratación y ejercicio', 'Cumpla el ejercicio diario para proteger hueso y corazón.'] ] },
};

export default function TriageGuide() {
  const { evaluation: ev } = useMission();
  const crit = ev.events.find(x => x.status === 'CRITICAL') ?? ev.events[0];
  const code: EventCode | 'NONE' = crit?.code ?? 'NONE';
  const proto = PROTOCOLS[code];
  const [done, setDone] = useState<boolean[]>([]);
  useEffect(() => setDone([]), [code]);
  return (
    <div className="stack">
      <div className={`banner ${ev.overall.toLowerCase()}`}><Badge status={crit?.status ?? 'NOMINAL'} />
        <div className="banner-text"><strong>{proto.title}</strong>{crit && <div>{crit.detail}</div>}</div></div>
      <ol className="steps">
        {proto.steps.map(([t, d], i) => (
          <li key={i} className={done[i] ? 'done' : ''} onClick={() => setDone(x => { const n = [...x]; n[i] = !n[i]; return n; })}>
            <span className="num">{done[i] ? '✓' : i + 1}</span>
            <div><h3>{t}</h3><p>{d}</p></div>
          </li>
        ))}
      </ol>
      <p className="muted">Toque cada paso al completarlo. Protocolo pensado para tripulantes sin formación médica avanzada · funciona 100 % offline.</p>
    </div>
  );
}
