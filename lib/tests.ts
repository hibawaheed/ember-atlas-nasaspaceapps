import data from "@/data/tests.json";
import catalogData from "@/data/psi/catalog.json";
import manifest from "@/data/psi/manifest.json";
import { z } from "zod";

// Server-side access to every NASA test record (data/tests.json). The browser
// uses the smaller lib/nearest.ts view instead.
export type FullTest = (typeof data.tests)[number] & { source?: string; platform?: string; diluentPct?: Record<string, number> };
export const allTests = data.tests as FullTest[];
export const testSummaries = data.summaries;
export const dataQuirks = data.quirks;
export const testMatrices = data.matrices;
export const testCounts = data.counts;
export const psiCatalog = catalogData.investigations;
export const psiManifest = manifest;

export const testQuerySchema = z.object({
  investigation: z.string().max(40).optional(),
  fuelClass: z.enum(["droplet", "gas", "solid", "smoke"]).optional(),
  fuel: z.string().max(40).optional(),
  o2Min: z.number().min(0).max(100).optional(),
  o2Max: z.number().min(0).max(100).optional(),
  pressureMin: z.number().min(0).max(1000).optional(),
  pressureMax: z.number().min(0).max(1000).optional(),
  sortBy: z.enum(["o2", "pressure", "burningRate", "spreadRate", "burnTime", "date"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  limit: z.number().int().min(1).max(500).optional(),
});
export type TestQuery = z.infer<typeof testQuerySchema>;

const metric = (t: FullTest, key: NonNullable<TestQuery["sortBy"]>): number | null => {
  const m = t.measured as Record<string, { value: unknown }>;
  if (key === "o2") return t.o2Pct;
  if (key === "pressure") return t.pressureKpa;
  if (key === "date") return t.date ? Date.parse(t.date) || null : null;
  if (key === "spreadRate") {
    const v = m.spreadRates?.value as { spreadRateMms: number }[] | undefined;
    return v?.length ? Math.max(...v.map((x) => x.spreadRateMms)) : null;
  }
  const v = m[key]?.value;
  return typeof v === "number" ? v : null;
};

/** Filters the records; oxygen filters use chamber (ambient) oxygen only. */
export function queryTests(q: TestQuery) {
  const inv = q.investigation?.toLowerCase().replace(/[^a-z0-9]/g, "");
  let rows = allTests.filter((t) => {
    if (inv && !t.investigation.toLowerCase().replace(/[^a-z0-9]/g, "").includes(inv) && t.accession?.toLowerCase() !== q.investigation!.toLowerCase()) return false;
    if (q.fuelClass && t.fuelClass !== q.fuelClass) return false;
    if (q.fuel && !t.fuel.toLowerCase().includes(q.fuel.toLowerCase())) return false;
    const ambient = t.o2Role === "ambient" ? t.o2Pct : null;
    if (q.o2Min != null && (ambient == null || ambient < q.o2Min)) return false;
    if (q.o2Max != null && (ambient == null || ambient > q.o2Max)) return false;
    if (q.pressureMin != null && (t.pressureKpa == null || t.pressureKpa < q.pressureMin)) return false;
    if (q.pressureMax != null && (t.pressureKpa == null || t.pressureKpa > q.pressureMax)) return false;
    return true;
  });
  const total = rows.length;
  if (q.sortBy) {
    const dir = q.order === "asc" ? 1 : -1;
    rows = rows.filter((t) => metric(t, q.sortBy!) != null).sort((a, b) => dir * (metric(a, q.sortBy!)! - metric(b, q.sortBy!)!));
  }
  return { total, rows: rows.slice(0, q.limit ?? 50) };
}

export const recordLink = (t: { accession: string | null }) =>
  t.accession ? `https://psi.nasa.gov/physci/repo/data/investigations/${t.accession}` : "https://ntrs.nasa.gov/citations/20240002981";

/** Compact text for the AI: one line per test, no raw cells. */
export function testLine(t: FullTest) {
  const m = t.measured as Record<string, { value: unknown; unit: string }>;
  const meas = Object.entries(m)
    .filter(([k]) => k !== "flowSettings")
    .map(([k, v]) => `${k}=${Array.isArray(v.value) ? JSON.stringify(v.value) : v.value}${v.unit && typeof v.value !== "object" ? " " + v.unit : ""}`)
    .join("; ");
  return `${t.id} | ${t.investigation} test ${t.testId} | ${t.fuelClass}: ${t.fuel} | O2 ${t.o2Pct ?? "not listed"}%${t.o2Role === "oxidizer stream" ? " (burner oxidizer stream)" : ""} | P ${t.pressureKpa ?? "not listed"} kPa | flow ${t.flowCms ?? "not listed"} cm/s | outcome ${t.outcome ?? "not listed"} | ${meas}${t.flags.length ? " | notes: " + t.flags.join("; ") : ""}`;
}
