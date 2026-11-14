import measurements from "@/data/measurements.json";

// Oxygen ranges with a documented source. "tested" = measured run conditions;
// "capability" = what the apparatus can provide, not what was tested.
// Investigations without a sourced oxygen range are listed as unknown, never guessed.
const o2 = measurements.series.flatMap((s) => [
  s.initialOxygenVolPct,
  s.finalOxygenVolPct,
]);
export const oxygenCoverage = [
  {
    name: "BASS-II (18 runs)",
    min: Math.min(...o2),
    max: Math.max(...o2),
    kind: "tested" as const,
    source: "bass-report",
    note: "Run start and end oxygen, Table 5.1",
  },
  {
    name: "MDCA (FLEX, FLEX-2, CFI)",
    min: 0,
    max: 40,
    kind: "capability" as const,
    source: "researchers-guide",
    note: "Apparatus range: up to 40% oxygen at 0–3 atm",
  },
  {
    name: "CFI-G burner flow",
    min: null,
    max: 85,
    kind: "capability" as const,
    source: "challenge-2026",
    note: "Oxygen–nitrogen flow from the burner up to 85%; lower end not stated",
  },
];
export const coverageUnknown = [
  "SAME / SAME-R",
  "Saffire",
  "SoFIE-GEL",
  "BRE",
  "E-FIELD Flames",
  "SPICE & SLICE",
];
export const habitatLines = [
  { name: "Earth air", pct: 20.9 },
  { name: "Moon base ≥30%", pct: 30 },
  { name: "Spacesuit 100%", pct: 100 },
];
