/** Educational references, not operational flight or medical limits. */
export const NASA_REFERENCES = [
  {
    title: 'Apollo 11 · misión histórica',
    url: 'https://www.nasa.gov/history/apollo-11-mission-overview/',
    summary: 'El vuelo tripulado del 16 al 24 de julio de 1969 duró 8 días, 3 horas, 18 minutos y 35 segundos. La inserción en órbita lunar ocurrió aproximadamente a las 76 horas del despegue.',
  },
  {
    title: 'El cuerpo humano en el espacio',
    url: 'https://www.nasa.gov/humans-in-space/the-human-body-in-space/',
    summary: 'NASA describe cambios musculares, óseos, cardiovasculares y de distribución de fluidos en microgravedad. También estudia sueño, aislamiento, ejercicio y jardines espaciales. No son diagnósticos individuales.',
  },
  {
    title: 'Los cinco riesgos del vuelo espacial',
    url: 'https://www.nasa.gov/hrp/hazards/',
    summary: 'Radiación, aislamiento y confinamiento, distancia de la Tierra, cambios de gravedad y ambientes cerrados u hostiles. Los viajes tripulados a Marte se estudian como misiones futuras, no como vuelos ya realizados.',
  },
] as const;

export const MISSION_FACTS = {
  iss: {
    name: 'Órbita terrestre · ISS',
    kind: 'Experiencia tripulada real',
    distance: 'Órbita baja; cientos de kilómetros de altitud',
    gravity: 'Microgravedad durante la caída libre orbital',
    duration: 'Referencia: estancias de unos 6 meses; duración variable',
    note: 'La gravedad no desaparece en órbita: la nave y su tripulación están en caída libre. Se controlan el ejercicio, el sueño, la calidad del aire y la exposición a radiación. No se recibe telemetría de la ISS en esta aplicación.',
  },
  moon: {
    name: 'Luna · referencia Apollo 11',
    kind: 'Misión histórica · 1969',
    distance: 'Trayecto de Apollo 11: unas 76 h hasta órbita lunar',
    gravity: 'Microgravedad en tránsito; gravedad parcial en superficie',
    duration: 'Apollo 11: 8 d, 3 h, 18 min, 35 s',
    note: 'Neil Armstrong, Buzz Aldrin y Michael Collins viajaron del 16 al 24 de julio de 1969. Armstrong y Aldrin descendieron a la superficie; Collins permaneció en órbita. Una misión simulada distinta no reproduce automáticamente su trayectoria ni sus condiciones.',
  },
  mars: {
    name: 'Marte · escenario futuro',
    kind: 'Hipotético · sin vuelos humanos realizados',
    distance: 'Distancia variable; NASA cita un promedio de 140 millones de millas',
    gravity: 'Aproximadamente 3/8 de la terrestre en superficie',
    duration: 'Planificación de referencia: del orden de 3 años, ida y vuelta',
    note: 'Ninguna persona ha viajado a Marte. NASA estudia traslados de unos 6 meses y comunicaciones que pueden demorarse unos 20 minutos en un sentido. Son referencias educativas dependientes de la trayectoria, no una predicción de vuelo ni parámetros certificados.',
  },
} as const;
