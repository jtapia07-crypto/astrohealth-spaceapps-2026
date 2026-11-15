/** Educational & scientific references from NASA, CSA and peer-reviewed spaceflight studies. */
export const NASA_REFERENCES = [
  {
    title: 'NASA-STD-3001 · Human Factors & Health Standards',
    url: 'https://standards.nasa.gov/human-factors-and-health',
    summary: 'NASA Spaceflight Human-System Standard establishing crew health, environmental life-support limits (ppCO2, ppO2, cabin pressure, thermal comfort) and permissible radiation exposure thresholds.',
  },
  {
    title: 'NASA Human Research Program (HRP) & Evidence Roadmap',
    url: 'https://humanresearchroadmap.nasa.gov/Evidence/',
    summary: 'Evidence base evaluating spaceflight human health risks: SANS (neuro-ocular syndrome), bone density loss, muscle atrophy, radiation carcinogenesis, cardiovascular deconditioning and behavioral health.',
  },
  {
    title: 'NASA OSDR · OSD-575 (SpaceX Inspiration4 Multi-Omics)',
    url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-575',
    summary: 'Open Science Data Repository dataset analyzing blood serum metabolic panels, immune/cardiac cytokine arrays, whole blood, saliva, sweat and skin microbiome responses across pre-flight, flight and recovery.',
  },
  {
    title: 'NASA Life Sciences Portal (NLSP) · Human Experiments',
    url: 'https://nlsp.nasa.gov/explore?dataType=EXPERIMENTS&CombinedSpecies=Human+%28Homo+sapiens%29',
    summary: 'Archive of human spaceflight investigations covering cardiovascular physiology, radiation biology, ocular phenomena, skeletal/muscle physiology, immunology and cognitive performance.',
  },
  {
    title: 'NASA DONKI · Space Weather Database Of Notifications',
    url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
    summary: 'Live heliophysics telemetry feed providing geomagnetic storm indices (Kp), solar flare classes (FLR) and solar wind conditions used in this application to model crew radiation and habitat alerts.',
  },
  {
    title: 'The five hazards of human spaceflight · NASA HRP',
    url: 'https://www.nasa.gov/hrp/hazards/',
    summary: 'Radiation, isolation and confinement, distance from Earth, gravity fields, and hostile or closed environments.',
  },
  {
    title: 'CSA Bio-Monitor & Radiation Health Monitoring',
    url: 'https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp',
    summary: 'Canadian Space Agency wearable biometric system (ECG heart rate, blood pressure, SpO2, breathing rate, skin temp) and cosmic radiation dosimetry aboard the ISS.',
  },
  {
    title: 'CSA Vascular & Cardiovascular Adaptation in Orbit',
    url: 'https://www.asc-csa.gc.ca/eng/sciences/vascular.asp',
    summary: 'ISS research investigating arterial stiffness, fluid shifts and cardiovascular adaptation during long-duration microgravity missions.',
  },
  {
    title: 'Cognitive Performance on 6-Month ISS Missions (2024)',
    url: 'https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2024.1451269/full',
    summary: 'Peer-reviewed study on astronaut neurocognitive performance, sleep architecture, workload and environmental stressors during 6-month low Earth orbit expeditions.',
  },
] as const;

export const MISSION_FACTS = {
  iss: {
    name: 'Earth orbit · ISS',
    kind: 'Real crewed experience · NASA-STD-3001',
    distance: 'Low Earth Orbit (~400 km altitude)',
    gravity: 'Microgravity during orbital free fall',
    duration: 'Reference: stays of ~6 months (180 days)',
    note: 'Crew health parameters follow NASA-STD-3001 Vol. 2 and NASA HRP evidence baselines, coupled with live NASA DONKI heliophysics telemetry.',
  },
  moon: {
    name: 'Moon · Artemis / Apollo reference',
    kind: 'Cis-lunar & lunar surface · 1/6 g',
    distance: '~384,400 km (Apollo 11 transit: ~76 h)',
    gravity: 'Microgravity in transit; 0.165 g on the lunar surface',
    duration: 'Apollo 11: 8 d, 3 h, 18 min · Artemis planning: 14–30+ d',
    note: 'Beyond Earth’s magnetosphere, crews face heightened galactic cosmic ray (GCR) and solar particle event (SPE) exposure monitored via NASA DONKI.',
  },
  mars: {
    name: 'Mars · Deep-space transit concept',
    kind: 'Hypothetical · NASA HRP Design Reference',
    distance: 'Variable distance (~225 million km average)',
    gravity: '0.38 g (about 3/8 of Earth gravity) on the surface',
    duration: 'Reference planning: ~900–1,000 days round trip',
    note: 'Deep-space mission scenario modeled using NASA HRP five hazards criteria, extended communication latency (~20 min one way) and closed-loop life support.',
  },
} as const;
