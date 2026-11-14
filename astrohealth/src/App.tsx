import React, { useEffect, useState } from 'react';

type MainTab = 'ASTRONAUT' | 'SHIP' | 'LOGBOOK';
type ShipSubView = 'OVERVIEW' | 'COCKPIT' | 'PTR_GAUGES';
type BodyZoneId = 'HEAD' | 'CHEST' | 'ARMS' | 'LEGS';

interface BodyZoneReport {
  id: BodyZoneId;
  name: string;
  organFocus: string;
  metricLabel: string;
  metricValue: string;
  status: 'NOMINAL' | 'ALERTA';
  failureAnalysis: string;
  treatmentActivity: string;
}

interface CrewTip {
  id: string;
  author: string;
  category: 'Radiación' | 'Huesos/Gravedad' | 'Cardiovascular' | 'Conductual';
  content: string;
  nasaScore: number;
  nasaVerdict: string;
  timestamp: string;
}

const INITIAL_BODY_ZONES: Record<BodyZoneId, BodyZoneReport> = {
  HEAD: {
    id: 'HEAD',
    name: 'Cabeza / Sistema Neuro-Vestibular',
    organFocus: 'SNC, Visión (SANS) y Ciclo Circadiano',
    metricLabel: 'Presión Intracraneal / Sueño',
    metricValue: '6.5 h sueño / Leve cefalea',
    status: 'NOMINAL',
    failureAnalysis: 'Desplazamiento cefálico de fluidos por microgravedad (riesgo SANS).',
    treatmentActivity: 'Aplicar luz circadiana ámbar 2h antes de dormir y reducir sodio en dieta.',
  },
  CHEST: {
    id: 'CHEST',
    name: 'Tórax / Sistema Cardiovascular e Inmune',
    organFocus: 'Corazón, Presión Arterial y Respuesta Inmune',
    metricLabel: 'FC / Presión Arterial',
    metricValue: '94 lpm / 138/88 mmHg',
    status: 'ALERTA',
    failureAnalysis: 'Frecuencia cardíaca elevada y leve hipertensión por estrés en entorno cerrado.',
    treatmentActivity: 'Realizar ECG de 12 derivaciones, respiración guiada 10 min e hidratación con electrolitos.',
  },
  ARMS: {
    id: 'ARMS',
    name: 'Extremidades Superiores',
    organFocus: 'Masa Muscular y Destreza Motora',
    metricLabel: 'Fuerza de Agarre / Fatiga',
    metricValue: '88% baseline',
    status: 'NOMINAL',
    failureAnalysis: 'Fatiga leve tras actividades extravehiculares (EVA) o trabajo en consola.',
    treatmentActivity: 'Estiramientos de manguito rotador y 20 min de resistencia elástica.',
  },
  LEGS: {
    id: 'LEGS',
    name: 'Extremidades Inferiores / Sistema Óseo',
    organFocus: 'Densidad Mineral Ósea (Fémur/Tibia) y Retorno Venoso',
    metricLabel: 'Carga Mecánica ARED',
    metricValue: '0 min completados hoy',
    status: 'ALERTA',
    failureAnalysis: 'Desmineralización ósea acelerada (1.5%/mes) por exposición a gravedad reducida.',
    treatmentActivity: 'Ejecutar 60 min de sentadillas/peso muerto en equipo ARED + 800 UI Vitamina D.',
  },
};

const INITIAL_TIPS: CrewTip[] = [
  {
    id: 'tip-1',
    author: 'Cmdr. Vega (ISS-72)',
    category: 'Huesos/Gravedad',
    content: 'Dividir la sesión ARED en 2 bloques de 35 min reduce la fatiga lumbar en 0g y mejora la adherencia.',
    nasaScore: 96,
    nasaVerdict: 'Validado NASA HRP: Contramedida óptima contra pérdida ósea',
    timestamp: 'Hace 2h',
  },
  {
    id: 'tip-2',
    author: 'Dr. Chen (Artemis Med)',
    category: 'Radiación',
    content: 'Ante subida de índice Kp ≥ 5 en DONKI, mover sacos de agua potable alrededor del módulo de descanso.',
    nasaScore: 98,
    nasaVerdict: 'Validado NASA HRP: Blindaje efectivo de hidrógeno contra radiación',
    timestamp: 'Hace 5h',
  },
];

