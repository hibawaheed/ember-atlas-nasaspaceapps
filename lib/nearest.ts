import compact from "@/data/tests-compact.json";
import saffire from "@/data/saffire.json";
import type { Scenario } from "./scenario";

// Browser-safe view of the NASA test records (data/tests-compact.json, built by
// scripts/build-tests.mjs from PSI tables and the Saffire VI paper).
export type TestRecord = {
  id: string;
  a: string | null; // PSI accession
  inv: string;
  t: string; // test ID as NASA lists it
  c: "droplet" | "gas" | "solid" | "smoke";
  f: string; // fuel or material as listed
  o2: number;
  r: number; // 1 = chamber (ambient) oxygen, 0 = burner oxidizer stream
  p: number | null; // kPa
  v: number | null; // cm/s
  o: string | null; // outcome as listed
  d: string | null;
};
export const testRecords = compact.records as TestRecord[];

export const fuelClassOf = (s: Scenario): TestRecord["c"] => (s.fuel === "droplet" ? "droplet" : "solid");
export const fuelClassName = { droplet: "Liquid droplets", solid: "Solid materials", gas: "Gas flames", smoke: "Smoke and dust" };

export function sourceLink(t: TestRecord) {
  if (t.a) return { href: `https://psi.nasa.gov/physci/repo/data/investigations/${t.a}`, label: `NASA PSI ${t.a}` };
  return { href: `${saffire.source.pdfUrl}#page=3`, label: "NASA ICES-2024-365, Table 1" };
}
export function testName(t: TestRecord) {
  return t.a ? `${t.inv} test ${t.t}` : `Saffire ${t.t}`;
}

export type RowStatus = "same" | "close" | "differs" | "unknown";
export type Row = { condition: string; scenario: string; test: string; status: RowStatus; note: string };

const gravityName = { micro: "Microgravity", moon: "Lunar, about 0.166 g", mars: "Martian, about 0.38 g", earth: "Earth, 1 g" };
const fuelName = { pmma: "PMMA (acrylic)", cellulose: "Cellulose-type solid", droplet: "Liquid droplet" };

function materialStatus(s: Scenario, t: TestRecord): RowStatus {
  if (s.fuel === "droplet") return t.c === "droplet" ? "close" : "differs";
  if (t.c !== "solid") return "differs";
  const f = t.f.toLowerCase();
  if (s.fuel === "pmma") return /pmma|acrylic|rod|plexi/.test(f) ? "same" : "differs";
  return /sibal|cotton|fabric|jersey|cloth/.test(f) ? "close" : "differs";
}

/** Condition-by-condition comparison of a scenario with one measured test. */
export function compareRows(s: Scenario, t: TestRecord): Row[] {
  const mat = materialStatus(s, t);
  const dO2 = Math.abs(s.oxygen - t.o2);
  const rows: Row[] = [
    {
      condition: "Fuel",
      scenario: fuelName[s.fuel],
      test: t.f,
      status: mat,
      note: mat === "same" ? "Same material" : mat === "close" ? (t.c === "droplet" ? "Liquid droplet, different fuel" : "Similar cellulose-based fabric") : "Different fuel type",
    },
    {
      condition: "Oxygen",
      scenario: `${s.oxygen}%`,
      test: `${t.o2}%`,
      status: dO2 <= 1 ? "same" : dO2 <= 3 ? "close" : "differs",
      note: `${dO2.toFixed(1)} percentage points apart`,
    },
  ];
  if (t.p == null) rows.push({ condition: "Pressure", scenario: `${s.pressure} kPa`, test: "Not listed", status: "unknown", note: "NASA's table gives no pressure" });
  else {
    const dP = Math.abs(s.pressure - t.p);
    rows.push({
      condition: "Pressure",
      scenario: `${s.pressure} kPa`,
      test: `${t.p} kPa`,
      status: dP / s.pressure <= 0.05 ? "same" : dP / s.pressure <= 0.15 ? "close" : "differs",
      note: `${dP.toFixed(1)} kPa apart`,
    });
  }
  if (t.v == null)
    rows.push({ condition: "Airflow", scenario: `${s.airflow} cm/s`, test: t.c === "droplet" ? "None imposed (quiescent)" : "Not listed", status: t.c === "droplet" ? (s.airflow <= 1 ? "same" : "differs") : "unknown", note: t.c === "droplet" ? "Droplet tests ran in still gas" : "NASA's table gives no flow" });
  else {
    const dV = Math.abs(s.airflow - t.v);
    rows.push({ condition: "Airflow", scenario: `${s.airflow} cm/s`, test: `${t.v} cm/s`, status: dV <= 1 ? "same" : dV <= 4 ? "close" : "differs", note: `${dV} cm/s apart` });
  }
  rows.push({
    condition: "Gravity",
    scenario: gravityName[s.gravity],
    test: t.a === "PSI-98" || t.a === "PSI-99" || !t.a ? "Spacecraft microgravity (Cygnus)" : "ISS microgravity",
    status: s.gravity === "micro" ? "same" : "differs",
    note: s.gravity === "micro" ? "Same gravity regime" : "Every test here is microgravity",
  });
  return rows;
}

