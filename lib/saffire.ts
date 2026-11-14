import saffire from "@/data/saffire.json";
import type { Scenario } from "./scenario";

export type SaffireTest = (typeof saffire.tests)[number];
export const saffireTests: SaffireTest[] = saffire.tests;
export const saffireSource = saffire.source;
export const tableLink = (page: number) => `${saffire.source.pdfUrl}#page=${page}`;

const gravityName = { micro: "Microgravity", moon: "Lunar, about 0.166 g", mars: "Martian, about 0.38 g", earth: "Earth, 1 g" };
const fuelName = { pmma: "PMMA (acrylic)", cellulose: "Cellulose-type solid", droplet: "Liquid droplet" };

export type Row = {
  condition: string;
  scenario: string;
  test: string;
  status: "same" | "close" | "differs";
  note: string;
};

function materialMatch(fuel: Scenario["fuel"], t: SaffireTest): Row["status"] {
  if (fuel === "pmma") return t.material.startsWith("PMMA") ? "same" : "differs";
  if (fuel === "cellulose") return t.fuelClass === "thin fabric" ? "close" : "differs";
  return "differs";
}

/** Condition-by-condition comparison of a lab scenario with one measured test. */
export function compareToTest(s: Scenario, t: SaffireTest): Row[] {
  const dO2 = Math.abs(s.oxygen - t.oxygenPct);
  const dP = Math.abs(s.pressure - t.pressureKpa);
  const dFlow = Math.abs(s.airflow - t.airflowCms);
  const mat = materialMatch(s.fuel, t);
  return [
    {
      condition: "Material",
      scenario: fuelName[s.fuel],
      test: t.materialDetail,
      status: mat,
      note: mat === "same" ? "Same material" : mat === "close" ? "Similar cellulose-based fuel" : "Different fuel",
    },
    {
      condition: "Oxygen fraction",
      scenario: `${s.oxygen}%`,
      test: `${t.oxygenPct}%`,
      status: dO2 <= 1 ? "same" : dO2 <= 3 ? "close" : "differs",
      note: `${dO2.toFixed(1)} percentage points apart`,
    },
    {
      condition: "Total pressure",
      scenario: `${s.pressure} kPa`,
      test: `${t.pressureKpa} kPa`,
      status: dP / s.pressure <= 0.05 ? "same" : dP / s.pressure <= 0.15 ? "close" : "differs",
      note: `${dP.toFixed(1)} kPa apart`,
    },
    {
      condition: "Airflow",
      scenario: `${s.airflow} cm/s`,
      test: `${t.airflowCms} cm/s, concurrent`,
      status: dFlow <= 1 ? "same" : dFlow <= 4 ? "close" : "differs",
      note: `${dFlow} cm/s apart`,
    },
    {
      condition: "Gravity",
      scenario: gravityName[s.gravity],
      test: "Spacecraft microgravity",
      status: s.gravity === "micro" ? "same" : "differs",
      note: s.gravity === "micro" ? "Same gravity regime" : "No measured test at this gravity in the atlas",
    },
  ];
}

/** One-sentence reason, e.g. "Same material and an oxygen fraction within 0.3 percentage points. Pressure, airflow and gravity differ." */
export function reasonFor(rows: Row[]) {
  const by = (c: string) => rows.find((r) => r.condition === c)!;
  const parts: string[] = [];
  const mat = by("Material");
  if (mat.status === "same") parts.push("Same material");
  else if (mat.status === "close") parts.push("A similar cellulose-based material");
  const o2 = by("Oxygen fraction");
  const dO2 = parseFloat(o2.note);
  if (o2.status !== "differs") parts.push(`an oxygen fraction within ${dO2.toFixed(1)} percentage points`);
  const lead =
    mat.status === "differs" && o2.status !== "differs"
      ? `Different material, but ${parts.join(" and ")}.`
      : parts.length
        ? parts.join(" and ").replace(/^./, (c) => c.toUpperCase()) + "."
        : "Closest available measured test, but material and oxygen both differ.";
  const differ = rows
    .filter((r) => r.status === "differs" && r.condition !== "Material" && r.condition !== "Oxygen fraction")
    .map((r) => r.condition.replace("Total pressure", "pressure").toLowerCase());
  const tail = differ.length
    ? ` ${differ.length > 1 ? differ.slice(0, -1).join(", ") + " and " + differ.at(-1) : differ[0]} differ${differ.length > 1 ? "" : "s"}.`
    : "";
  return (lead + tail.replace(/^ (.)/, (m, c) => " " + c.toUpperCase())).trim();
}

/** Measured tests ordered by closeness to the scenario (material first, then oxygen, then pressure). */
export function closestTests(s: Scenario) {
  const weight = { same: 0, close: 1, differs: 3 };
  return saffireTests
    .map((t) => {
      const rows = compareToTest(s, t);
      const score =
        weight[rows[0].status] * 4 +
        Math.abs(s.oxygen - t.oxygenPct) +
        Math.abs(s.pressure - t.pressureKpa) / 10;
      return { test: t, rows, score, reason: reasonFor(rows) };
    })
    .sort((a, b) => a.score - b.score || a.test.id.localeCompare(b.test.id));
}
