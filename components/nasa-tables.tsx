"use client";
import { ArrowUpRight, Download } from "lucide-react";
import meta from "@/data/tests-meta.json";

const psi = (a: string | null) => (a ? `https://psi.nasa.gov/physci/repo/data/investigations/${a}` : "https://ntrs.nasa.gov/citations/20240002981");
const range = (r: number[] | null, unit: string) => (r ? (r[0] === r[1] ? `${r[0]}${unit}` : `${r[0]}–${r[1]}${unit}`) : "not listed");

/** NASA's PSI experimental tables as imported: per-investigation summary and the data-entry problems found. */
export default function NasaTables() {
  return (
    <>
      <section className="panel nasa-tables" aria-labelledby="nt-title">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">NASA PSI EXPERIMENTAL TABLES</span>
            <h2 id="nt-title">{meta.counts.records.toLocaleString()} test records from {meta.counts.investigations} investigations</h2>
            <p className="map-lead">
              Every row of the experimental tables NASA publishes for its combustion investigations in Physical Sciences Informatics, plus the five Saffire IV–VI tests from
              NASA&apos;s ICES-2024-365 paper. Units are converted in code (mmHg, atm and bar to kPa; mole fraction to percent); the original cells are kept with each record.
            </p>
          </div>
          <a className="button secondary" href="/api/tests?format=csv&limit=3000" download>
            <Download size={14} /> All {meta.counts.records.toLocaleString()} records (CSV)
          </a>
        </div>
        <div className="table-wrap">
          <table>
            <caption>Imported tables. Chamber oxygen and pressure as listed; “not listed” means NASA&apos;s table has no such column.</caption>
            <thead>
              <tr>
                <th>Investigation</th>
                <th>Fuel type</th>
                <th>Records</th>
                <th>Chamber oxygen</th>
                <th>Pressure</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {meta.summaries.map((s) => (
                <tr key={s.investigation}>
                  <th>{s.investigation}</th>
                  <td>{s.fuelClass}</td>
                  <td>{s.records}</td>
                  <td>{range(s.ambientO2Pct, "%")}</td>
                  <td>{range(s.pressureKpa, " kPa")}</td>
                  <td>
                    <a className="text-link" href={psi(s.accession)} target="_blank" rel="noreferrer">
                      {s.accession ?? "ICES-2024-365"} <ArrowUpRight size={12} />
                    </a>{" "}
                    <a className="text-link" href={`/api/tests?investigation=${encodeURIComponent(s.accession ?? s.investigation)}&format=csv&limit=3000`}>
                      CSV
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="fine-print">
          Files and SHA-256 checksums: <code>data/psi/manifest.json</code>. Re-download and verify against NASA with <code>node scripts/fetch-psi.mjs</code>; rebuild with{" "}
          <code>node scripts/build-tests.mjs</code>. FLEX-2 lists a planned test matrix rather than individual tests and is kept separately.
        </p>
      </section>
      <section className="panel nasa-quirks" aria-labelledby="nq-title">
        <span className="eyebrow">DATA QUALITY</span>
        <h2 id="nq-title">{meta.counts.quirks} problems found in NASA&apos;s tables, affecting {meta.counts.quirkCells} cells</h2>
        <p className="map-lead">
          We flag these instead of fixing them silently. Each record keeps the original cell, so anyone can check our reading.
        </p>
        <ul className="quirk-list">
          {meta.quirks.map((q, i) => (
            <li key={i}>
              <b>{q.accession ?? "—"}</b> · <code>{q.field}</code>: {q.note}.{" "}
              <span className="quirk-action">Our reading: {q.action}.</span>
              {q.testCount > 0 && <span className="quirk-tests"> {q.testCount} test{q.testCount > 1 ? "s" : ""}{q.testCount <= 12 ? `: ${q.tests.join(", ")}` : ""}.</span>}
              {q.examples.length > 0 && <span className="quirk-tests"> As written: “{q.examples.slice(0, 2).join("”, “")}”.</span>}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
