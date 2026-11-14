"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import LabTour from "./lab-tour";
import {
  Play,
  Pause,
  RotateCcw,
  Box,
  MoveUpRight,
  GitCompareArrows,
  Bookmark,
  ArrowRight,
  Wind,
  Flame,
  ChevronDown,
  LoaderCircle,
} from "lucide-react";
import {
  baseline,
  modelScenario,
  presets,
  scenarioSchema,
  type Scenario,
} from "@/lib/scenario";
import measurements from "@/data/measurements.json";
import { atmospheres } from "@/lib/atmospheres";
import { sourceFor } from "@/lib/evidence";
import { EvidenceCard } from "./evidence-view";
import { rankForScenario } from "@/lib/evidence";
const FlameScene = dynamic(() => import("./flame-scene"), {
  ssr: false,
  loading: () => (
    <div className="scene-loading">
      <span className="spin">◌</span> Preparing the combustion chamber
    </div>
  ),
});
type Analysis = {
  ai?: {
    mode: "generative" | "authored";
    paragraphs?: { text: string; findingIds: string[] }[];
    limitation?: string;
    notice?: string;
  };
  insights: { title: string; body: string }[];
  evidence: ReturnType<typeof rankForScenario>;
  scenario: Scenario;
};
// Replay encodes spread rate as visual activity, scaled to the fastest
// published BASS-II rate. A display encoding, not a reconstructed flame.
const MAX_RATE = Math.max(
  ...measurements.series.flatMap((s) => s.points.map((p) => p.spreadRateMms)),
);
export const replayActivity = (rate: number) => 0.15 + (rate / MAX_RATE) * 0.85;
const DEFAULT_RUN = Math.max(
  0,
  measurements.series.findIndex((s) => s.testId === "M7"),
);
export default function Lab({
  scenario,
  setScenario,
  full = false,
  onNotice,
  guided = false,
  onCloseGuide,
}: {
  scenario: Scenario;
  setScenario: (s: Scenario) => void;
  full?: boolean;
  onNotice: (s: string) => void;
  guided?: boolean;
  onCloseGuide?: () => void;
}) {
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    setPaused(media.matches);
    const update = () => {
      setReducedMotion(media.matches);
      if (media.matches) setPaused(true);
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const [wireframe, setWireframe] = useState(false);
  const [compare, setCompare] = useState(false);
  const [reset, setReset] = useState(0);
  const [replay, setReplay] = useState(false);
  const [run, setRun] = useState(DEFAULT_RUN);
  const [step, setStep] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<{ name: string; scenario: Scenario }[]>(
    [],
  );
  const model = modelScenario(scenario);
  const series = measurements.series[run];
  const point = series.points[Math.min(step, series.points.length - 1)];
  const dirty =
    analysis && JSON.stringify(analysis.scenario) !== JSON.stringify(scenario);
  useEffect(() => {
    try {
      const list = JSON.parse(
        localStorage.getItem("ember-scenarios-v1") || "[]",
      );
      if (Array.isArray(list))
        setSaved(
          list
            .filter(
              (item) =>
                typeof item.name === "string" &&
                scenarioSchema.safeParse(item.scenario).success,
            )
            .slice(0, 6),
        );
    } catch {}
  }, []);
  useEffect(() => {
    if (!replay || !replayPlaying) return;
    const timer = setInterval(
      () => setStep((s) => (s + 1) % series.points.length),
      2400,
    );
    return () => clearInterval(timer);
  }, [replay, replayPlaying, series.points.length]);
  useEffect(() => {
    if (!guided) return;
    setCompare(tourStep === 0);
    setReplay(tourStep === 3);
    setReplayPlaying(false);
    setRun(DEFAULT_RUN);
    setStep(0);
    const next =
      tourStep === 1
        ? presets.still.scenario
        : tourStep === 2
          ? presets.exploration.scenario
          : baseline;
    setScenario({ ...next });
    setAnalysis(null);
    // Each chapter deliberately loads its conditions; manual edits remain free between chapters.
  }, [guided, tourStep, setScenario]);
  async function analyze() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          replay
            ? { ...scenario, replay: { testId: series.testId, index: step } }
            : scenario,
        ),
        signal: AbortSignal.timeout(25000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAnalysis(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis unavailable.");
    } finally {
      setLoading(false);
    }
  }
  function save() {
    const item = {
      name: `${scenario.gravity === "micro" ? "μg" : scenario.gravity} · ${scenario.oxygen}% O₂ · ${scenario.airflow} cm/s`,
      scenario,
    };
    const list = [
      item,
      ...saved.filter(
        (x) => JSON.stringify(x.scenario) !== JSON.stringify(scenario),
      ),
    ].slice(0, 6);
    try {
      localStorage.setItem("ember-scenarios-v1", JSON.stringify(list));
      setSaved(list);
      onNotice("Scenario saved on this device.");
    } catch {
      onNotice("Your browser could not save this scenario.");
    }
  }
  function control(key: keyof Scenario, value: Scenario[keyof Scenario]) {
    setScenario({ ...scenario, [key]: value });
  }
  const activeScene = replay
    ? { ...baseline, airflow: point.airflowCms }
    : scenario;
  return (
    <>
      {guided && (
        <LabTour
          step={tourStep}
          setStep={setTourStep}
          close={() => onCloseGuide?.()}
        />
      )}
      <section className={"lab-shell " + (full ? "full-lab" : "")}>
        <div className="lab-title">
          <div>
            <span className="section-number">01 /</span>
            <h2>The combustion lab</h2>
            <span className="tag">Interactive 3D</span>
          </div>
          <div className="lab-mode" aria-label="Visualization mode">
            <button
              className={!replay ? "active" : ""}
              aria-pressed={!replay}
              onClick={() => setReplay(false)}
            >
              Explore
            </button>
            <button
              className={replay ? "active" : ""}
              aria-pressed={replay}
              onClick={() => {
                setReplay(true);
                setCompare(false);
                setStep(0);
                setReplayPlaying(false);
              }}
            >
              Measured replay
            </button>
          </div>
        </div>
        <div className="lab-content">
          <div className="visualizer">
            <div className="viewer-top">
              <span>
                <i className="status-dot" />
                {replay ? "BASS-II · PUBLISHED DATA" : "COMBUSTION CHAMBER"}
              </span>
              <div>
                <button
                  aria-label={
                    wireframe ? "Hide chamber outline" : "Show chamber outline"
                  }
                  aria-pressed={wireframe}
                  title="Chamber outline"
                  onClick={() => setWireframe(!wireframe)}
                >
                  <Box size={17} />
                </button>
                <button
                  aria-label="Reset camera"
                  title="Reset camera"
                  onClick={() => setReset(reset + 1)}
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  className="fire-play-button"
                  aria-label={
                    paused ? "Play fire animation" : "Pause fire animation"
                  }
                  title={paused ? "Play" : "Pause"}
                  onClick={() => setPaused(!paused)}
                >
                  {paused ? <Play size={14} /> : <Pause size={14} />}
                  <span>{paused ? "Play fire" : "Pause fire"}</span>
                </button>
                <select
                  className="animation-speed"
                  aria-label="Animation speed"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                >
                  <option value={0.5}>0.5×</option>
                  <option value={1}>1×</option>
                  <option value={2}>2×</option>
                </select>
              </div>
            </div>
            <div className={"scene-container " + (compare ? "comparison" : "")}>
              <div className="scene-wrap">
                <FlameScene
                  scenario={activeScene}
                  activityOverride={
                    replay
                      ? replayActivity(point.spreadRateMms)
                      : undefined
                  }
                  paused={paused}
                  speed={speed}
                  wireframe={wireframe}
                  resetKey={reset}
                />
                <div className="scene-caption">
                  <b>
                    {replay
                      ? `${series.testId} / step ${step + 1}`
                      : scenario.gravity === "micro"
                        ? "μg"
                        : `${model.gravity}g`}
                  </b>
                  <span>
                    {replay
                      ? "Measured spread-rate encoding"
                      : scenario.gravity === "micro"
                        ? "Microgravity"
                        : `${scenario.gravity[0].toUpperCase() + scenario.gravity.slice(1)} gravity`}
                  </span>
                </div>
              </div>
              {compare && (
                <div className="scene-wrap">
                  <FlameScene
                    scenario={{ ...scenario, gravity: "earth" }}
                    paused={paused}
                    speed={speed}
                    wireframe={wireframe}
                    resetKey={reset}
                  />
                  <div className="scene-caption">
                    <b>1g</b>
                    <span>Earth reference</span>
                  </div>
                </div>
              )}
            </div>
            <div
              className={"animation-status " + (paused ? "paused" : "running")}
            >
              <i />
              {paused
                ? reducedMotion
                  ? "Motion paused · press Play to animate"
                  : "Fire animation paused"
                : "Fire animation live"}
              <span>
                {replay ? "Published value → illustrative flame" : model.shape}
              </span>
            </div>
            <div className="viewer-data">
              <div>
                <span>{replay ? "MEASURED SPREAD" : "VISUAL ACTIVITY"}</span>
                <strong>
                  {replay
                    ? point.spreadRateMms.toFixed(3)
                    : model.activity.toFixed(2)}
                  <small>{replay ? " mm/s" : " / 1"}</small>
                </strong>
              </div>
              <div>
                <span>{replay ? "AIRFLOW" : "O₂ PARTIAL PRESSURE"}</span>
                <strong>
                  {replay ? point.airflowCms : model.partialPressure}
                  <small>{replay ? " cm/s" : " kPa"}</small>
                </strong>
              </div>
              <div className="viewer-spark">
                <svg viewBox="0 0 110 35" aria-hidden="true">
                  <ellipse
                    cx="55"
                    cy="17"
                    rx="34"
                    ry="10"
                    fill="none"
                    stroke="#9fc7b6"
                    strokeWidth=".7"
                  />
                  <ellipse
                    cx="55"
                    cy="17"
                    rx="34"
                    ry="10"
                    transform="rotate(-28 55 17)"
                    fill="none"
                    stroke="#9fc7b6"
                    strokeWidth=".7"
                  />
                  <circle cx="55" cy="17" r="3" fill="#9fc7b6" />
                </svg>
                <span>
                  {replay ? "DATA-ENCODED VIEW" : "ILLUSTRATIVE MODEL"}
                </span>
              </div>
            </div>
            <div className="viewer-bottom">
              <span>
                ↔ Drag to orbit <i /> Scroll to zoom
              </span>
              <span>
                {replay
                  ? "Appearance encodes spread, not heat."
                  : "Conceptual view · not to scale"}
              </span>
            </div>
          </div>
          <aside className="lab-controls">
            {replay ? (
              <>
                <div className="controls-heading">
                  <span className="eyebrow">OBSERVATION REPLAY</span>
                  <h3>Follow the measurement.</h3>
                </div>
                <label className="control-label">
                  Experiment run
                  <select
                    value={run}
                    onChange={(e) => {
                      setRun(Number(e.target.value));
                      setStep(0);
                    }}
                  >
                    {measurements.series.map((s, i) => (
                      <option value={i} key={s.testId}>
                        {s.testId} · {s.thicknessMm} mm × {s.widthCm} cm ·{" "}
                        {s.sidesBurning === 1 ? "one side" : "two sides"}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="replay-stat">
                  <span>Flame spread</span>
                  <b>
                    {point.spreadRateMms.toFixed(3)}
                    <small> mm/s</small>
                  </b>
                </div>
                <label className="range-control">
                  <span>
                    Observation{" "}
                    <b>
                      {step + 1} / {series.points.length}
                    </b>
                  </span>
                  <input
                    aria-label="Replay observation"
                    type="range"
                    min={0}
                    max={series.points.length - 1}
                    step={1}
                    value={step}
                    onChange={(e) => {
                      setStep(Number(e.target.value));
                      setReplayPlaying(false);
                    }}
                  />
                </label>
                <div className="replay-buttons">
                  <button
                    className="button secondary"
                    aria-label="Previous observation"
                    disabled={step === 0}
                    onClick={() => {
                      setStep(step - 1);
                      setReplayPlaying(false);
                    }}
                  >
                    ←
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => setReplayPlaying(!replayPlaying)}
                  >
                    {replayPlaying ? <Pause size={14} /> : <Play size={14} />}
                    {replayPlaying ? "Pause observations" : "Play observations"}
                  </button>
                  <button
                    className="button secondary"
                    aria-label="Next observation"
                    disabled={step === series.points.length - 1}
                    onClick={() => {
                      setStep(step + 1);
                      setReplayPlaying(false);
                    }}
                  >
                    →
                  </button>
                </div>
                <dl className="replay-conditions">
                  <div>
                    <dt>Airflow</dt>
                    <dd>{point.airflowCms} cm/s</dd>
                  </div>
                  <div>
                    <dt>O₂ run endpoints</dt>
                    <dd>
                      {series.initialOxygenVolPct} → {series.finalOxygenVolPct}%
                    </dd>
                  </div>
                  <div>
                    <dt>Flow direction</dt>
                    <dd>Opposed</dd>
                  </div>
                  <div>
                    <dt>Gravity</dt>
                    <dd>Microgravity</dd>
                  </div>
                </dl>
                <p className="control-note">
                  Radius and brightness map to published spread rate. This is a
                  data encoding, not a reconstruction of flame shape or heat
                  output. Observation playback is a presentation cadence, not
                  recorded experiment time.
                </p>
                <a
                  className="text-link"
                  href={measurements.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  NASA report, Table 5.1 <MoveUpRight size={14} />
                </a>
              </>
            ) : (
              <>
                <div className="controls-heading">
                  <span className="eyebrow">SET THE CONDITIONS</span>
                  <select
                    aria-label="Load scenario preset"
                    value=""
                    onChange={(e) => {
                      if (presets[e.target.value])
                        setScenario({ ...presets[e.target.value].scenario });
                    }}
                  >
                    <option value="" disabled>
                      Choose a scenario
                    </option>
                    {Object.entries(presets).map(([key, p]) => (
                      <option key={key} value={key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="gravity-select" aria-label="Gravity setting">
                  {(["micro", "moon", "mars", "earth"] as const).map((g) => (
                    <button
                      key={g}
                      className={scenario.gravity === g ? "active" : ""}
                      aria-pressed={scenario.gravity === g}
                      onClick={() => control("gravity", g)}
                    >
                      <span>
                        {g === "micro"
                          ? "μg"
                          : g === "moon"
                            ? "☾"
                            : g === "mars"
                              ? "◉"
                              : "⊕"}
                      </span>
                      {g === "micro"
                        ? "Orbit"
                        : g[0].toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
                <label className="range-control">
                  <span>
                    Oxygen concentration{" "}
                    <b>
                      {scenario.oxygen}
                      <small>%</small>
                    </b>
                  </span>
                  <input
                    type="range"
                    aria-label="Oxygen concentration"
                    min="15"
                    max="40"
                    step=".5"
                    value={scenario.oxygen}
                    onChange={(e) => control("oxygen", Number(e.target.value))}
                  />
                  <div>
                    <small>15%</small>
                    <small>40%</small>
                  </div>
                </label>
                <label className="range-control">
                  <span>
                    Airflow velocity{" "}
                    <b>
                      {scenario.airflow}
                      <small> cm/s</small>
                    </b>
                  </span>
                  <input
                    type="range"
                    aria-label="Airflow velocity"
                    min="0"
                    max="20"
                    step=".5"
                    value={scenario.airflow}
                    onChange={(e) => control("airflow", Number(e.target.value))}
                  />
                  <div>
                    <small>Still</small>
                    <small>20 cm/s</small>
                  </div>
                </label>
                <label className="range-control">
                  <span>
                    Cabin pressure{" "}
                    <b>
                      {scenario.pressure}
                      <small> kPa · {(scenario.pressure / 6.894757).toFixed(1)} psi</small>
                    </b>
                  </span>
                  <input
                    type="range"
                    aria-label="Cabin pressure"
                    min="50"
                    max="110"
                    step=".1"
                    value={scenario.pressure}
                    onChange={(e) =>
                      control("pressure", Number(e.target.value))
                    }
                  />
                </label>
                <label className="fuel-select">
                  <Flame size={15} />
                  <select
                    aria-label="Fuel material"
                    value={scenario.fuel}
                    onChange={(e) =>
                      control("fuel", e.target.value as Scenario["fuel"])
                    }
                  >
                    <option value="pmma">PMMA · solid fuel</option>
                    <option value="cellulose">Cellulose · solid fuel</option>
                    <option value="droplet">Liquid droplet · idealized</option>
                  </select>
                  <ChevronDown size={14} />
                </label>
                <button
                  className="button primary analyze-button"
                  disabled={loading}
                  onClick={analyze}
                >
                  {loading ? (
                    <LoaderCircle size={16} className="spin" />
                  ) : (
                    <Wind size={16} />
                  )}{" "}
                  {loading ? "Reading the evidence…" : "Interpret scenario"}
                  <ArrowRight size={15} />
                </button>
              </>
            )}
          </aside>
        </div>
        <div className="lab-footer">
          <p>
            <span className="small-dot" />
            {replay
              ? "NASA observations · visual mapping is authored"
              : "Illustrative model · educational use · no safety prediction"}
          </p>
          {!replay && (
            <div>
              <button
                aria-pressed={compare}
                onClick={() => setCompare(!compare)}
              >
                <GitCompareArrows size={15} />{" "}
                {compare ? "Single view" : "Compare with Earth"}
              </button>
              <button onClick={save}>
                <Bookmark size={15} /> Save scenario
              </button>
            </div>
          )}
        </div>
      </section>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {analysis && !replay && (
        <section className="analysis-results view-enter">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">SCENARIO INTERPRETATION</span>
              <h2>What the evidence suggests</h2>
            </div>
            {dirty && (
              <span className="tag orange">
                Conditions changed · interpret again
              </span>
            )}
          </div>
          {analysis.ai?.mode === "generative" && analysis.ai.paragraphs && (
            <div className="ai-interpretation">
              <span className="tag">AI interpretation · check against the sources</span>
              {analysis.ai.paragraphs.map((p, i) => (
                <p key={i}>
                  {p.text}{" "}
                  {p.findingIds.map((id) => {
                    const n = analysis.evidence.findIndex((f) => f.id === id);
                    return n >= 0 ? (
                      <sup key={id} className="cite-ref">[{n + 1}]</sup>
                    ) : null;
                  })}
                </p>
              ))}
              {analysis.ai.limitation && (
                <p className="fine-print">Limitation: {analysis.ai.limitation}</p>
              )}
            </div>
          )}
          {analysis.ai?.notice && <p className="fine-print">{analysis.ai.notice}</p>}
          <div className="analysis-notes">
            {analysis.insights.map((n) => (
              <article key={n.title}>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
              </article>
            ))}
          </div>
          <p className="fine-print">
            Related findings ranked by text relevance to this scenario, not by
            risk or scientific certainty. AI citations [1]–[3] refer to these
            findings in order.
          </p>
          <div className="evidence-grid">
            {analysis.evidence.slice(0, 3).map((f) => (
              <EvidenceCard key={f.id} finding={f} compact />
            ))}
          </div>
        </section>
      )}
      {full && (
        <section className="panel atmosphere-compare">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">CREW ATMOSPHERES</span>
              <h2>Spacesuit, Moon base and Earth air compared</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <caption>
                Figures from the challenge statement. Partial pressure is
                arithmetic only, not a fire-risk estimate.
              </caption>
              <thead>
                <tr>
                  <th>Atmosphere</th>
                  <th>Oxygen</th>
                  <th>Pressure</th>
                  <th>O₂ partial</th>
                </tr>
              </thead>
              <tbody>
                {atmospheres.map((a) => (
                  <tr key={a.id}>
                    <th>{a.name}</th>
                    <td>{a.oxygenPct}%</td>
                    <td>
                      {a.pressureKpa} kPa
                      <br />
                      <small>{a.pressurePsi} psi</small>
                    </td>
                    <td>{a.oxygenPartialKpa} kPa</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="atmosphere-notes">
            {atmospheres.map((a) => (
              <li key={a.id}>
                <b>{a.name}.</b> {a.note}
              </li>
            ))}
          </ul>
          <p className="fine-print">
            The lab&apos;s controls cover 15–40% oxygen and 50–110 kPa, so the
            spacesuit case is shown here only. Use the &ldquo;Lunar habitat
            (challenge figures)&rdquo; preset to explore the Moon base case.
            Flammability depends on oxygen fraction, pressure, airflow, gravity
            and material together.
          </p>
        </section>
      )}
      {full && (
        <section className="panel gravity-gap">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">PARTIAL GRAVITY</span>
              <h2>What we know between orbit and Earth</h2>
            </div>
          </div>
          <div className="gravity-scale" role="img" aria-label="Gravity scale: measured combustion data exist at microgravity (ISS) and at Earth gravity; no partial-gravity combustion data exist in PSI for the Moon at 0.166 g or Mars at 0.38 g.">
            <div className="gravity-track">
              <span className="gravity-gap-band" />
            </div>
            {[
              { g: 0, label: "Microgravity", sub: "ISS data", measured: true },
              { g: 0.166, label: "Moon", sub: "0.166 g · no data", measured: false },
              { g: 0.38, label: "Mars", sub: "0.38 g · no data", measured: false },
              { g: 1, label: "Earth", sub: "ground data", measured: true },
            ].map((m) => (
              <div
                key={m.label}
                className={
                  "gravity-mark " +
                  (m.measured ? "measured" : "missing") +
                  (m.g === 0 ? " start" : m.g === 1 ? " end" : "") +
                  (m.label === "Moon" ? " above" : "")
                }
                style={{ left: `${m.g * 100}%` }}
              >
                <i />
                <b>{m.label}</b>
                <small>{m.sub}</small>
              </div>
            ))}
          </div>
          <ul className="atmosphere-notes">
            <li>
              <b>No partial-gravity data yet.</b> The challenge statement says
              PSI currently holds no partial-gravity combustion data. The
              lab&apos;s Moon and Mars settings only interpolate the flame&apos;s
              shape for illustration.
            </li>
            <li>
              <b>Bracketing.</b> Microgravity and normal-gravity results could
              bound what happens at intermediate gravity levels, according to
              the challenge statement. That gives a range to investigate, not
              a prediction.
            </li>
            <li>
              <b>A stand-in experiment.</b> ACME&apos;s E-FIELD Flames used an
              electric field acting on ions in the flame to mimic partial
              gravity. An ion-driven force is not buoyancy, so the analogy is
              limited.
            </li>
            <li>
              <b>Data on the way.</b> The Lunar-g Combustion Investigation
              (LUCI) and Flammability of Materials on the Moon (FM2) are
              expected to add partial-gravity data.
            </li>
          </ul>
          <p className="fine-print">
            Sources:{" "}
            <a className="text-link" href={sourceFor("challenge-2026")!.url} target="_blank" rel="noreferrer">
              challenge statement
            </a>{" "}
            ·{" "}
            <a className="text-link" href={sourceFor("efield-page")!.url} target="_blank" rel="noreferrer">
              E-FIELD Flames (NASA)
            </a>
          </p>
        </section>
      )}
      {full && saved.length > 0 && (
        <section className="saved-scenarios panel">
          <h3>Saved on this device</h3>
          <div>
            {saved.map((s, i) => (
              <button
                className="button secondary"
                key={i}
                onClick={() => {
                  setScenario(s.scenario);
                  setReplay(false);
                  onNotice("Saved scenario loaded.");
                }}
              >
                <Bookmark size={14} />
                {s.name}
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
