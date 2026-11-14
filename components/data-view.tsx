"use client";
import { useRef, useState } from "react";
import {
  Upload,
  Download,
  ArrowUpRight,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";
import MeasurementChart from "./measurement-chart";
import { bassVariation } from "@/lib/variation";
import { nasaLinks } from "@/lib/links";
import { download } from "@/lib/export";
import type { ImportedDataset } from "@/lib/import";
export default function DataView() {
  const file = useRef<HTMLInputElement>(null);
  const [imported, setImported] = useState<ImportedDataset | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function load(f?: File) {
    if (!f) return;
    setError("");
    if (f.size > 950000) {
      setError("Choose a file smaller than 950 KB.");
      return;
    }
    setLoading(true);
    try {
      const text = await f.text();
      const body = f.name.toLowerCase().endsWith(".csv")
        ? { label: f.name, csv: text }
        : JSON.parse(text);
      const r = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      setImported(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setLoading(false);
      if (file.current) file.current.value = "";
    }
  }
  return (
    <div className="view-enter">
      <div className="section-intro">
        <div>
          <span className="eyebrow">BASS-II / PUBLISHED DATA</span>
          <h1>Published measurements</h1>
          <p>A carefully scoped window into NASA’s BASS-II results.</p>
        </div>
        <button
          className="button secondary"
          onClick={() => file.current?.click()}
          disabled={loading}
        >
          <Upload size={16} />
          {loading ? "Validating…" : "Import measurements"}
        </button>
        <input
          className="sr-only"
          ref={file}
          type="file"
          accept=".csv,.json"
          aria-label="Import measurement file"
          onChange={(e) => load(e.target.files?.[0])}
        />
      </div>
      <MeasurementChart expanded />
      <section className="panel bass-variation">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">WITHIN ONE INVESTIGATION</span>
            <h2>BASS-II: what varied and what stayed the same</h2>
          </div>
        </div>
        <div className="varied-grid">
          <div>
            <b>Varied between or within runs</b>
            {bassVariation.varied.map((v) => (
              <p key={v.label}>
                {v.label}: <strong>{v.value}</strong>
              </p>
            ))}
          </div>
          <div>
            <b>Held the same</b>
            {bassVariation.constant.map((v) => (
              <p key={v.label}>
                {v.label}: <strong>{v.value}</strong>
              </p>
            ))}
          </div>
        </div>
        <p className="fine-print">
          Several conditions changed at once, so no single variable&apos;s
          effect can be isolated from these runs. Computed from Table 5.1 of
          NASA/TM-20210011385.
        </p>
      </section>
      <div className="data-bottom">
        <section className="panel">
          <FileSpreadsheet size={24} />
          <h3>Import a dataset</h3>
          <p>
            Import CSV or JSON with test identifiers, airflow in cm/s,
            flame-spread rate in mm/s, and a source URL. Imported data is kept
            in this session and never mixed into verified NASA evidence.
          </p>
          <a className="text-link" href="/import-template.csv" download>
            Download the CSV template <Download size={15} />
          </a>
          <p className="fine-print">
            The template contains one synthetic example row. Replace it with
            documented measurements. Maximum 1,000 rows; 950 KB.
          </p>
        </section>
        <section className="panel">
          <span className="eyebrow">READY FOR THE ARCHIVE</span>
          <h3>Original experiment archives</h3>
          <p>
            Go deeper with the original experiment files and metadata in NASA’s
            Physical Sciences Informatics repository.
          </p>
          <a
            className="archive-link"
            href="https://psi.nasa.gov/physci/repo/data/investigations/PSI-25"
            target="_blank"
            rel="noreferrer"
          >
            BASS-II · PSI-25 <ArrowUpRight size={17} />
          </a>
          <a
            className="archive-link"
            href="https://psi.nasa.gov/physci/repo/data/investigations/PSI-69"
            target="_blank"
            rel="noreferrer"
          >
            FLEX · PSI-69 <ArrowUpRight size={17} />
          </a>
          <a
            className="archive-link"
            href={nasaLinks.psiCombustion.url}
            target="_blank"
            rel="noreferrer"
          >
            All PSI combustion investigations <ArrowUpRight size={17} />
          </a>
          <a
            className="archive-link"
            href={nasaLinks.glennCombustion.url}
            target="_blank"
            rel="noreferrer"
          >
            Combustion science at NASA Glenn <ArrowUpRight size={17} />
          </a>
        </section>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {imported && (
        <section className="panel imported-data">
          <div className="panel-heading">
            <div>
              <span className="tag orange">User imported · unverified</span>
              <h3>{imported.label}</h3>
            </div>
            <button
              className="button secondary"
              onClick={() =>
                download(
                  "imported-measurements.json",
                  JSON.stringify(imported, null, 2),
                )
              }
            >
              <Download size={16} />
              Export validated JSON
            </button>
          </div>
          <p>
            <CheckCircle2 size={16} /> {imported.rows.length} rows validated.
            Data is held in memory for this session only.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Run</th>
                  <th>Material</th>
                  <th>Airflow · cm/s</th>
                  <th>Spread · mm/s</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {imported.rows.slice(0, 100).map((r, i) => (
                  <tr key={i}>
                    <td>{r.testId}</td>
                    <td>{r.material}</td>
                    <td>{r.airflowCms}</td>
                    <td>{r.spreadRateMms}</td>
                    <td>
                      <a href={r.sourceUrl} target="_blank" rel="noreferrer">
                        Source ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {imported.rows.length > 100 && (
            <p className="fine-print">
              Showing the first 100 rows. Export includes all rows.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
