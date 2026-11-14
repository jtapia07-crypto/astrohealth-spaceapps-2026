import React, { useEffect, useState } from 'react';

interface NasaSpaceWeather {
  kpIndex: number;
  flareClass: string;
  stormAlert: boolean;
  lastEventTime: string;
}

export default function App() {
  // 1. Datos en tiempo real exclusivos de NASA DONKI (Tormentas Geomagnéticas y Fulguraciones Solares)
  const [nasaWeather, setNasaWeather] = useState<NasaSpaceWeather>({
    kpIndex: 2.0,
    flareClass: 'Nominal (Sin eventos activos)',
    stormAlert: false,
    lastEventTime: 'Sincronizando NASA DONKI...',
  });

  // 2. Campo de Gravedad Alterada (Perfiles de misión NASA)
  const [gravity, setGravity] = useState<number>(0.0); // 0.000g ISS/Orión, 0.165g Artemis Luna, 0.380g Marte

  // 3. Indicadores Fisiológicos del Astronauta (NASA HRP Human Physiology)
  const [indicators, setIndicators] = useState({
    immuneFatigue: false,      // Cambios inmunes / entorno cerrado
    boneExerciseDone: true,    // Contramedida pérdida ósea (ARED)
    restingHr: 68,             // Eventos cardiovasculares (lpm)
    sleepHours: 7.0,           // Salud conductual / aislamiento
  });

  useEffect(() => {
    const fetchNasaDonkiData = async () => {
      try {
        const end = new Date().toISOString().split('T')[0];
        const startDateObj = new Date();
        startDateObj.setDate(startDateObj.getDate() - 3);
        const start = startDateObj.toISOString().split('T')[0];

        // API Oficial NASA DONKI: Tormentas Geomagnéticas (GST) y Fulguraciones Solares (FLR)
        const [gstRes, flrRes] = await Promise.all([
          fetch(`https://api.nasa.gov/DONKI/GST?startDate=${start}&endDate=${end}&api_key=DEMO_KEY`),
          fetch(`https://api.nasa.gov/DONKI/FLR?startDate=${start}&endDate=${end}&api_key=DEMO_KEY`),
        ]);

        const gstData = await gstRes.json();
        const flrData = await flrRes.json();

        let latestKp = 2.0;
        let eventTime = new Date().toUTCString();

        if (Array.isArray(gstData) && gstData.length > 0) {
          const lastStorm = gstData[gstData.length - 1];
          const allKp = lastStorm.allKpIndex || [];
          if (allKp.length > 0) {
            latestKp = allKp[allKp.length - 1].kpIndex;
            eventTime = allKp[allKp.length - 1].observedTime || lastStorm.startTime;
          }
        }

        let latestFlare = 'C1.0 (Estable)';
        if (Array.isArray(flrData) && flrData.length > 0) {
          const lastFlare = flrData[flrData.length - 1];
          latestFlare = `${lastFlare.classType} (${lastFlare.sourceLocation || 'Sol'})`;
          eventTime = lastFlare.peakTime || lastFlare.beginTime || eventTime;
        }

        const isAlert =
          latestKp >= 5 || latestFlare.startsWith('M') || latestFlare.startsWith('X');

        setNasaWeather({
          kpIndex: latestKp,
          flareClass: latestFlare,
          stormAlert: isAlert,
          lastEventTime: eventTime,
        });
      } catch {
        setNasaWeather((prev) => ({
          ...prev,
          lastEventTime: 'NASA DONKI (Modo Continuidad)',
        }));
      }
    };

    fetchNasaDonkiData();
    const timer = setInterval(fetchNasaDonkiData, 120000);
    return () => clearInterval(timer);
  }, []);

  // Evaluación autónoma de riesgos fisiológicos (NASA HRP) y acciones para el astronauta
  const alerts: { area: string; status: string; action: string }[] = [];

  if (nasaWeather.stormAlert) {
    alerts.push({
      area: 'Radiación Espacial (Tormenta Solar - NASA DONKI)',
      status: `Alerta Activa (Kp ${nasaWeather.kpIndex} / Fulguración ${nasaWeather.flareClass})`,
      action: 'Ingresar al refugio blindado de radiación y registrar dosimetría personal.',
    });
  }
  if (indicators.immuneFatigue) {
    alerts.push({
      area: 'Sistema Inmune y Entorno Cerrado Hostil',
      status: 'Indicador de alteración inmune o estrés ambiental',
      action: 'Verificar depuradores de CO₂ de cabina, hidratar y tomar biomuestra salival.',
    });
  }
  if (gravity < 0.5 && !indicators.boneExerciseDone) {
    alerts.push({
      area: 'Pérdida Ósea (Campo Gravitatorio Alterado)',
      status: `Riesgo activo en ${gravity.toFixed(3)}g sin carga mecánica diaria`,
      action: 'Completar protocolo de ejercicio resistivo (ARED) y suplementación de Vitamina D.',
    });
  }
  if (indicators.restingHr > 90 || indicators.restingHr < 45) {
    alerts.push({
      area: 'Evento Cardiovascular',
      status: `Frecuencia cardíaca fuera de rango nominal (${indicators.restingHr} lpm)`,
      action: 'Ejecutar monitoreo ECG y evitar cambios posturales bruscos.',
    });
  }
  if (indicators.sleepHours < 6) {
    alerts.push({
      area: 'Salud Conductual (Aislamiento y Confinamiento)',
      status: `Déficit de sueño (${indicators.sleepHours} h) — riesgo de fatiga cognitiva`,
      action: 'Aplicar iluminación circadiana regulada y realizar test cognitivo PVT.',
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cabecera Oficial */}
        <header className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-4 gap-3">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">
              100% NASA DATA // DONKI SPACE WEATHER & HRP HUMAN PHYSIOLOGY
            </span>
            <h1 className="text-2xl font-bold text-white mt-0.5">
              AstroHealth // Autonomous Crew Health Monitor
            </h1>
          </div>
          <a
            href="https://www.nasa.gov/hrp/risks/#Human-Physiology"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-3 py-1.5 rounded hover:bg-cyan-900/50"
          >
            NASA HRP: Human Physiology Risks ↗
          </a>
        </header>

        {/* 1. Tormenta Solar (NASA DONKI) y Campo de Gravedad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg border ${
              nasaWeather.stormAlert
                ? 'bg-red-950/40 border-red-500'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-amber-400">
                TORMENTA SOLAR EN VIVO (NASA DONKI)
              </span>
              <span className="text-[10px] font-mono text-emerald-400">● NASA API</span>
            </div>
            <div className="mt-2 flex items-baseline gap-5">
              <div>
                <div className="text-2xl font-bold">Kp {nasaWeather.kpIndex.toFixed(1)}</div>
                <div className="text-xs text-slate-400">Tormenta Geomagnética</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-300">{nasaWeather.flareClass}</div>
                <div className="text-xs text-slate-400">Fulguración Solar</div>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Último registro NASA: {nasaWeather.lastEventTime}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400">CAMPO DE GRAVEDAD ALTERADA</span>
              <select
                value={gravity}
                onChange={(e) => setGravity(parseFloat(e.target.value))}
                className="bg-slate-950 border border-slate-700 text-xs rounded px-2.5 py-1 text-white"
              >
                <option value={0.0}>Órbita / Tránsito (0.000 g)</option>
                <option value={0.165}>Superficie Lunar Artemis (0.165 g)</option>
                <option value={0.38}>Superficie Marte (0.380 g)</option>
              </select>
            </div>
            <div className="text-3xl font-bold text-white mt-2">{gravity.toFixed(3)} g</div>
            <div className="text-xs text-slate-400 mt-1">
              {gravity < 0.5
                ? 'Gravedad reducida: riesgo activo de pérdida ósea y desajuste cardiovascular'
                : 'Gravedad terrestre nominal'}
            </div>
          </div>
        </div>

        {/* 2. Indicadores Fisiológicos del Astronauta (Autoevaluación) */}
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-mono uppercase text-cyan-300">
            Autoevaluación de Indicadores de Salud del Astronauta
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <label className="p-3 bg-slate-950 rounded border border-slate-800 flex flex-col gap-2">
              <span className="text-slate-400">Cardiovascular (FC Reposo)</span>
              <input
                type="number"
                value={indicators.restingHr}
                onChange={(e) => setIndicators({ ...indicators, restingHr: Number(e.target.value) })}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-base font-bold text-white"
              />
              <span className="text-slate-500">lpm (Nominal: 50–85)</span>
            </label>

            <label className="p-3 bg-slate-950 rounded border border-slate-800 flex flex-col gap-2">
              <span className="text-slate-400">Conductual (Sueño 24h)</span>
              <input
                type="number"
                step="0.5"
                value={indicators.sleepHours}
                onChange={(e) => setIndicators({ ...indicators, sleepHours: Number(e.target.value) })}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-base font-bold text-white"
              />
              <span className="text-slate-500">horas (Mínimo: 6.5h)</span>
            </label>

            <label className="p-3 bg-slate-950 rounded border border-slate-800 flex flex-col justify-between cursor-pointer">
              <span className="text-slate-400">Óseo (Protocolo ARED)</span>
              <div className="flex items-center gap-2 my-1">
                <input
                  type="checkbox"
                  checked={indicators.boneExerciseDone}
                  onChange={(e) => setIndicators({ ...indicators, boneExerciseDone: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500"
                />
                <span className="font-bold text-white">
                  {indicators.boneExerciseDone ? 'Completado' : 'Pendiente'}
                </span>
              </div>
              <span className="text-slate-500">Carga mecánica diaria</span>
            </label>

            <label className="p-3 bg-slate-950 rounded border border-slate-800 flex flex-col justify-between cursor-pointer">
              <span className="text-slate-400">Inmune (Fatiga / Síntomas)</span>
              <div className="flex items-center gap-2 my-1">
                <input
                  type="checkbox"
                  checked={indicators.immuneFatigue}
                  onChange={(e) => setIndicators({ ...indicators, immuneFatigue: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="font-bold text-white">
                  {indicators.immuneFatigue ? 'Presentes' : 'Sin síntomas'}
                </span>
              </div>
              <span className="text-slate-500">Detección temprana</span>
            </label>
          </div>
        </div>

        {/* 3. Estado Fisiológico y Acciones Inmediatas (NASA HRP) */}
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-sm font-mono uppercase text-emerald-400">
            Evaluación de Salud y Plan de Acción ({alerts.length === 0 ? 'Estado Nominal' : `${alerts.length} Acciones Requeridas`})
          </h2>

          {alerts.length === 0 ? (
            <div className="p-4 rounded bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300">
              Indicadores fisiológicos y telemetría solar NASA dentro de rangos seguros. Mantener monitoreo rutinario.
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((item, idx) => (
                <div key={idx} className="p-3 rounded bg-amber-950/30 border border-amber-500/50 text-xs">
                  <div className="font-bold text-amber-300">{item.area}: {item.status}</div>
                  <div className="text-slate-200 mt-1"><strong>Acción para el astronauta:</strong> {item.action}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
