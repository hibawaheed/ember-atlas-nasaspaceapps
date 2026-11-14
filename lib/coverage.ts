import measurements from "@/data/measurements.json";
import { saffireTests } from "./saffire";

// Oxygen coverage by evidence type. "measured" values are test conditions held
// in this atlas; "limit" is what an apparatus can supply, not a tested value;
// "awaiting" lists published work whose values are not yet extracted;
// "outside" is evidence that exists beyond the PSI-based collection.
export type EvidenceKind = "measured" | "limit";

const o2 = measurements.series.flatMap((s) => [s.initialOxygenVolPct, s.finalOxygenVolPct]);

export const oxygenCoverage: {
  name: string;
  fuel: string;
  kind: EvidenceKind;
  min: number | null;
  max: number;
  points?: { id: string; pct: number; label: string }[];
  source: string;
  note: string;
}[] = [
  {
    name: "BASS-II, 18 runs",
    fuel: "Solid · PMMA strips",
    kind: "measured",
    min: Math.min(...o2),
    max: Math.max(...o2),
    source: "bass-report",
    note: "Run start and end oxygen (Table 5.1), ISS cabin, microgravity",
  },
  {
    name: "Saffire IV–VI, 5 tests",
    fuel: "Solid · fabric and PMMA",
    kind: "measured",
    min: Math.min(...saffireTests.map((t) => t.oxygenPct)),
    max: Math.max(...saffireTests.map((t) => t.oxygenPct)),
    points: saffireTests.map((t) => ({
      id: t.id,
      pct: t.oxygenPct,
      label: `${t.id} ${t.material.replace(" (acrylic)", "")}, ${t.pressureKpa} kPa`,
    })),
    source: "saffire6-paper",
    note: "Test conditions (Table 1), 54–100 kPa, 20 cm/s, spacecraft microgravity",
  },
  {
    name: "MDCA apparatus (FLEX, FLEX-2, CFI)",
    fuel: "Liquid droplets",
    kind: "limit",
    min: 0,
    max: 40,
    source: "researchers-guide",
    note: "Apparatus operating range, up to 40% O₂ at 0–3 atm; not tested values",
  },
  {
    name: "CFI-G burner supply",
    fuel: "Gaseous fuel",
    kind: "limit",
    min: null,
    max: 85,
    source: "challenge-2026",
    note: "Oxygen–nitrogen flow from the burner up to 85%; lower end not stated",
  },
];

export const awaitingExtraction = [
  "FLEX and FLEX-2 droplet test atmospheres (PSI-69)",
  "SoFIE-GEL, BRE and E-FIELD Flames test conditions",
  "SAME smoke tests and other Saffire IV–V samples",
];

export const outsideCollection = [
  "Partial-gravity flame tests from drop towers and parabolic flights (published outside PSI; see the evidence library)",
  "Lunar-gravity tests from LUCI and FM2 (not yet flown)",
];

export const habitatLines = [
  { name: "Earth air", pct: 20.9 },
  { name: "Moon base scenario ≥30%", pct: 30 },
  { name: "Spacesuit 100%", pct: 100 },
];
