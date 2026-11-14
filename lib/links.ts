// NASA reference pages from the challenge's Resources tab (owner-copied,
// November 14, 2026). Background and Earth-application links; not counted as
// evidence sources for findings.
export const nasaLinks = {
  spinoffAirTanks: { title: "Fireman’s Air Tanks", label: "NASA Spinoff", url: "https://spinoff.nasa.gov/node/9582" },
  spinoffFireDetector: { title: "Fire Detector", label: "NASA Spinoff", url: "https://spinoff.nasa.gov/node/9407" },
  spinoffFireAttire: { title: "New Technology for the Fire Attire", label: "NASA Spinoff", url: "https://spinoff.nasa.gov/node/9918" },
  apollo1: { title: "Apollo 1", label: "NASA Safety and Mission Assurance", url: "https://sma.nasa.gov/sma-disciplines/accllp/apollo-1" },
  apollo13: { title: "Apollo 13", label: "NASA Safety and Mission Assurance", url: "https://sma.nasa.gov/sma-disciplines/accllp/apollo-13" },
  mir: { title: "25 Years Ago: Fire Aboard Space Station Mir", label: "NASA History", url: "https://www.nasa.gov/history/25-years-ago-fire-aboard-space-station-mir/" },
  glennCombustion: { title: "Combustion Science at NASA Glenn", label: "NASA Glenn", url: "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/" },
  psiCombustion: { title: "PSI combustion investigations", label: "NASA PSI", url: "https://psi.nasa.gov/physci/repo/search?q=combustion" },
} as const;
export type LinkKey = keyof typeof nasaLinks;
