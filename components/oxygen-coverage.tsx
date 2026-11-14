"use client";
import { ArrowUpRight } from "lucide-react";
import { oxygenCoverage, coverageUnknown, habitatLines } from "@/lib/coverage";
import { sourceFor } from "@/lib/evidence";

export default function OxygenCoverage() {
  const x = (pct: number) => 150 + (pct / 100) * 410;
  const rowH = 34;
  const h = 52 + oxygenCoverage.length * rowH + 30;
  return (
    <section className="panel oxygen-coverage">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">THE DATA GAP</span>
          <h2>Tested oxygen levels vs crew atmospheres</h2>
        </div>
      </div>
      <p>
        Solid bars are oxygen levels actually measured in tests. Dashed bars
        are what an apparatus can provide, which is not the same as tested.
        Only ranges with a published source are drawn.
      </p>
      <svg
        className="coverage-svg"
        viewBox={`0 0 580 ${h}`}
        role="img"
        aria-label="Oxygen coverage: BASS-II tested 16.8 to 22.2 percent; MDCA apparatus up to 40 percent; CFI-G burner flow up to 85 percent. Moon base at 30 percent or more and spacesuits at 100 percent lie outside tested solid-material data."
      >
        {[0, 20, 40, 60, 80, 100].map((t) => (
          <g key={t}>
            <line x1={x(t)} y1="24" x2={x(t)} y2={h - 26} stroke="var(--line)" strokeDasharray="3 4" />
            <text x={x(t)} y={h - 10} textAnchor="middle">{t}%</text>
          </g>
        ))}
        {habitatLines.map((l, i) => (
          <g key={l.name}>
            <line x1={x(l.pct)} y1="20" x2={x(l.pct)} y2={h - 26} stroke="var(--green)" strokeWidth="1.5" />
            <text
              x={x(l.pct) + (l.pct === 100 ? -4 : 4)}
              y={12 + (i % 2) * 12}
              textAnchor={l.pct === 100 ? "end" : "start"}
              className="habitat-label"
            >
              {l.name}
            </text>
          </g>
        ))}
        {oxygenCoverage.map((c, i) => {
          const y = 52 + i * rowH;
                    return (
            <g key={c.name}>
              <text x="0" y={y + 13} className="row-label">
                {c.name.length > 26 ? c.name.slice(0, 25) + "…" : c.name}
              </text>
              {c.min === null ? (
                <g>
                  <line x1={x(c.max) - 40} y1={y + 9} x2={x(c.max)} y2={y + 9} stroke="var(--orange)" strokeWidth="1.5" strokeDasharray="4 3" />
                  <path d={`M${x(c.max)} ${y} l7 9 l-7 9 l-7 -9 z`} fill="var(--orange)">
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
                  fill={c.kind === "tested" ? "var(--orange)" : "transparent"}
                  stroke="var(--orange)"
                  strokeWidth="1.5"
                  strokeDasharray={c.kind === "tested" ? undefined : "4 3"}
                >
                  <title>{`${c.name}: ${c.min}–${c.max}% (${c.note})`}</title>
                </rect>
              )}
            </g>
          );
        })}
      </svg>
      <ul className="coverage-notes">
        {oxygenCoverage.map((c) => {
          const s = sourceFor(c.source)!;
          return (
            <li key={c.name}>
              <b>{c.name}:</b> {c.min === null ? `up to ${c.max}` : `${c.min}–${c.max}`}% · {c.note}{" "}
              <a href={s.url} target="_blank" rel="noreferrer">
                source <ArrowUpRight size={12} />
              </a>
            </li>
          );
        })}
        <li>
          <b>No sourced oxygen range here yet:</b> {coverageUnknown.join(", ")}.
          Saffire&apos;s later campaigns used elevated oxygen and reduced
          pressure, but this demo has not extracted their values.
        </li>
      </ul>
      <p className="fine-print">
        The only tested solid-material data shown sit near Earth air. A Moon
        base at 30% or more oxygen is outside them, so these results cannot
        stand in for lunar habitat flammability.
      </p>
    </section>
  );
}