const list = (xs: string[]) => (xs.length > 1 ? xs.slice(0, -1).join(", ") + " and " + xs.at(-1) : xs[0]);

/** One sentence naming what matches and every condition that differs or is unknown. */
export function reasonFor(rows: Row[]) {
  const same = rows.filter((r) => r.status === "same" || r.status === "close").map((r) =>
    r.condition === "Fuel" ? (r.status === "same" ? "same material" : r.note.toLowerCase()) : r.condition === "Oxygen" ? (parseFloat(r.note) < 0.05 ? "same oxygen" : `oxygen within ${parseFloat(r.note).toFixed(1)} points`) : r.condition.toLowerCase(),
  );
  const differs = rows.filter((r) => r.status === "differs").map((r) => r.condition.toLowerCase());
  const unknown = rows.filter((r) => r.status === "unknown").map((r) => r.condition.toLowerCase());
  const parts = [
    same.length ? `${list(same)[0].toUpperCase()}${list(same).slice(1)} match${same.length > 1 ? "" : "es"}.` : "Nothing matches closely; this is the nearest test available.",
    differs.length ? `${list(differs)[0].toUpperCase()}${list(differs).slice(1)} differ${differs.length > 1 ? "" : "s"}.` : "",
    unknown.length ? `${list(unknown)[0].toUpperCase()}${list(unknown).slice(1)} not listed in NASA's table.` : "",
  ];
  return parts.filter(Boolean).join(" ");
}

/**
 * Measured tests nearest to a scenario within one fuel class. Order: material
 * match, then oxygen difference, then pressure difference (unknown pressure
 * counts as 15 kPa), then flow. Only chamber (ambient) oxygen is compared.
 */
export function nearestTests(s: Scenario, fuelClass: TestRecord["c"] = fuelClassOf(s), limit = 3) {
  const w = { same: 0, close: 1, differs: 4, unknown: 2 };
  return testRecords
    .filter((t) => t.r === 1 && t.c === fuelClass)
    .map((t) => {
      const rows = compareRows(s, t);
      const score =
        w[rows[0].status] * 5 +
        Math.abs(s.oxygen - t.o2) +
        (t.p == null ? 1.5 : Math.abs(s.pressure - t.p) / 10) +
        (t.v == null ? 0.5 : Math.abs(s.airflow - t.v) / 10);
      return { test: t, rows, score, reason: reasonFor(rows) };
    })
    .sort((a, b) => a.score - b.score || a.test.id.localeCompare(b.test.id))
    .slice(0, limit);
}

/** Tests whose chamber oxygen and pressure both fall within a tolerance of the scenario. */
export function testsAtAtmosphere(s: { oxygen: number; pressure: number }, o2Tol = 1, pTol = 3) {
  return testRecords.filter((t) => t.r === 1 && t.p != null && Math.abs(t.o2 - s.oxygen) <= o2Tol && Math.abs(t.p - s.pressure) <= pTol);
}