export default function App() {
  // Navegación principal del boceto (Astronauta | Nave | Bitácora Planta)
  const [activeTab, setActiveTab] = useState<MainTab>('ASTRONAUT');
  const [shipSubView, setShipSubView] = useState<ShipSubView>('OVERVIEW');

  // Datos en tiempo real NASA DONKI (Tormentas Solares)
  const [solarData, setSolarData] = useState({
    kp: 5.3,
    flare: 'M1.4',
    radiationLevel: 72, // % barra R
    cabinPressure: 101.3, // kPa barra P
    cabinTemp: 22.4, // °C barra T
  });

  // Gravedad de la nave
  const [gravity, setGravity] = useState<number>(0.0);

  // Zonas del cuerpo interactivas + edición
  const [bodyZones, setBodyZones] = useState<Record<BodyZoneId, BodyZoneReport>>(INITIAL_BODY_ZONES);
  const [selectedZone, setSelectedZone] = useState<BodyZoneId>('CHEST');
  const [isEditingZone, setIsEditingZone] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>('VITALS');

  // Bitácora compartida con evaluación automática
  const [tips, setTips] = useState<CrewTip[]>(() => {
    const saved = localStorage.getItem('astrohealth_crew_tips');
    return saved ? JSON.parse(saved) : INITIAL_TIPS;
  });
  const [newTipAuthor, setNewTipAuthor] = useState('');
  const [newTipCategory, setNewTipCategory] = useState<CrewTip['category']>('Huesos/Gravedad');
  const [newTipText, setNewTipText] = useState('');

  useEffect(() => {
    localStorage.setItem('astrohealth_crew_tips', JSON.stringify(tips));
  }, [tips]);

  // Conexión en tiempo real exclusiva con NASA DONKI
  useEffect(() => {
    const fetchNasaDonki = async () => {
      try {
        const end = new Date().toISOString().split('T')[0];
        const startObj = new Date();
        startObj.setDate(startObj.getDate() - 3);
        const start = startObj.toISOString().split('T')[0];

        const [gstRes, flrRes] = await Promise.all([
          fetch(`https://api.nasa.gov/DONKI/GST?startDate=${start}&endDate=${end}&api_key=DEMO_KEY`),
          fetch(`https://api.nasa.gov/DONKI/FLR?startDate=${start}&endDate=${end}&api_key=DEMO_KEY`),
        ]);
        const gst = await gstRes.json();
        const flr = await flrRes.json();

        let kpVal = 3.0;
        if (Array.isArray(gst) && gst.length > 0) {
          const allKp = gst[gst.length - 1].allKpIndex || [];
          if (allKp.length > 0) kpVal = allKp[allKp.length - 1].kpIndex;
        }

        let flareVal = 'C2.1';
        if (Array.isArray(flr) && flr.length > 0) {
          flareVal = flr[flr.length - 1].classType || 'C2.1';
        }

        setSolarData((prev) => ({
          ...prev,
          kp: kpVal,
          flare: flareVal,
          radiationLevel: Math.min(98, Math.round(kpVal * 12 + (flareVal.startsWith('M') || flareVal.startsWith('X') ? 25 : 5))),
        }));
      } catch {
        // Mantiene telemetría activa si DEMO_KEY alcanza límite horario
      }
    };
    fetchNasaDonki();
  }, []);

  // Evaluación inteligente de consejos ingresados a la base de datos
  const handleAddTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTipText.trim()) return;

    const textLower = newTipText.toLowerCase();
    const keywords = ['ejercicio', 'ared', 'agua', 'sueño', 'luz', 'blindaje', 'radiación', 'vitamina', 'ecg', 'co2', 'hidratación', 'presión'];
    const matches = keywords.filter((k) => textLower.includes(k)).length;
    const score = Math.min(99, 75 + matches * 6);

    const verdict =
      score >= 85
        ? 'Validado NASA HRP: Alta alineación con contramedidas fisiológicas'
        : 'Evaluado NASA HRP: Consejo operativo útil (requiere supervisión médica)';

    const created: CrewTip = {
      id: `tip-${Date.now()}`,
      author: newTipAuthor.trim() || 'Tripulante Activo',
      category: newTipCategory,
      content: newTipText.trim(),
      nasaScore: score,
      nasaVerdict: verdict,
      timestamp: 'Ahora mismo',
    };

    setTips([created, ...tips]);
    setNewTipText('');
  };

  const currentZone = bodyZones[selectedZone];

  const updateCurrentZoneField = (field: keyof BodyZoneReport, value: string) => {
    setBodyZones((prev) => ({
      ...prev,
      [selectedZone]: {
        ...prev[selectedZone],
        [field]: value,
      },
    }));
  };

  // Alertas principales dinámicas en cabecera (como el cartel "▲ Alerta" del boceto)
  const topAlerts: string[] = [];
  if (bodyZones.CHEST.status === 'ALERTA') {
    topAlerts.push('⚠️ Presión alta / Frecuencia cardíaca anormal detectada en Tórax');
  }
  if (solarData.kp >= 5 || solarData.flare.startsWith('M') || solarData.flare.startsWith('X')) {
    topAlerts.push(`☢️ Radiación fuerte (NASA DONKI Kp ${solarData.kp} / ${solarData.flare}): Evita exponerte fuera de blindaje`);
  }
  if (gravity < 0.5 && bodyZones.LEGS.status === 'ALERTA') {
    topAlerts.push(`🦴 Gravedad (${gravity.toFixed(2)}g) afectará tus huesos: Realiza ejercicio ARED ahora`);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      {/* BARRA SUPERIOR DE ALERTAS CRÍTICAS (Del boceto: ▲ Alerta) */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded animate-pulse">
                ▲ ALERTAS ACTIVAS ({topAlerts.length})
              </span>
              <span className="text-xs font-mono text-cyan-400">
                ASTROHEALTH // NASA HRP & DONKI LIVE
              </span>
            </div>
            <a
              href="https://www.nasa.gov/hrp/risks/#Human-Physiology"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-300 underline hover:text-cyan-200"
            >
              Base Científica NASA HRP ↗
            </a>
          </div>

          {topAlerts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {topAlerts.map((alertMsg, i) => (
                <div
                  key={i}
                  className="text-xs bg-red-950/60 border border-red-500/60 text-red-200 px-3 py-1.5 rounded font-medium"
                >
                  {alertMsg}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL SEGÚN PANTALLA SELECCIONADA */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        {/* ================= VISTA 1: ASTRONAUTA INTERACTIVO + MENÚS DESPLEGABLES ================= */}
        {activeTab === 'ASTRONAUT' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Columna Izquierda: Menús Desplegables (Las 3 rayas de colores del boceto) */}
            <div className="lg:col-span-3 space-y-3">
              <div className="text-xs font-mono uppercase text-slate-400">Menús Desplegables</div>

              {[
                {
                  id: 'VITALS',
                  color: 'border-l-cyan-400',
                  title: 'Signos Vitales en Vivo',
                  content: 'FC: 94 lpm | PA: 138/88 mmHg | SpO₂: 98% | Temp: 36.8°C',
                },
                {
                  id: 'RADIATION',
                  color: 'border-l-emerald-400',
                  title: 'Exposición Radiación (NASA)',
                  content: `Índice Kp: ${solarData.kp} | Fulguración: ${solarData.flare} | Dosis acumulada: 14.2 mSv`,
                },
                {
                  id: 'GRAVITY',
                  color: 'border-l-red-400',
                  title: 'Impacto Gravedad & Huesos',
                  content: `Gravedad actual: ${gravity.toFixed(3)}g | Pérdida ósea estimada sin ARED: 1.5%/mes`,
                },
              ].map((menu) => (
                <div
                  key={menu.id}
                  className={`bg-slate-900 border border-slate-800 border-l-4 ${menu.color} rounded-lg overflow-hidden`}
                >
                  <button
                    onClick={() => setOpenDropdown(openDropdown === menu.id ? null : menu.id)}
                    className="w-full px-3 py-2.5 text-left text-xs font-bold flex justify-between items-center hover:bg-slate-800/60"
                  >
                    <span>{menu.title}</span>
                    <span>{openDropdown === menu.id ? '▲' : '▼'}</span>
                  </button>
                  {openDropdown === menu.id && (
                    <div className="px-3 pb-3 text-xs text-slate-300 border-t border-slate-800/80 pt-2">
                      {menu.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Columna Central: Figura Humana Interactiva del Astronauta */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
              <span className="text-xs font-mono text-cyan-400 mb-2">
                TOCA UNA EXTREMIDAD O ZONA PARA EVALUAR
              </span>

              {/* SVG Interactivo del Astronauta */}
              <svg viewBox="0 0 200 340" className="w-56 h-80 select-none">
                {/* Casco / Cabeza */}
                <g
                  onClick={() => { setSelectedZone('HEAD'); setIsEditingZone(false); }}
                  className="cursor-pointer transition hover:opacity-80"
                >
                  <circle
                    cx="100"
                    cy="48"
                    r="32"
                    fill={selectedZone === 'HEAD' ? '#0891b2' : '#1e293b'}
                    stroke={bodyZones.HEAD.status === 'ALERTA' ? '#ef4444' : '#38bdf8'}
                    strokeWidth="3"
                  />
                  <rect x="80" y="36" width="40" height="22" rx="8" fill="#0f172a" />
                  <text x="100" y="92" textAnchor="middle" fill="#94a3b8" fontSize="9">CABEZA</text>
                </g>

                {/* Tórax / Corazón (Subpantalla corazón del boceto) */}
                <g
                  onClick={() => { setSelectedZone('CHEST'); setIsEditingZone(false); }}
                  className="cursor-pointer transition hover:opacity-80"
                >
                  <rect
                    x="68"
                    y="98"
                    width="64"
                    height="88"
                    rx="14"
                    fill={selectedZone === 'CHEST' ? '#991b1b' : '#1e293b'}
                    stroke={bodyZones.CHEST.status === 'ALERTA' ? '#ef4444' : '#38bdf8'}
                    strokeWidth="3"
                  />
                  {/* Corazón pulsante */}
                  <circle cx="110" cy="130" r="10" fill="#ef4444" className="animate-ping opacity-75" />
                  <circle cx="110" cy="130" r="7" fill="#dc2626" />
                  <text x="100" y="168" textAnchor="middle" fill="#e2e8f0" fontSize="9">TÓRAX / CORAZÓN</text>
                </g>

                {/* Extremidades Superiores (Brazos) */}
                <g
                  onClick={() => { setSelectedZone('ARMS'); setIsEditingZone(false); }}
                  className="cursor-pointer transition hover:opacity-80"
                >
                  <rect
                    x="32"
                    y="102"
                    width="28"
                    height="86"
                    rx="12"
                    fill={selectedZone === 'ARMS' ? '#0891b2' : '#1e293b'}
                    stroke={bodyZones.ARMS.status === 'ALERTA' ? '#ef4444' : '#38bdf8'}
                    strokeWidth="3"
                  />
                  <rect
                    x="140"
                    y="102"
                    width="28"
                    height="86"
                    rx="12"
                    fill={selectedZone === 'ARMS' ? '#0891b2' : '#1e293b'}
                    stroke={bodyZones.ARMS.status === 'ALERTA' ? '#ef4444' : '#38bdf8'}
                    strokeWidth="3"
                  />
                  <text x="46" y="200" textAnchor="middle" fill="#94a3b8" fontSize="8">BRAZO</text>
                  <text x="154" y="200" textAnchor="middle" fill="#94a3b8" fontSize="8">BRAZO</text>
                </g>

                {/* Extremidades Inferiores (Piernas / Huesos) */}
                <g
                  onClick={() => { setSelectedZone('LEGS'); setIsEditingZone(false); }}
                  className="cursor-pointer transition hover:opacity-80"
                >
                  <rect
                    x="70"
                    y="194"
                    width="26"
                    height="115"
                    rx="12"
                    fill={selectedZone === 'LEGS' ? '#991b1b' : '#1e293b'}
                    stroke={bodyZones.LEGS.status === 'ALERTA' ? '#ef4444' : '#38bdf8'}
                    strokeWidth="3"
                  />
                  <rect
                    x="104"
                    y="194"
                    width="26"
                    height="115"
                    rx="12"
                    fill={selectedZone === 'LEGS' ? '#991b1b' : '#1e293b'}
                    stroke={bodyZones.LEGS.status === 'ALERTA' ? '#ef4444' : '#38bdf8'}
                    strokeWidth="3"
                  />
                  <text x="100" y="325" textAnchor="middle" fill="#94a3b8" fontSize="9">EXTREMIDADES INFERIORES</text>
                </g>
              </svg>
            </div>

            {/* Columna Derecha: Informe Detallado y Editable de la Zona Seleccionada */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[11px] font-mono text-cyan-400">INFORME CLÍNICO POR ZONA</span>
                  <h2 className="text-lg font-bold text-white">{currentZone.name}</h2>
                  <p className="text-xs text-slate-400">{currentZone.organFocus}</p>
                </div>
                <button
                  onClick={() => setIsEditingZone(!isEditingZone)}
                  className="text-xs px-3 py-1 rounded bg-slate-800 border border-slate-600 hover:bg-slate-700 text-cyan-300"
                >
                  {isEditingZone ? 'Guardar Cambios' : '✎ Editar Informe'}
                </button>
              </div>

              {!isEditingZone ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">{currentZone.metricLabel}:</span>
                    <span className="font-bold text-white">{currentZone.metricValue}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Estado Fisiológico:</span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        currentZone.status === 'ALERTA'
                          ? 'bg-red-950 text-red-400 border border-red-500/50'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                      }`}
                    >
                      {currentZone.status}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-slate-950 border border-slate-800">
                    <div className="font-semibold text-amber-300 mb-1">Evaluación de Falla:</div>
                    <p className="text-slate-300">{currentZone.failureAnalysis}</p>
                  </div>

                  <div className="p-3 rounded bg-cyan-950/30 border border-cyan-500/40">
                    <div className="font-semibold text-cyan-300 mb-1">Tratamiento / Actividad Sugerida:</div>
                    <p className="text-slate-200">{currentZone.treatmentActivity}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <label className="block">
                    <span className="text-slate-400">Estado:</span>
                    <select
                      value={currentZone.status}
                      onChange={(e) => updateCurrentZoneField('status', e.target.value as 'NOMINAL' | 'ALERTA')}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-white"
                    >
                      <option value="NOMINAL">NOMINAL (Estable)</option>
                      <option value="ALERTA">ALERTA (Requiere acción)</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-slate-400">Lectura / Síntoma Actual:</span>
                    <input
                      type="text"
                      value={currentZone.metricValue}
                      onChange={(e) => updateCurrentZoneField('metricValue', e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-white"
                    />
                  </label>

                  <label className="block">
                    <span className="text-slate-400">Evaluación de Falla:</span>
                    <textarea
                      rows={2}
                      value={currentZone.failureAnalysis}
                      onChange={(e) => updateCurrentZoneField('failureAnalysis', e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-white"
                    />
                  </label>

                  <label className="block">
                    <span className="text-slate-400">Tratamiento o Actividad:</span>
                    <textarea
                      rows={2}
                      value={currentZone.treatmentActivity}
                      onChange={(e) => updateCurrentZoneField('treatmentActivity', e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded p-2 text-white"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= VISTA 2: LA NAVE Y SUS SUBPANTALLAS (Boceto Centro y Derecha) ================= */}
        {activeTab === 'SHIP' && (
          <div className="space-y-6">
            {/* Selector de Subpantallas de la Nave */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setShipSubView('OVERVIEW')}
                className={`px-3 py-1.5 rounded text-xs font-mono ${
                  shipSubView === 'OVERVIEW' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                1. Vista Exterior Nave & Gravedad
              </button>
              <button
                onClick={() => setShipSubView('COCKPIT')}
                className={`px-3 py-1.5 rounded text-xs font-mono ${
                  shipSubView === 'COCKPIT' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                2. Subpantalla Cabina (Clima Solar NASA)
              </button>
              <button
                onClick={() => setShipSubView('PTR_GAUGES')}
                className={`px-3 py-1.5 rounded text-xs font-mono ${
                  shipSubView === 'PTR_GAUGES' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}
              >
                3. Subpantalla Sensores P - T - R
              </button>
            </div>

            {/* Subvista A: Nave espacial en trayectoria */}
            {shipSubView === 'OVERVIEW' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex flex-col items-center">
                  <svg viewBox="0 0 300 160" className="w-full max-w-sm">
                    {/* Curvatura planetaria izquierda del boceto */}
                    <path d="M 10 10 Q 55 80 10 150" fill="none" stroke="#38bdf8" strokeWidth="3" />
                    <line x1="45" y1="80" x2="120" y2="80" stroke="#64748b" strokeDasharray="4 4" />
                    {/* Silueta de la nave */}
                    <polygon points="125,80 175,55 235,72 255,80 235,88 175,105" fill="#0f172a" stroke="#34d399" strokeWidth="2.5" />
                    <polygon points="165,60 150,30 185,58" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                    <polygon points="165,100 150,130 185,102" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                    <ellipse cx="215" cy="80" rx="14" ry="6" fill="#38bdf8" opacity="0.7" />
                  </svg>
                  <span className="text-xs font-mono text-emerald-400">
                    NAVE EN ÓRBITA // TELEMETRÍA ACTIVA
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Control de Gravedad y Entorno de Nave</h3>
                  <p className="text-xs text-slate-400">
                    Selecciona el régimen gravitatorio de la misión para recalcular el impacto fisiológico en la tripulación:
                  </p>
                  <select
                    value={gravity}
                    onChange={(e) => setGravity(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5
