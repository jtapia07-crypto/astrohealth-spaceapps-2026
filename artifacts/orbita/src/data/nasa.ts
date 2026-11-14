/** Educational references, not operational flight or medical limits. */
export const NASA_REFERENCES = [
  {
    title: 'Apollo 11 · historic mission',
    url: 'https://www.nasa.gov/history/apollo-11-mission-overview/',
    summary: 'The crewed flight from July 16 to 24, 1969 lasted 8 days, 3 hours, 18 minutes and 35 seconds. Lunar orbit insertion occurred roughly 76 hours after launch.',
  },
  {
    title: 'The human body in space',
    url: 'https://www.nasa.gov/humans-in-space/the-human-body-in-space/',
    summary: 'NASA describes muscle, bone, cardiovascular and fluid distribution changes in microgravity, including fluid shifts linked to vision changes. It also studies sleep, isolation, exercise and space gardens. These are not individual diagnoses.',
  },
  {
    title: 'The five hazards of human spaceflight',
    url: 'https://www.nasa.gov/hrp/hazards/',
    summary: 'Radiation, isolation and confinement, distance from Earth, gravity fields, and hostile or closed environments. Crewed trips to Mars are studied as future missions, not flights already flown.',
  },
] as const;

export const MISSION_FACTS = {
  iss: {
    name: 'Earth orbit · ISS',
    kind: 'Real crewed experience',
    distance: 'Low orbit; a few hundred kilometers of altitude',
    gravity: 'Microgravity during orbital free fall',
    duration: 'Reference: stays of about 6 months; duration varies',
    note: 'Gravity does not disappear in orbit: the station and its crew are in free fall. Exercise, sleep, air quality and radiation exposure are monitored. This app receives no ISS telemetry.',
  },
  moon: {
    name: 'Moon · Apollo 11 reference',
    kind: 'Historic mission · 1969',
    distance: 'Apollo 11 transit: about 76 h to lunar orbit',
    gravity: 'Microgravity in transit; partial gravity on the surface',
    duration: 'Apollo 11: 8 d, 3 h, 18 min, 35 s',
    note: 'Neil Armstrong, Buzz Aldrin and Michael Collins flew from July 16 to 24, 1969. Armstrong and Aldrin descended to the surface; Collins stayed in orbit. A different simulated mission does not automatically reproduce their trajectory or conditions.',
  },
  mars: {
    name: 'Mars · future scenario',
    kind: 'Hypothetical · no human flights yet',
    distance: 'Variable distance; NASA cites an average of 140 million miles',
    gravity: 'About 3/8 of Earth gravity on the surface',
    duration: 'Reference planning: on the order of 3 years round trip',
    note: 'No person has traveled to Mars. NASA studies transits of about 6 months and communications that can take about 20 minutes one way. These are trajectory-dependent educational references, not a flight prediction or certified parameters.',
  },
} as const;
