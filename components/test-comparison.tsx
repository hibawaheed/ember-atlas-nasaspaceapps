"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Scenario } from "@/lib/scenario";
import { presets } from "@/lib/scenario";
import { closestTests, saffireSource, tableLink } from "@/lib/saffire";

const statusLabel = { same: "Matches", close: "Close", differs: "Differs" };

function isLunarPreset(s: Scenario) {
  return JSON.stringify(s) === JSON.stringify(presets.lunar.scenario);
}

/**
 * Compares a scenario with the closest measured NASA tests (Saffire IV–VI,
 * Table 1), condition by condition, and links the source tables.
 */
export default function TestComparison({
  scenario,
  compact = false,
  onOpenLab,
}: {
  scenario: Scenario;
  compact?: boolean;
  onOpenLab?: () => void;
}) {
  const ranked = closestTests(scenario);
  const [pick, setPick] = useState(0);
  const chosen = ranked[Math.min(pick, ranked.length - 1)];
  const t = chosen.test;
  const lunar = isLunarPreset(scenario);
  const scenarioLabel = lunar ? "Lunar habitat (challenge scenario)" : "Your lab scenario";
  const differs = chosen.rows
    .filter((r) => r.status === "differs" && r.condition !== "Material")
    .map((r) => r.condition.replace("Total pressure", "pressure").replace("Oxygen fraction", "oxygen fraction").toLowerCase());
  const resultText = `Saffire ${t.id} burned ${t.materialDetail} at ${t.oxygenPct}% oxygen${
    chosen.rows[1].status !== "differs" ? ", close to this scenario" : ""
  }. ${
    differs.length
      ? `Its different ${differs.length > 1 ? differs.slice(0, -1).join(", ") + " and " + differs.at(-1) : differs[0]} limit what the test establishes for ${lunar ? "a lunar habitat" : "this scenario"}.`
      : "Its tabulated conditions are close to this scenario."
  }`;

  if (compact)
    return (
      <div className="test-compare compact" aria-live="polite">
        <p className="eyebrow">CLOSEST MEASURED NASA TEST</p>
        <h3>
          Saffire {t.id} · {t.material}
        </h3>
        <p className="tc-values">
          {t.oxygenPct}% O₂ · {t.pressureKpa} kPa · {t.airflowCms} cm/s · microgravity
        </p>
        <p className="tc-reason">{chosen.reason}</p>
        <a className="text-link" href={tableLink(3)} target="_blank" rel="noreferrer">
          Source: NASA ICES-2024-365, Table 1 <ArrowUpRight size={13} />
        </a>
      </div>
    );

  return (
    <section className="panel test-compare" aria-labelledby="tc-title">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">CLOSEST MEASURED NASA TEST</span>
          <h2 id="tc-title">
            {scenarioLabel} vs Saffire {t.id}
          </h2>
        </div>
        <div className="tc-tabs" role="tablist" aria-label="Measured tests">
          {ranked.slice(0, 3).map((r, i) => (
            <button
              key={r.test.id}
              role="tab"
              aria-selected={i === pick}
              className={i === pick ? "active" : ""}
              onClick={() => setPick(i)}
            >
              {r.test.id}
            </button>
          ))}
        </div>
      </div>
      <p className="tc-reason">
        <b>Why this test:</b> {chosen.reason}
      </p>
      <div className="table-wrap">
        <table>
          <caption>
            {scenarioLabel} compared with Saffire {t.id} ({t.flight}). Test
            conditions from Table 1 of NASA ICES-2024-365.
          </caption>
          <thead>
            <tr>
              <th>Condition</th>
              <th>{lunar ? "Challenge scenario" : "Lab scenario"}</th>
              <th>Saffire {t.id} (measured)</th>
              <th>Comparison</th>
            </tr>
          </thead>
          <tbody>
            {chosen.rows.map((r) => (
              <tr key={r.condition}>
                <th>{r.condition}</th>
                <td>{r.scenario}</td>
                <td>{r.test}</td>
                <td>
                  <span className={"tc-status " + r.status}>{statusLabel[r.status]}</span>{" "}
                  <small>{r.note}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="tc-result">{resultText}</p>
      <p className="small-note">
        Measured in {t.id} (Table 2): burn {t.burnDurationS} s
        {t.peakHeatReleaseW ? `, peak heat release ${t.peakHeatReleaseW} W` : ""}
        {t.averageHeatReleaseW ? `, average heat release ${t.averageHeatReleaseW} W` : ""}, CO₂ +
        {t.co2IncreasePpm} ppm and CO +{t.coIncreasePpm} ppm at the far-field unit.
        {t.note ? ` ${t.note}` : ""}
      </p>
      <div className="tc-actions">
        <a className="button secondary" href={tableLink(3)} target="_blank" rel="noreferrer">
          Open Table 1 (PDF p. 3) <ArrowUpRight size={14} />
        </a>
        <a className="button secondary" href={tableLink(6)} target="_blank" rel="noreferrer">
          Table 2 results (p. 6) <ArrowUpRight size={14} />
        </a>
        <a className="text-link" href={saffireSource.citationUrl} target="_blank" rel="noreferrer">
          NTRS record <ArrowUpRight size={13} />
        </a>
        {onOpenLab && (
          <button className="text-link" onClick={onOpenLab}>
            Change one condition in the lab
          </button>
        )}
      </div>
      <p className="fine-print">
        {lunar
          ? "The 30% oxygen, 70.3 kPa lunar habitat is a scenario from the challenge statement, not a measured test. "
          : ""}
        Saffire tests were microgravity fires in an uncrewed Cygnus spacecraft; no
        measured lunar-gravity test is in the atlas. Values checked against the
        original NASA PDF (SHA-256 recorded).
      </p>
    </section>
  );
}
