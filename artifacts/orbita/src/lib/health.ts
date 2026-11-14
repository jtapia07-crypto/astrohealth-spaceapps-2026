import type { DailyLog, Profile, Ship } from './types';
export type HotspotId = 'cabeza' | 'corazon' | 'huesos' | 'musculo' | 'sangre' | 'sudor' | 'saliva';
export type Level = 'estable' | 'vigilar' | 'alerta';
export interface HotspotReport { id: HotspotId; label: string; level: Level; score: number; metrics: { k: string; v: string }[]; condition: string; spaceflight: string; actions: string[]; warning?: string; disclaimer?: string; }
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const lvl = (s: number): Level => (s >= 75 ? 'estable' : s >= 50 ? 'vigilar' : 'alerta');

export function healthReports(p: Profile, ship: Ship, log?: DailyLog): HotspotReport[] {
  const sym = log?.symptoms ?? [];
  const sleep = log?.sleepHours ?? p.sleepGoal;
  const hyd = log?.hydration ?? 2;
  const ex = log?.exercise ?? 90;
  const micro = ship.gravity < 0.3;
  const days = 1;
  const head = clamp(100 - Math.max(0, ship.co2 - 3) * 12 - Math.max(0, p.sleepGoal - sleep) * 8 - (sym.includes('cefalea') ? 15 : 0) - (sym.includes('neurologico') ? 60 : 0) - ((log?.stress ?? 2) - 2) * 5);
  const heart = clamp(100 - (sym.includes('dolor_pecho') ? 65 : 0) - Math.max(0, p.hr - 90) * 2 - Math.max(0, p.sbp - 135) * 1.5 - Math.max(0, ship.temp - 27) * 4);
  const bones = clamp(100 - (micro ? 18 : 0) - Math.max(0, 90 - ex) * 0.3 - (ship.radiation > 1 ? 6 : 0));
  const muscle = clamp(100 - (micro ? 14 : 0) - Math.max(0, 90 - ex) * 0.35 - (sym.includes('fatiga') ? 10 : 0));
  const blood = clamp(100 - Math.max(0, 19.5 - ship.o2) * 18 - Math.max(0, 96 - p.spo2) * 8 - Math.max(0, ship.radiation - 1) * 6 - (sym.includes('falta_aire') ? 50 : 0));
  const sweat = clamp(100 - Math.max(0, 2.2 - hyd) * 30 - Math.max(0, ship.temp - 26) * 6 - Math.max(0, ship.humidity - 70));
  const saliva = clamp(100 - Math.max(0, 2.2 - hyd) * 25 - Math.max(0, 30 - ship.humidity) * 2);
  void days;
  const conservative = 'Si empeora, contactar al cirujano de vuelo. No iniciar ni cambiar medicación sin indicación autorizada.';
  return [
    { id: 'cabeza', label: 'Cabeza', score: head, level: lvl(head), metrics: [{ k: 'CO2 cabina', v: ship.co2 + ' mmHg' }, { k: 'Sueño', v: sleep + ' h' }, { k: 'Estrés', v: (log?.stress ?? '-') + ' / 5' }],
      condition: ship.co2 > 4 ? 'CO2 elevado: puede producir cefalea, somnolencia y lentitud cognitiva.' : sleep < p.sleepGoal - 1.5 ? 'Déficit de sueño acumulado afecta atención y estado de ánimo.' : 'Sin señales destacadas en el registro actual.',
      spaceflight: 'En microgravedad los fluidos suben hacia la cabeza (cara hinchada, congestión) y se estudian cambios visuales (SANS). El CO2 se acumula si la ventilación es pobre.',
      actions: ['Ubicarse en zona con buena circulación de aire.', 'Hidratarse y planificar descanso.', 'Registrar cefaleas o cambios de visión en el diario.', conservative],
      warning: sym.includes('neurologico') ? 'URGENTE: déficit neurológico registrado. Escalar de inmediato al cirujano de vuelo.' : ship.co2 >= 6 ? 'CO2 crítico en cabina: informar a control de misión.' : undefined },
    { id: 'corazon', label: 'Corazón', score: heart, level: lvl(heart), metrics: [{ k: 'FC basal', v: p.hr + ' lpm' }, { k: 'Presión', v: p.sbp + '/' + p.dbp + ' mmHg' }, { k: 'Temp. cabina', v: ship.temp + ' °C' }],
      condition: sym.includes('dolor_pecho') ? 'Dolor torácico reportado: requiere evaluación médica inmediata.' : 'Valores basales del perfil dentro de un rango ilustrativo.',
      spaceflight: 'Sin gravedad, el corazón trabaja menos y puede reducir masa; al volver puede aparecer intolerancia ortostática (mareo al ponerse de pie).',
      actions: ['Mantener ejercicio cardiovascular programado.', 'Hidratación regular.', conservative],
      warning: sym.includes('dolor_pecho') ? 'URGENTE: dolor en el pecho. Detener actividad, avisar a un compañero y al cirujano de vuelo.' : undefined },
    { id: 'huesos', label: 'Huesos', score: bones, level: lvl(bones), metrics: [{ k: 'Gravedad', v: ship.gravity + ' g' }, { k: 'Ejercicio', v: ex + ' min' }, { k: 'Radiación', v: ship.radiation + ' mSv/d' }],
      condition: micro ? 'Microgravedad: el hueso pierde densidad sin carga mecánica (deconditioning).' : 'Gravedad parcial o terrestre: menor pérdida ósea esperada.',
      spaceflight: 'En la ISS se ha observado pérdida de densidad ósea de aprox. 1-1.5% por mes en zonas de carga como la cadera.',
      actions: ['Ejercicio resistivo diario (equivalente a ARED en la ISS).', 'Dieta con calcio y vitamina D según plan nutricional.', conservative] },
    { id: 'musculo', label: 'Músculo', score: muscle, level: lvl(muscle), metrics: [{ k: 'Ejercicio', v: ex + ' min' }, { k: 'Gravedad', v: ship.gravity + ' g' }, { k: 'Peso', v: p.weight + ' kg' }],
      condition: ex < 60 ? 'Ejercicio bajo: mayor riesgo de atrofia y pérdida de fuerza.' : 'Rutina de ejercicio adecuada en el registro.',
      spaceflight: 'Los músculos posturales (pantorrillas, espalda) se atrofian rápido en microgravedad sin ejercicio.',
      actions: ['Combinar cinta, bicicleta y resistencia.', 'Estiramientos para la espalda.', conservative] },
    { id: 'sangre', label: 'Sangre', score: blood, level: lvl(blood), metrics: [{ k: 'O2 cabina', v: ship.o2 + ' %' }, { k: 'SpO2 basal', v: p.spo2 + ' %' }, { k: 'Grupo', v: p.bloodGroup }],
      condition: ship.o2 < 19.5 ? 'O2 de cabina bajo: la oxigenación de la sangre puede disminuir (hipoxia).' : 'Oxigenación esperada adecuada según cabina y perfil.',
      spaceflight: 'Al inicio del vuelo se reduce el volumen plasmático; se ha descrito anemia espacial. La radiación también es un riesgo a largo plazo.',
      actions: ['Vigilar mareo, confusión o falta de aire entre compañeros.', 'Reducir esfuerzo si O2 está bajo.', 'Informar a control de misión. No modificar O2 ni presión sin procedimiento autorizado.'],
      warning: sym.includes('falta_aire') ? 'URGENTE: dificultad respiratoria intensa registrada.' : ship.o2 < 17 ? 'O2 crítico en cabina.' : undefined },
    { id: 'sudor', label: 'Sudor', score: sweat, level: lvl(sweat), metrics: [{ k: 'Hidratación', v: hyd + ' L' }, { k: 'Temp. cabina', v: ship.temp + ' °C' }, { k: 'Humedad', v: ship.humidity + ' %' }],
      condition: hyd < 1.5 || ship.temp > 27 ? 'Indicador de observación: posible pérdida de líquidos por calor o esfuerzo.' : 'Sin señales de observación relevantes.',
      spaceflight: 'Sin convección natural, el sudor no gotea: se acumula en la piel y la refrigeración del cuerpo es menos eficiente.',
      actions: ['Secar la piel y ventilar durante el ejercicio.', 'Reponer líquidos.', 'Informar si hay calor excesivo en cabina.'],
      disclaimer: 'El sudor es solo un indicador de observación e hidratación. Esta app no realiza ni interpreta análisis de laboratorio.' },
    { id: 'saliva', label: 'Saliva', score: saliva, level: lvl(saliva), metrics: [{ k: 'Hidratación', v: hyd + ' L' }, { k: 'Humedad', v: ship.humidity + ' %' }, { k: 'Comidas', v: log?.meals ? 'registradas' : 'sin registro' }],
      condition: hyd < 1.5 || ship.humidity < 25 ? 'Indicador de observación: boca seca posible por baja hidratación o aire seco.' : 'Sin señales de observación relevantes.',
      spaceflight: 'NASA ha recogido muestras de saliva en investigación sobre sistema inmune y estrés; aquí solo se usa como observación de sequedad bucal.',
      actions: ['Beber agua a sorbos durante el día.', 'Higiene bucal habitual.', 'Comunicar sequedad persistente al cirujano de vuelo.'],
      disclaimer: 'No se diagnostica nada a partir de la saliva. Es un indicador de observación/hidratación, no un resultado de laboratorio.' },
  ];
}
export const LEVEL_COLOR: Record<Level, string> = { estable: 'hsl(172 58% 52%)', vigilar: 'hsl(46 92% 62%)', alerta: 'hsl(352 82% 60%)' };
export const SYMPTOMS: { id: import('./types').Symptom; label: string; urgent?: boolean }[] = [
  { id: 'dolor_pecho', label: 'Dolor en el pecho', urgent: true }, { id: 'falta_aire', label: 'Dificultad respiratoria intensa', urgent: true },
  { id: 'neurologico', label: 'Debilidad, habla o visión alterada', urgent: true }, { id: 'cefalea', label: 'Dolor de cabeza' },
  { id: 'nauseas', label: 'Náuseas / mareo' }, { id: 'fatiga', label: 'Fatiga marcada' }, { id: 'congestion', label: 'Congestión facial' },
];
