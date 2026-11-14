"use client";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Download,
  FlaskConical,
  ScanEye,
  ShieldCheck,
  Wind,
  LoaderCircle,
  MessageCircle,
} from "lucide-react";
import {
  destinations,
  investigations,
  hardwareGroups,
  programBackground,
  earthApplications,
  rankInvestigations,
  type MissionQuery,
  type Priority,
} from "@/lib/investigations";
import { sourceFor, findings } from "@/lib/evidence";
const findingTitle = (id: string) => findings.find((f) => f.id === id)?.title ?? id;
import OxygenCoverage from "./oxygen-coverage";
import TestComparison from "./test-comparison";
import MeasuredExample from "./measured-example";
import { baseline, presets, type Scenario } from "@/lib/scenario";
import { nasaLinks } from "@/lib/links";

function profilesCsv() {
  const cols = ["id", "name", "subtitle", "phase", "facility", "hardware", "geometry", "objective", "variables", "measurements", "output", "priorities", "limitation", "sourceUrls"] as const;
  const q = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [
    cols.join(","),
    ...investigations.map((i) =>
      cols
        .map((c) =>
          q(
            c === "priorities"
              ? i.priorities.join("; ")
              : c === "sourceUrls"
                ? i.sources.map((id) => sourceFor(id)?.url ?? id).join(" ")
                : String(i[c]),
          ),
        )
        .join(","),
    ),
  ].join("\n");
}
import { download } from "@/lib/export";
const priorities = [
  {
    id: "prevention",
    label: "Prevent ignition & spread",
    icon: ShieldCheck,
    text: "Materials, atmosphere, and flammability",
  },
  {
    id: "detection",
    label: "Detect a developing fire",
    icon: ScanEye,
    text: "Smoke, particles, and hidden combustion",
  },
  {
    id: "suppression",
    label: "Understand extinction",
    icon: Wind,
    text: "Suppression, flow, and combustion limits",
  },
] as const;
export default function MissionView({
  onExplore,
  onOpenScenario,
}: {
  onExplore: () => void;
  onOpenScenario?: (s: Scenario) => void;
}) {
  const [query, setQuery] = useState<MissionQuery>({
    destination: "orbit",
    priority: "prevention",
  });
  const [results, setResults] = useState<ReturnType<typeof rankInvestigations>>(
    [],
  );
  const [selected, setSelected] = useState(["bass", "flex"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const destination = destinations[query.destination];
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch("/api/investigations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("The investigation service is unavailable.");
        return r.json();
      })
      .then((data) => {
        setResults(data.investigations);
        setLoading(false);
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setError(e.message);
        setLoading(false);
      });
    return () => controller.abort();
  }, [query, retry]);
  const [showAll, setShowAll] = useState(false);
  const compared = investigations.filter((i) => selected.includes(i.id));
  const [explain, setExplain] = useState<{
    key: string;
    loading: boolean;
    data?: {
      mode: string;
      notice?: string;
      similarities?: string;
      differences?: string;
      ranking?: string;
      findingIds?: string[];
    };
  } | null>(null);
  const explainKey = JSON.stringify([selected, query]);
  async function explainComparison() {
    setExplain({ key: explainKey, loading: true });
    try {
      const r = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...query, ids: selected }),
        signal: AbortSignal.timeout(28000),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setExplain({ key: explainKey, loading: false, data });
    } catch {
      setExplain({
        key: explainKey,
        loading: false,
        data: { mode: "unavailable", notice: "AI explanation was unavailable." },
      });
    }
  }
  function toggle(id: string) {
    setSelected((s) =>
      s.includes(id)
        ? s.filter((v) => v !== id)
        : s.length < 3
          ? [...s, id]
          : s,
    );
  }
  return (
    <div className="view-enter mission-view">
      <div className="section-intro">
        <div>
          <span className="eyebrow">THE MISSION DESK</span>
          <h1>Mission research</h1>
          <p>
            Nine experiments ranked, one program for context. Three safety questions. A traceable path through
            the research.
          </p>
        </div>
        <span className="outline-mark">↗</span>
      </div>
      <div className="destination-tabs" aria-label="Habitat destination">
        {Object.entries(destinations).map(([id, d]) => (
          <button
            key={id}
            aria-pressed={query.destination === id}
            className={query.destination === id ? "active" : ""}
            onClick={() =>
              setQuery({
                ...query,
                destination: id as MissionQuery["destination"],
              })
            }
          >
            <span>{d.symbol}</span>
            <b>{d.name}</b>
            <small>{d.gravity}</small>
          </button>
        ))}
      </div>
      <section className="mission-banner">
        <div className="mission-planet" aria-hidden="true">
          {destination.symbol}
        </div>
        <div>
          <span className="eyebrow">
            {destination.name.toUpperCase()} / RESEARCH BRIEFING
          </span>
          <h2>{destination.question}</h2>
          <p>{destination.note}</p>
        </div>
        <a
          href="https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/"
          target="_blank"
          rel="noreferrer"
        >
          Challenge context <ArrowUpRight size={15} />
        </a>
      </section>
      <div className="priority-grid">
        {priorities.map((p) => (
          <button
            key={p.id}
            className={query.priority === p.id ? "active" : ""}
            aria-pressed={query.priority === p.id}
            onClick={() => setQuery({ ...query, priority: p.id as Priority })}
          >
            <p.icon size={22} />
            <span>
              <b>{p.label}</b>
              <small>{p.text}</small>
            </span>
            {query.priority === p.id && <Check size={16} />}
          </button>
        ))}
      </div>
      <MeasuredExample priority={query.priority} />
      <div className="panel-heading mission-results-heading">
        <div>
          <span className="eyebrow">RANKED FOR YOUR QUESTION</span>
          <h2>Where to start reading</h2>
        </div>
        <button
          className="button secondary"
          disabled={loading || !!error}
          onClick={() =>
            download(
              `ember-shortlist-${query.destination}-${query.priority}.json`,
              JSON.stringify(
                {
                  query,
                  exportedAt: new Date().toISOString(),
                  rankingCheckedAt: "2026-11-14",
                  ranking: "Authored relevance rubric, not a risk score",
                  results,
                },
                null,
                2,
              ),
            )
          }
        >
          <Download size={15} /> Download {results.length} ranked experiments (JSON)
        </button>
      </div>
      <details className="ranking-explainer">
        <summary>How is this ranked?</summary>
        <p>
          Each experiment receives 1 point for microgravity context, 4 for
          addressing the selected safety question, 3 when this atlas holds its
          measured data (1 if the data are only background for the question), 2
          for measured tests near the 30% Moon base oxygen scenario on a
          surface habitat, 2 for atmosphere variables on a surface habitat
          (prevention and suppression), and 1 for probing gravity dependence
          (BRE, E-FIELD Flames). Ties are ordered by whether the question is the
          experiment&apos;s primary focus, then measured data, then the number of
          cited findings, and are labeled. Parent programs such as
          ACME are shown as background instead of competing with their own
          experiments; individual measured tests are compared in the panel
          below. These authored weights organize reading; they are not AI
          predictions, safety scores or confidence estimates.
        </p>
      </details>
      {loading ? (
        <div className="mission-loading" role="status">
          <LoaderCircle className="spin" size={22} /> Ranking the investigation
          metadata…
        </div>
      ) : error ? (
        <div role="alert" className="error">
          {error}{" "}
          <button
            className="button secondary"
            onClick={() => setRetry((n) => n + 1)}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="investigation-list">
          {(showAll ? results : results.slice(0, 5)).map((i, index) => (
            <article className="investigation-card" key={i.id}>
              <span className="investigation-rank">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="investigation-main">
                <div className="evidence-top">
                  <span className="eyebrow">
                    {i.phase.toUpperCase()} · {i.facility}
                  </span>
                  <span className="tag">Relevance {i.score}</span>
                </div>
                <h3>
                  {i.name} <span>{i.subtitle}</span>
                  {i.parent && <small className="parent-tag">Part of ACME</small>}
                </h3>
                <p className="reason-line">
                  <b>Why it ranks here:</b> {i.reason}
                </p>
                <p>{i.objective}</p>
                {i.tieNote && <p className="tie-note">{i.tieNote}</p>}
                <details className="score-details">
                  <summary>Scoring details ({i.score} points)</summary>
                  <div className="reason-chips">
                    {i.reasons.map((r) => (
                      <span key={r.label}>
                        +{r.points} {r.label}
                      </span>
                    ))}
                  </div>
                </details>
                <details>
                  <summary>Conditions, measurements & limits</summary>
                  <dl>
                    {[
                      ["Fuel & geometry", i.geometry],
                      ["Shared hardware", i.related],
                      ["Test variables", i.variables],
                      ["Measurements", i.measurements],
                      ["Available here", i.output],
                      ["Scope", i.limitation],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="transfer-note">{i.transfer}</p>
                  <div className="investigation-sources">
                    {i.sources.map((id) => {
                      const s = sourceFor(id)!;
                      return (
                        <a
                          key={id}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {s.title} <ArrowUpRight size={13} />
                        </a>
                      );
                    })}
                  </div>
                </details>
              </div>
              <button
                className={
                  "compare-pick " + (selected.includes(i.id) ? "selected" : "")
                }
                aria-pressed={selected.includes(i.id)}
                disabled={!selected.includes(i.id) && selected.length >= 3}
                onClick={() => toggle(i.id)}
              >
                {selected.includes(i.id) ? (
                  <Check size={15} />
                ) : (
                  <FlaskConical size={15} />
                )}
                {selected.includes(i.id) ? "Selected" : "Compare"}
              </button>
            </article>
          ))}
          {programBackground().map((p) => (
            <aside className="program-background" key={p.id}>
              <span className="eyebrow">PROGRAM BACKGROUND</span>
              <h3>
                {p.name} <span>{p.subtitle}</span>
              </h3>
              <p>
                {p.objective} Its experiments are ranked individually above:{" "}
                {p.children.join(", ")}.
              </p>
            </aside>
          ))}
          {results.length > 5 && (
            <button
              className="button secondary show-all"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
            >
              {showAll ? "Show top 5 only" : `Show all ${results.length} investigations`}
            </button>
          )}
        </div>
      )}
      <section className="panel investigation-comparison">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">SIDE BY SIDE / SELECT UP TO THREE</span>
            <h2>Compare experimental conditions</h2>
          </div>
          <span className="tag">{selected.length} selected</span>
        </div>
        {compared.length ? (
          <div className="table-wrap">
            <table>
              <caption>
                Comparison of selected investigation metadata; not a comparison
                of numerical hazard.
              </caption>
              <thead>
                <tr>
                  <th>Attribute</th>
                  {compared.map((i) => (
                    <th key={i.id}>{i.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["Fuel", "phase"],
                    ["Hardware", "facility"],
                    ["Hardware family", "hardware"],
                    ["Geometry", "geometry"],
                    ["Variables", "variables"],
                    ["Measurements", "measurements"],
                    ["Data in this demo", "output"],
                    ["Limitation", "limitation"],
                  ] as const
                ).map(([label, key]) => (
                  <tr key={key}>
                    <th>{label}</th>
                    {compared.map((i) => (
                      <td key={i.id}>{i[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>
            Choose investigations above to compare their experimental context.
          </p>
        )}
        {compared.length >= 2 && (
          <div className="compare-explain">
            <button
              className="button secondary"
              disabled={explain?.loading}
              onClick={explainComparison}
            >
              {explain?.loading ? (
                <LoaderCircle className="spin" size={15} />
              ) : (
                <MessageCircle size={15} />
              )}{" "}
              Explain this comparison and ranking
            </button>
            {explain && !explain.loading && explain.data && (
              explain.data.mode === "generative" ? (
                <div className="ai-interpretation">
                  <span className="tag">
                    AI explanation · check against the profiles and sources
                    {explain.key !== explainKey ? " · selection changed" : ""}
                  </span>
                  <p><b>What they share.</b> {explain.data.similarities}</p>
                  <p><b>How they differ.</b> {explain.data.differences}</p>
                  <p><b>Why they rank as they do.</b> {explain.data.ranking}</p>
                  {!!explain.data.findingIds?.length && (
                    <p className="fine-print">
                      Findings used:{" "}
                      {explain.data.findingIds
                        .map((id) => findingTitle(id))
                        .join(" · ")}
                    </p>
                  )}
                </div>
              ) : (
                <p className="fine-print">{explain.data.notice ?? "AI explanation is not available."}</p>
              )
            )}
          </div>
        )}
        <div className="comparison-foot">
          <p>
            Matching topics do not make experiments interchangeable. Preserve
            fuel geometry, atmosphere, flow direction, and measurement method.
          </p>
          <button className="text-link" onClick={onExplore}>
            Try the combustion lab <ArrowRight size={16} />
          </button>
        </div>
      </section>
      <TestComparison
        scenario={query.destination === "orbit" ? baseline : presets.lunar.scenario}
        onOpenLab={() =>
          onOpenScenario
            ? onOpenScenario(query.destination === "orbit" ? baseline : presets.lunar.scenario)
            : onExplore()
        }
      />
      <OxygenCoverage />
      <section className="panel controls-groups">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">CONTROLS &amp; EQUIPMENT</span>
            <h2>Which research informs which safety control</h2>
          </div>
          <button
            className="button secondary"
            onClick={() => download("ember-investigation-profiles.csv", profilesCsv(), "text/csv")}
          >
            <Download size={15} /> Download all profiles (CSV)
          </button>
        </div>
        <ul>
          {(
            [
              ["prevention", "Prevention", "Material selection, flammability limits, atmosphere and ventilation"],
              ["detection", "Detection", "Smoke and particle signatures, sensors, false alarms"],
              ["suppression", "Suppression", "Extinguishing agents, extinction limits, extinguisher use"],
            ] as const
          ).map(([key, label, text]) => (
            <li key={key}>
              <b>{label}</b>
              <span>{text}</span>
              <span>
                {investigations
                  .filter((i) => i.priorities.includes(key))
                  .map((i) => i.name)
                  .join(" · ")}
              </span>
            </li>
          ))}
        </ul>
        <p className="fine-print">
          Groupings come from each profile&apos;s curated metadata. The CSV
          holds every profile with its hardware, conditions, measurements,
          limits and source links, ready to load into a spreadsheet or model.
        </p>
      </section>
      <section className="panel hardware-groups">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">SHARED HARDWARE</span>
            <h2>Which experiments used the same equipment</h2>
          </div>
        </div>
        <p>
          Experiments run in the same apparatus are easier to compare, because
          sample holders, flow control and cameras stay the same. Groupings
          follow the challenge statement and NASA investigation pages.
        </p>
        <ul>
          {hardwareGroups().map((g) => (
            <li key={g.hardware}>
              <b>{g.hardware}</b>
              <span>{g.names.join(" · ")}</span>
              <small>{g.note}</small>
            </li>
          ))}
        </ul>
      </section>
      <section className="panel earth-apps">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">BACK ON EARTH</span>
            <h2>Where this research helps fire safety on the ground</h2>
          </div>
        </div>
        <ul>
          {earthApplications.map((a) => {
            const s = sourceFor(a.source)!;
            return (
              <li key={a.title}>
                <b>{a.title}</b>
                <span>{a.text}</span>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.type} <ArrowUpRight size={13} />
                </a>
                {a.links?.map((k) => (
                  <a key={k} href={nasaLinks[k].url} target="_blank" rel="noreferrer">
                    {nasaLinks[k].label}: {nasaLinks[k].title} <ArrowUpRight size={13} />
                  </a>
                ))}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
