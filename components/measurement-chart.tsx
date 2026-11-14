"use client";
import { useMemo, useState } from "react";
import data from "@/data/measurements.json";
import { ArrowUpRight, Download } from "lucide-react";
import { download } from "@/lib/export";

type Run = (typeof data.series)[number];

// Sequential by sample thickness; legible on the dark surface.
export const thicknessColors: Record<number, string> = {
  1: "#ffd166",
  2: "#f9a03f",
  3: "#ef6f4c",
  4: "#d9577f",
  5: "#a77bd6",
};
const thicknesses = [1, 2, 3, 4, 5];
const X_MAX = 24;
const Y_MAX = 0.16;
const pointCount = data.series.reduce((n, s) => n + s.points.length, 0);

export default function MeasurementChart({
  expanded = false,
}: {
  expanded?: boolean;
}) {
  const [selected, setSelected] = useState<{
    test: string;
    index: number;
  } | null>(null);
  const [shown, setShown] = useState<number[]>(thicknesses);
  const [width, setWidth] = useState("all");
  const [sides, setSides] = useState("all");
  const x = (n: number) => 55 + (n / X_MAX) * 490;
  const y = (n: number) => 190 - (n / Y_MAX) * 170;
  const runs = useMemo(
    () =>
      data.series.filter(
        (s) =>
          shown.includes(s.thicknessMm) &&
          (width === "all" || String(s.widthCm) === width) &&
          (sides === "all" || String(s.sidesBurning) === sides),
      ),
    [shown, width, sides],
  );
  const selectedRun: Run | undefined = data.series.find(
    (s) => s.testId === selected?.test,
  );
  const selectedPoint = selectedRun?.points[selected!.index];
  const csv =
    "testId,pointOrder,airflowCms,spreadRateMms,thicknessMm,widthCm,sidesBurning,initialOxygenVolPct,finalOxygenVolPct,burnTimeMin,sourceUrl\n" +
    data.series
      .flatMap((s) =>
        s.points.map(
          (p, i) =>
            `${s.testId},${i + 1},${p.airflowCms},${p.spreadRateMms},${s.thicknessMm},${s.widthCm},${s.sidesBurning},${s.initialOxygenVolPct},${s.finalOxygenVolPct},${s.burnTimeMin},${data.sourceUrl}`,
        ),
      )
      .join("\n");
  const pick = (test: string, index: number) => setSelected({ test, index });
  return (
    <section className={"panel measurement " + (expanded ? "expanded" : "")}>
      <div className="panel-heading">
        <div>
          <span className="eyebrow">BASS-II MEASUREMENTS</span>
          <h3>Flame spread varied as airflow and oxygen changed</h3>
        </div>
        <button
          className="icon-button"
          title="Download measured data"
          aria-label="Download measured data CSV"
          onClick={() => download("bass-ii-measurements.csv", csv, "text/csv")}
        >
          <Download size={17} />
        </button>
      </div>
      <div className="run-examples" role="group" aria-label="Example runs">
        <span>Example runs:</span>
        <button
          className={selected?.test === "M3" ? "active" : ""}
          aria-pressed={selected?.test === "M3"}
          onClick={() => {
            setShown(thicknesses);
            setWidth("all");
            setSides("all");
            pick("M3", 0);
          }}
        >
          M3 · airflow rose, spread fell
        </button>
        <button
          className={selected?.test === "M7" ? "active" : ""}
          aria-pressed={selected?.test === "M7"}
          onClick={() => {
            setShown(thicknesses);
            setWidth("all");
            setSides("all");
            pick("M7", 0);
          }}
        >
          M7 · airflow and spread fell together
        </button>
      </div>
      <div className="chart-legends" aria-label="Sample thickness">
        {thicknesses.map((t) => (
          <button
            key={t}
            className={!shown.includes(t) ? "muted" : ""}
            aria-pressed={shown.includes(t)}
            onClick={() =>
              setShown((v) =>
                v.includes(t) ? v.filter((n) => n !== t) : [...v, t],
              )
            }
          >
            <i style={{ background: thicknessColors[t] }} />
            {t} mm
          </button>
        ))}
        <span className="tag green">Measured</span>
      </div>
      <div className="chart-filters">
        <label>
          Width
          <select value={width} onChange={(e) => setWidth(e.target.value)}>
            <option value="all">All</option>
            <option value="1.2">1.2 cm</option>
            <option value="2.2">2.2 cm</option>
          </select>
        </label>
        <label>
          Burning
          <select value={sides} onChange={(e) => setSides(e.target.value)}>
            <option value="all">Both</option>
            <option value="2">Two sides</option>
            <option value="1">One side</option>
          </select>
        </label>
        <span className="chart-key">
          <svg width="12" height="12" aria-hidden="true">
            <circle cx="6" cy="6" r="4.5" fill="currentColor" />
          </svg>
          two sides
          <svg width="12" height="12" aria-hidden="true">
            <circle
              cx="6"
              cy="6"
              r="4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          one side
        </span>
      </div>
      <svg
        className="measurement-svg"
        viewBox="0 0 580 236"
        role="img"
        aria-label={`BASS-II observed flame-spread rates versus airflow for ${runs.length} of ${data.series.length} runs, 0.012 to 0.144 millimeters per second. Oxygen changed during each run.`}
      >
        <text x="14" y="14" className="axis-label">
          Spread rate · mm/s
        </text>
        {[0, 0.04, 0.08, 0.12, 0.16].map((t) => (
          <g key={t}>
            <line
              x1="55"
              y1={y(t)}
              x2="550"
              y2={y(t)}
              stroke="var(--line)"
              strokeDasharray="3 4"
            />
            <text x="41" y={y(t) + 4} textAnchor="end">
              {t.toFixed(2)}
            </text>
          </g>
        ))}
        {[0, 4, 8, 12, 16, 20, 24].map((t) => (
          <text key={t} x={x(t)} y="213" textAnchor="middle">
            {t}
          </text>
        ))}
        <text x="550" y="234" textAnchor="end" className="axis-label">
          Airflow · cm/s
        </text>
        {runs.map((s) => {
          const color = thicknessColors[s.thicknessMm];
          const active = selected?.test === s.testId;
          const dim = selected && !active;
          return (
            <g key={s.testId} opacity={dim ? 0.35 : 1}>
              {s.points.length > 1 && (
                <polyline
                  points={s.points
                    .map((p) => `${x(p.airflowCms)},${y(p.spreadRateMms)}`)
                    .join(" ")}
                  fill="none"
                  stroke={color}
                  strokeWidth={active ? 2.2 : 1}
                  strokeOpacity={active ? 0.95 : 0.45}
                  pointerEvents="none"
                />
              )}
              {s.points.map((p, i) => {
                const isSel = active && selected!.index === i;
                return (
                  <g key={i}>
                    <circle
                      cx={x(p.airflowCms)}
                      cy={y(p.spreadRateMms)}
                      r="11"
                      fill="transparent"
                      tabIndex={0}
                      role="button"
                      aria-label={`${s.testId}, point ${i + 1}: ${p.airflowCms} centimeters per second, ${p.spreadRateMms} millimeters per second, ${s.thicknessMm} millimeter, ${s.sidesBurning === 1 ? "one side" : "two sides"} burning`}
                      onMouseEnter={() => pick(s.testId, i)}
                      onFocus={() => pick(s.testId, i)}
                      onClick={() => pick(s.testId, i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") pick(s.testId, i);
                      }}
                    />
                    <circle
                      cx={x(p.airflowCms)}
                      cy={y(p.spreadRateMms)}
                      r={isSel ? 6 : 4.2}
                      fill={s.sidesBurning === 2 ? color : "var(--surface)"}
                      stroke={color}
                      strokeWidth={s.sidesBurning === 2 ? 0 : 2}
                      pointerEvents="none"
                    />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <div className="chart-detail" aria-live="polite">
        {selectedRun && selectedPoint ? (
          <>
            <b>
              {selectedRun.testId} · point {selected!.index + 1} of{" "}
              {selectedRun.points.length}
            </b>
            <span>
              {selectedPoint.airflowCms} cm/s airflow ·{" "}
              {selectedRun.thicknessMm} mm × {selectedRun.widthCm} cm ·{" "}
              {selectedRun.sidesBurning === 1 ? "one side" : "two sides"} · O₂{" "}
              {selectedRun.initialOxygenVolPct} → {selectedRun.finalOxygenVolPct}%
              (run start → end, not per point) over {selectedRun.burnTimeMin} min
            </span>
            <strong>{selectedPoint.spreadRateMms} mm/s spread</strong>
            <span className="run-sequence">
              Recorded order: airflow{" "}
              {selectedRun.points.map((p) => p.airflowCms).join(" → ")} cm/s; spread{" "}
              {selectedRun.points.map((p) => p.spreadRateMms).join(" → ")} mm/s.
            </span>
          </>
        ) : (
          <span>Hover or focus a point to inspect a run.</span>
        )}
      </div>
      <div className="chart-source">
        <p>
          {pointCount} published observations from {data.series.length} runs ·
          BASS-II · Table 5.1, p. 57.
          <br />
          Lines join each run&apos;s points in recorded order. Oxygen fell during
          every run, and runs differ in thickness, width and sides burning, so
          points do not isolate airflow effects.
        </p>
        <a
          href={data.sourceUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open BASS-II NASA report"
        >
          <ArrowUpRight size={18} />
        </a>
      </div>
      {expanded && (
        <>
          <div className="table-wrap">
            <table>
              <caption>Published observations and run conditions</caption>
              <thead>
                <tr>
                  <th>Run</th>
                  <th>Point</th>
                  <th>Sample</th>
                  <th>Sides</th>
                  <th>Airflow</th>
                  <th>Spread</th>
                  <th>O₂ start → end</th>
                </tr>
              </thead>
              <tbody>
                {data.series.flatMap((s) =>
                  s.points.map((p, i) => (
                    <tr key={s.testId + i}>
                      <td>{s.testId}</td>
                      <td>
                        {i + 1}/{s.points.length}
                      </td>
                      <td>
                        {s.thicknessMm} mm × {s.widthCm} cm
                      </td>
                      <td>{s.sidesBurning}</td>
                      <td>{p.airflowCms} cm/s</td>
                      <td>{p.spreadRateMms} mm/s</td>
                      <td>
                        {s.initialOxygenVolPct} → {s.finalOxygenVolPct}%
                      </td>
                    </tr>
                  )),
                )}
                {data.notTracked.map((s) => (
                  <tr key={s.testId} className="muted">
                    <td>{s.testId}</td>
                    <td>—</td>
                    <td>
                      {s.thicknessMm} mm × {s.widthCm} cm
                    </td>
                    <td>{s.sidesBurning}</td>
                    <td>{s.airflowCms.join(", ")} cm/s</td>
                    <td colSpan={2}>Not tracked in the source table</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="fine-print">
            {data.measurementType}. Opposed flow; clear cast PMMA. Values are
            shown with the precision printed in the report.{" "}
            {data.verification}
          </p>
        </>
      )}
    </section>
  );
}
