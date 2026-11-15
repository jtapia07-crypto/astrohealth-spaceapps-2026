export interface NasaSource {
  id: string;
  title: string;
  agency: string;
  summary: string;
  url: string;
}

export const NASA_SOURCES: NasaSource[] = [
  {
    id: 'std-3001',
    title: 'NASA-STD-3001 Vol. 2 · Crew Health & Cabin Limits (Fig. 6.2-2)',
    agency: 'NASA Technical Standards',
    summary:
      'Defines nominal cabin ppCO2 (< 3.0 mmHg; caution > 4.0 mmHg), oxygen (19.5–23.5%), pressure (~101.3 kPa), ALARA radiation limits, and Figure 6.2-2 psychrometric thermal envelope (18–27 °C dry bulb, 25–75% RH).',
    url: 'https://standards.nasa.gov/human-factors-and-health',
  },
  {
    id: 'donki',
    title: 'NASA DONKI · Real-Time Space Weather Telemetry (GST & FLR)',
    agency: 'NASA CCMC / Goddard',
    summary:
      'Live heliophysics feed ingesting planetary geomagnetic storm indices (Kp 0–9) and solar flare classifications (C, M, X) to dynamically recalculate radiation dose rate (mSv/day) and EVA alerts.',
    url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
  },
  {
    id: 'hrp-evidence',
    title: 'NASA Human Research Program (HRP) · Evidence Roadmap & 5 Hazards',
    agency: 'NASA HRP',
    summary:
      'Models Spaceflight Associated Neuro-ocular Syndrome (SANS) from cephalad fluid shift, 1–1.5%/month bone mineral density loss, postural muscle atrophy, and 90 min/day ARED resistive exercise countermeasures.',
    url: 'https://humanresearchroadmap.nasa.gov/Evidence/',
  },
  {
    id: 'osdr-575',
    title: 'NASA OSDR OSD-575 · SpaceX Inspiration4 Multi-Omics Study',
    agency: 'NASA Open Science Data Repository',
    summary:
      'Pre-flight, in-flight, and post-flight serum metabolic panels, immune/cardiac cytokine arrays, whole-blood hematology, and non-invasive saliva and sweat stress biomarkers.',
    url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-575',
  },
  {
    id: 'soma-nature',
    title: 'Space Omics and Medical Atlas (SOMA) · Nature (2024)',
    agency: 'NASA GeneLab / International Consortium',
    summary:
      'Longitudinal astronaut multi-omics atlas across blood, plasma, saliva, sweat, urine, and microbiome benchmarked against the NASA Twins Study and JAXA cohorts.',
    url: 'https://www.nature.com/articles/s41586-024-07639-y',
  },
  {
    id: 'iss-cognition',
    title: 'Cognitive Performance on 6-Month ISS Missions · Frontiers in Physiology (2024)',
    agency: 'NASA Behavioral Health & Performance',
    summary:
      'Quantifies how sleep debt, workload, and elevated cabin CO2 degrade executive neurocognitive function and fatigue during 6-month Low Earth Orbit expeditions.',
    url: 'https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2024.1451269/full',
  },
  {
    id: 'csa-biomonitor',
    title: 'CSA Bio-Monitor & Cosmic Radiation Health Monitoring (ISS)',
    agency: 'Canadian Space Agency (CSA)',
    summary:
      'Wearable biometric garment baselines on the ISS tracking ECG heart rate (50–90 bpm nominal), blood pressure, SpO2, skin temperature, respiratory rate, and radiation dosimetry.',
    url: 'https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp',
  },
  {
    id: 'csa-vascular',
    title: 'CSA Vascular Experiment · Cardiovascular Adaptation in Microgravity',
    agency: 'Canadian Space Agency (CSA)',
    summary:
      'ISS ultrasound and blood pressure studies demonstrating increased arterial stiffness, central fluid redistribution, and orthostatic intolerance during prolonged spaceflight.',
    url: 'https://www.asc-csa.gc.ca/eng/sciences/vascular.asp',
  },
];

export interface DestinationInfo {
  id: 'iss' | 'luna' | 'marte';
  name: string;
  distance: string;
  gravity: string;
  duration: string;
  radiationNote: string;
  note: string;
}

export const DESTINATIONS: DestinationInfo[] = [
  {
    id: 'iss',
    name: 'International Space Station (LEO · 408 km)',
    distance: '~408 km orbital altitude (90-min orbit)',
    gravity: 'Microgravity (~0 g · sustained cephalad fluid shift)',
    duration: 'Typical expedition: 180 days (6 months)',
    radiationNote: '0.5–1.0 mSv/day (partially shielded by Earth magnetosphere)',
    note: 'Baseline reference mission for NASA HRP, CSA Bio-Monitor, and 6-month cognitive/physiological studies.',
  },
  {
    id: 'luna',
    name: 'Moon · Artemis / Lunar Gateway',
    distance: '~384,400 km (approx. 76 h trans-lunar transit)',
    gravity: '1/6 Earth gravity (0.165 g on lunar surface)',
    duration: 'Apollo 11 historic baseline: 8 d, 3 h, 18 min, 35 s · Artemis: 10–30 days',
    radiationNote: '1.3–2.6 mSv/day outside Earth geomagnetic shield (SPE/GCR exposure)',
    note: 'Higher galactic cosmic ray and solar particle event exposure requiring active NASA DONKI storm shielding alerts.',
  },
  {
    id: 'marte',
    name: 'Mars · Deep-Space Transit & Surface Concept',
    distance: '55M – 400M km (6–9 months transit each way)',
    gravity: '0 g in transit · 0.38 g on Martian surface',
    duration: 'Design reference mission: ~900–1,000 days',
    radiationNote: '1.8–3.5+ mSv/day in interplanetary space (NASA-STD-3001 600 mSv career limit)',
    note: 'Autonomous crew health, closed-loop ECLSS, and regenerative bio-modules are critical due to up to 22-min comms delay.',
  },
];
