"use client";
import { ArrowUpRight } from "lucide-react";
import {
  oxygenCoverage,
  awaitingExtraction,
  outsideCollection,
  habitatLines,
} from "@/lib/coverage";
import { sourceFor } from "@/lib/evidence";

export default function OxygenCoverage() {
  const x = (pct: number) => 190 + (pct / 100) * 370;
  const rowHeight = (c: (typeof oxygenCoverage)[number]) => (c.points ? 76 : 46);
  const top = 58;
  const rowTop = oxygenCoverage.map((_, i) =>
    oxygenCoverage.slice(0, i).reduce((n, c) => n + rowHeight(c), top),
  );
  const h = rowTop.at(-1)! + rowHeight(oxygenCoverage.at(-1)!) + 34;
  return (
    <section className="panel oxygen-coverage" aria-labelledby="cov-title">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">EVIDENCE COVERAGE</span>
          <h2 id="cov-title">Which oxygen levels have measured fire data?</h2>
        </div>
      </div>
      <ul className="coverage-legend" aria-label="Legend">
        <li><i className="lg measured" /> Measured test conditions in this atlas</li>
        <li><i className="lg limit" /> Apparatus limit (what it can supply, not a test)</li>
        <li><i className="lg habitat" /> Crew atmosphere for comparison</li>
      </ul>
      <svg
        className="coverage-svg"
        viewBox={`0 0 580 ${h}`}
        role="img"
        aria-label="Oxygen coverage. Measured: BASS-II solid PMMA runs from 16.8 to 22.2 percent; Saffire tests on fabric and PMMA at 22.0, 26.2, 28.8, 30.3 and 31.0 percent. Apparatus limits: droplet apparatus up to 40 percent, CFI-G burner supply up to 85 percent. Comparison lines: Earth air 20.9, Moon base scenario 30, spacesuit 100 percent."
      >
        {[0, 20, 40, 60, 80, 100].map((t) => (
          <g key={t}>
            <line x1={x(t)} y1="36" x2={x(t)} y2={h - 26} stroke="var(--line)" strokeDasharray="3 4" />
            <text x={x(t)} y={h - 10} textAnchor="middle">{t}%</text>
          </g>
        ))}
        {habitatLines.map((l, i) => (
          <g key={l.name}>
            <line x1={x(l.pct)} y1="32" x2={x(l.pct)} y2={h - 26} stroke="var(--green)" strokeWidth="1.5" />
            <text
              x={x(l.pct) + (l.pct === 100 ? -4 : 4)}
              y={12 + (i % 2) * 13}
              textAnchor={l.pct === 100 ? "end" : "start"}
              className="habitat-label"
            >
              {l.name}
            </text>
          </g>
        ))}
        {oxygenCoverage.map((c, i) => {
          const y = rowTop[i];
          return (
            <g key={c.name}>
              <text x="0" y={y + 9} className="row-label">{c.name}</text>
              <text x="0" y={y + 23} className="row-fuel">{c.fuel}</text>
              {c.points ? (
                <g>
                  <line x1={x(c.min ?? 0)} y1={y + 9} x2={x(c.max)} y2={y + 9} stroke="var(--orange)" strokeOpacity="0.45" strokeWidth="2" />
                  {[...c.points]
                    .sort((a, b) => b.pct - a.pct)
                    .map((p, j) => {
                      const ly = y - 6 + j * 13;
                      const lx = x(48);
                      return (
                        <g key={p.id}>
                          <polyline
                            points={`${x(p.pct)},${y + 9} ${x(p.pct)},${ly - 3} ${lx - 4},${ly - 3}`}
                            fill="none"
                            stroke="var(--muted)"
                            strokeOpacity="0.5"
                            strokeWidth="0.8"
                          />
                          <circle cx={x(p.pct)} cy={y + 9} r="4.5" fill="var(--orange)">
                            <title>{p.label}</title>
                          </circle>
                          <text x={lx} y={ly} className="pt-label">
                            {p.id} · {p.pct}% · {p.label.split(", ")[0].replace(/^\S+ /, "")} · {p.label.split(", ")[1]}
                          </text>
                        </g>
                      );
                    })}
                </g>
              ) : c.min === null ? (
                <g>
                  <line x1={x(c.max) - 40} y1={y + 9} x2={x(c.max)} y2={y + 9} stroke="var(--orange)" strokeWidth="1.5" strokeDasharray="4 3" />
                  <path d={`M${x(c.max)} ${y} l7 9 l-7 9 l-7 -9 z`} fill="none" stroke="var(--orange)" strokeWidth="1.5">
                    <title>{`${c.name}: up to ${c.max}% (${c.note})`}</title>
                  </path>
                  <text x={x(c.max) - 46} y={y + 13} textAnchor="end">up to {c.max}%</text>
                </g>
              ) : (
                <rect
                  x={x(c.min)}
                  y={y}
                  width={Math.max(4, x(c.max) - x(c.min))}
                  height="18"
                  rx="4"
                  fill={c.kind === "measured" ? "var(--orange)" : "transparent"}
                  stroke="var(--orange)"
                  strokeWidth="1.5"
                  strokeDasharray={c.kind === "measured" ? undefined : "4 3"}
                >
                  <title>{`${c.name}: ${c.min}–${c.max}% (${c.note})`}</title>
                </rect>
              )}
            </g>
          );
        })}
      </svg>
      <div className="coverage-lists">
        <div>
          <h3>On the chart</h3>
          <ul className="coverage-notes">
            {oxygenCoverage.map((c) => {
              const s = sourceFor(c.source)!;
              return (
                <li key={c.name}>
                  <b>{c.name}</b> · {c.fuel} · {c.kind === "measured" ? "measured" : "apparatus limit"}:{" "}
                  {c.points
                    ? c.points.map((p) => p.label.replace(/^\S+ /, `${p.id}: `) + ` (${p.pct}%)`).join("; ")
                    : `${c.min === null ? "up to " + c.max : c.min + "–" + c.max}%`}
                  . {c.note}.{" "}
                  <a href={s.url} target="_blank" rel="noreferrer">
                    source <ArrowUpRight size={12} />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h3>Published, values not yet extracted</h3>
          <ul className="coverage-notes">
            {awaitingExtraction.map((a) => <li key={a}>{a}</li>)}
          </ul>
          <h3>Outside this collection</h3>
          <ul className="coverage-notes">
            {outsideCollection.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      </div>
      <p className="fine-print">
        An empty region means this atlas holds no measured record there, not that
        nobody has tested it. The closest measured solid-material fires to a Moon
        base scenario are Saffire VI-2 to VI-4 (28.8–31.0% O₂), but at 54–55 kPa,
        20 cm/s forced flow and in microgravity, not lunar gravity.
      </p>
    </section>
  );
}
