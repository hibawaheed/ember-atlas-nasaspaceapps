import { allTests, queryTests, testSummaries, testLine, recordLink, type FullTest, type TestQuery } from "./tests";
import { namedInvestigations } from "./context";

// Picks NASA test rows relevant to a question so the AI can quote measured
// values. Selection is deterministic; the model only writes the prose.

const invByProfile: Record<string, string[]> = {
  bass: ["BASS-II", "BASS"],
  same: ["SAME", "SAME-R", "DAFT / DAFT-2"],
  flex: ["FLEX", "CFI"],
  saffire: ["Saffire-I", "Saffire-II", "Saffire-III", "Saffire IV", "Saffire V", "Saffire VI"],
  acme: ["ACME BRE", "ACME CFI-G", "ACME Flame Design", "ACME s-Flame", "ACME CLD Flame", "ACME E-FIELD Flames"],
  bre: ["ACME BRE"],
  efield: ["ACME E-FIELD Flames"],
  cfig: ["ACME CFI-G"],
  spice: ["SPICE", "SLICE"],
  sofie: [],
};

const metricWords: [RegExp, NonNullable<TestQuery["sortBy"]>][] = [
  [/spread/i, "spreadRate"],
  [/burning rate|burn(ing)? rate|burned fastest|burns fastest/i, "burningRate"],
  [/burn time|longest|duration|lasted/i, "burnTime"],
  [/pressure/i, "pressure"],
  [/oxygen|o2|o₂/i, "o2"],
];

export type DataRow = { id: string; line: string; test: FullTest };

const toRow = (t: FullTest): DataRow => ({ id: `test:${t.id}`, line: `test:${testLine(t)}`, test: t });

/** Oxygen and pressure named in the question, if any. */
export function conditionsIn(q: string) {
  const moon = /moon base|lunar habitat|lunar base|moon habitat|rover/i.test(q);
  const o2 = q.match(/(\d{1,2}(?:\.\d)?)\s*%\s*(?:oxygen|o2|o₂)?/i);
  const kpa = q.match(/(\d{2,3}(?:\.\d)?)\s*kpa/i);
  const psi = q.match(/(\d{1,2}(?:\.\d)?)\s*psi/i);
  const atm = q.match(/(\d(?:\.\d+)?)\s*atm/i);
  const oxygen = o2 ? Number(o2[1]) : moon ? 30 : null;
  const pressure = kpa ? Number(kpa[1]) : psi ? Number(psi[1]) * 6.894757 : atm ? Number(atm[1]) * 101.325 : moon ? 70.3 : null;
  return { oxygen, pressure };
}

export function buildDataContext(question: string, previousQuestion?: string) {
  const q = previousQuestion ? `${question} ${previousQuestion}` : question;
  const named = namedInvestigations(q).flatMap((id) => invByProfile[id] ?? []);
  const rows: DataRow[] = [];
  const notes: string[] = [];
  const add = (ts: FullTest[]) => ts.forEach((t) => rows.length < 12 && !rows.some((r) => r.test.id === t.id) && rows.push(toRow(t)));

  // 1. Superlatives: "fastest spread", "highest oxygen", "longest burn".
  const superlative = /\b(fastest|slowest|highest|lowest|longest|shortest|most|least|maximum|minimum|max|min|largest|smallest|top)\b/i.exec(question);
  if (superlative) {
    const metric = metricWords.find(([re]) => re.test(question))?.[1];
    if (metric) {
      const asc = /slowest|lowest|shortest|least|minimum|min|smallest/i.test(superlative[1]);
      const invs = named.length ? named : [undefined];
      for (const inv of invs) {
        const r = queryTests({ investigation: inv, sortBy: metric, order: asc ? "asc" : "desc", limit: 4 });
        add(r.rows);
        notes.push(`Rows sorted by ${metric} (${asc ? "lowest" : "highest"} first) across all ${r.total} ${inv ?? ""} records with that value; the first row is the ${asc ? "lowest" : "highest"} in the whole table.`);
      }
    }
  }
  // 2. Conditions named in the question (or the Moon base scenario).
  const { oxygen, pressure } = conditionsIn(question);
  if (oxygen != null) {
    const near = allTests
      .filter((t) => t.o2Role === "ambient" && t.o2Pct != null && Math.abs(t.o2Pct - oxygen) <= 1.5 && (pressure == null || (t.pressureKpa != null && Math.abs(t.pressureKpa - pressure) <= Math.max(5, pressure * 0.06))))
      .filter((t) => !named.length || named.includes(t.investigation))
      .sort((a, b) => Math.abs(a.o2Pct! - oxygen) - Math.abs(b.o2Pct! - oxygen) || (pressure != null ? Math.abs(a.pressureKpa! - pressure) - Math.abs(b.pressureKpa! - pressure) : 0));
    add(near.slice(0, 8));
    notes.push(`${near.length} records within 1.5 points of ${oxygen}% chamber oxygen${pressure != null ? ` and about ${Math.round(pressure)} kPa` : ""}${near.length > 8 ? "; 8 are shown" : ""}.`);
  }
  // 3. Named investigations with no other rows: a few representative tests.
  for (const inv of named) if (!rows.some((r) => r.test.investigation === inv)) add(allTests.filter((t) => t.investigation === inv && t.o2Pct != null).slice(0, 2));

  // "What conditions did X test?": a grid of oxygen × pressure with counts.
  const grids: string[] = [];
  if (named.length && /\b(conditions|tested|test|oxygen|pressure|atmospheres?|levels?)\b/i.test(question)) {
    for (const inv of named) {
      const m = new Map<string, number>();
      allTests.filter((t) => t.investigation === inv && t.o2Role === "ambient" && t.o2Pct != null).forEach((t) => {
        const k = `${Math.round(t.o2Pct!)}% O2 at ${t.pressureKpa != null ? Math.round(t.pressureKpa / 5) * 5 + " kPa" : "pressure not listed"}`;
        m.set(k, (m.get(k) ?? 0) + 1);
      });
      if (m.size) grids.push(`${inv} tested conditions (chamber oxygen at rounded pressure, number of tests): ${[...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 24).map(([k, n]) => `${k} (${n})`).join("; ")}`);
    }
  }
  const wantsSummary = named.length > 0 || /\b(tests?|tested|conditions|data|measured|measurements|runs?|table|atmospheres?)\b/i.test(question) || oxygen != null;
  const summaries = (named.length ? testSummaries.filter((s) => named.includes(s.investigation)) : wantsSummary ? testSummaries : [])
    .map((s) => `${s.investigation} (${s.accession ?? "NASA paper"}): ${s.records} records, ${s.fuelClass}; chamber oxygen ${s.ambientO2Pct ? s.ambientO2Pct.join("–") + "%" : "not listed"}; pressure ${s.pressureKpa ? s.pressureKpa.join("–") + " kPa" : "not listed"}; fuels: ${s.fuels.slice(0, 6).join(", ")}`);
  return { rows, summaries: [...grids, ...summaries], notes };
}

export const dataCitation = (r: DataRow, number: number) => ({
  number,
  findingId: r.id,
  title: `${r.test.investigation} test ${r.test.testId} · NASA ${r.test.accession ? `PSI ${r.test.accession} experimental table` : "ICES-2024-365, Table 1"}`,
  url: recordLink(r.test),
  type: "NASA test record",
});
