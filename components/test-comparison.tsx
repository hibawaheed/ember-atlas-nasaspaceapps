"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Scenario } from "@/lib/scenario";
import { presets } from "@/lib/scenario";
import { saffireTests, tableLink } from "@/lib/saffire";
import { nearestTests, fuelClassOf, fuelClassName, sourceLink, testName, testsAtAtmosphere, type TestRecord } from "@/lib/nearest";

const statusLabel = { same: "Matches", close: "Close", differs: "Differs", unknown: "Not listed" };

const isLunar = (s: Scenario) => JSON.stringify(s) === JSON.stringify(presets.lunar.scenario);

function Measured({ t }: { t: TestRecord }) {
  const sf = !t.a ? saffireTests.find((x) => x.id === t.t) : null;
  if (sf)
    return (
      <p className="small-note">
        Measured in {sf.id} (Table 2): burn {sf.burnDurationS} s
        {sf.peakHeatReleaseW ? `, peak heat release ${sf.peakHeatReleaseW} W` : ""}, CO₂ +{sf.co2IncreasePpm} ppm and CO +{sf.coIncreasePpm} ppm at the far-field unit.
      </p>
    );
  return (
    <p className="small-note">
      {t.inv} test {t.t}
      {t.d ? ` (${t.d})` : ""}: {t.f}, {t.o2}% oxygen{t.p != null ? ` at ${t.p} kPa` : ""}
      {t.v != null ? `, ${t.v} cm/s` : ""}. Outcome as NASA lists it: {t.o ?? "not listed"}.
    </p>
  );
}

/**
 * Compares a scenario with the nearest measured NASA tests from every imported
 * table, within one fuel class at a time, and links each test's NASA record.
 */
export default function TestComparison({
  scenario,
  title,
  onOpenLab,
}: {
  scenario: Scenario;
  title?: string;
  onOpenLab?: () => void;
}) {
  const [cls, setCls] = useState<TestRecord["c"]>(fuelClassOf(scenario));
  const [pick, setPick] = useState(0);
  useEffect(() => {
    setCls(fuelClassOf(scenario));
    setPick(0);
  }, [scenario.fuel]); // eslint-disable-line react-hooks/exhaustive-deps
  const ranked = nearestTests(scenario, cls);
  const chosen = ranked[Math.min(pick, ranked.length - 1)];
  const t = chosen.test;
  const lunar = isLunar(scenario);
  const label = title ?? (lunar ? "Lunar habitat (challenge scenario)" : "Your lab scenario");
  const exact = testsAtAtmosphere(scenario);
  const link = sourceLink(t);

  return (
    <section className="panel test-compare" aria-labelledby="tc-title">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">CLOSEST MEASURED NASA TEST</span>
          <h2 id="tc-title">
            {label} vs {testName(t)}
          </h2>
        </div>
        <div className="tc-classes" role="group" aria-label="Fuel type">
          {(["solid", "droplet"] as const).map((c) => (
            <button key={c} aria-pressed={cls === c} className={cls === c ? "active" : ""} onClick={() => { setCls(c); setPick(0); }}>
              {fuelClassName[c]}
            </button>
          ))}
        </div>
      </div>
      {exact.length > 0 && (
        <p className="tc-exact">
          NASA ran {exact.length} test{exact.length === 1 ? "" : "s"} within 1 point of {scenario.oxygen}% oxygen and 3 kPa of {scenario.pressure} kPa:{" "}
          {[...new Set(exact.map((x) => x.inv))].join(", ")} ({[...new Set(exact.map((x) => x.f.toLowerCase()))].join(" and ")}), all in microgravity.
        </p>
      )}
      <div className="tc-tabs" role="tablist" aria-label="Nearest tests">
        {ranked.map((r, i) => (
          <button key={r.test.id} role="tab" aria-selected={i === pick} className={i === pick ? "active" : ""} onClick={() => setPick(i)}>
            {r.test.a ? `${r.test.inv} ${r.test.t}` : r.test.t}
          </button>
        ))}
      </div>
      <p className="tc-reason">
        <b>Why this test:</b> {chosen.reason}
      </p>
      <div className="tc-rows" role="table" aria-label={`${label} compared with ${testName(t)}`}>
        <div className="tc-row tc-head" role="row">
          <span role="columnheader">Condition</span>
          <span role="columnheader">{lunar ? "Challenge scenario" : "Scenario"}</span>
          <span role="columnheader">{testName(t)} (measured)</span>
          <span role="columnheader">Comparison</span>
        </div>
        {chosen.rows.map((r) => (
          <div className="tc-row" role="row" key={r.condition}>
            <span role="rowheader" className="tc-cond">{r.condition}</span>
            <span role="cell" data-label={lunar ? "Scenario" : "Scenario"}>{r.scenario}</span>
            <span role="cell" data-label="NASA test">{r.test}</span>
            <span role="cell" data-label="Comparison">
              <span className={"tc-status " + r.status}>{statusLabel[r.status]}</span> <small>{r.note}</small>
            </span>
          </div>
        ))}
      </div>
      <Measured t={t} />
      <div className="tc-actions">
        <a className="button secondary" href={link.href} target="_blank" rel="noreferrer">
          {link.label} <ArrowUpRight size={14} />
        </a>
        {!t.a && (
          <a className="button secondary" href={tableLink(6)} target="_blank" rel="noreferrer">
            Table 2 results (p. 6) <ArrowUpRight size={14} />
          </a>
        )}
        <a className="text-link" href={`/api/tests?investigation=${encodeURIComponent(t.a ?? "Saffire")}&format=csv`}>
          Download this investigation&apos;s tests (CSV)
        </a>
        {onOpenLab && (
          <button className="text-link" onClick={onOpenLab}>
            Change one condition in the lab
          </button>
        )}
      </div>
      <p className="fine-print">
        {lunar ? "The 30% oxygen, 70.3 kPa lunar habitat is a scenario from the challenge statement. " : ""}
        Searched every imported NASA test that records chamber oxygen: the PSI experimental tables plus Saffire IV–VI from ICES-2024-365. Order: material, then oxygen, then pressure, then flow. Every test is from microgravity; none was run at lunar gravity.
      </p>
    </section>
  );
}
