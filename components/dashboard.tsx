"use client";
import { useState, useEffect } from "react";
import {
  Flame,
  LayoutDashboard,
  Orbit,
  Database,
  BookOpen,
  MessagesSquare,
  ArrowUpRight,
  ArrowRight,
  Download,
  PanelLeftClose,
  Menu,
  X,
  Check,
  Share2,
  Activity,
  Compass,
  Telescope,
  Play,
  Layers,
  MoveUpRight,
} from "lucide-react";
import { baseline, presets, scenarioSchema, type Scenario } from "@/lib/scenario";
import HomeResult from "./home-result";
import AtlasMap from "./atlas-map";
import { findings, sources } from "@/lib/evidence";
import { investigations } from "@/lib/investigations";
import measurements from "@/data/measurements.json";
import testMeta from "@/data/tests-meta.json";
import { exportBrief, scenarioUrl } from "@/lib/export";
const build = { commit: process.env.BUILD_COMMIT ?? "local", date: process.env.BUILD_DATE ?? "" };
import Lab from "./lab";
import MeasurementChart from "./measurement-chart";
import EvidenceView, { EvidenceCard } from "./evidence-view";
import AssistantView from "./assistant-view";
import MethodologyView from "./methodology-view";
import DataView from "./data-view";
import MissionView from "./mission-view";
import FieldGuide from "./field-guide";
import OrbitalScene from "./orbital-scene";
const pages = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "lab", label: "Combustion lab", icon: Orbit },
  { id: "missions", label: "Mission desk", icon: Telescope },
  { id: "evidence", label: "Evidence library", icon: BookOpen },
  { id: "data", label: "Measured data", icon: Database },
  { id: "assistant", label: "Research companion", icon: MessagesSquare },
  { id: "guide", label: "How to use & learn", icon: Compass },
  { id: "methodology", label: "Sources & methods", icon: Layers },
];
export default function Dashboard() {
  const [page, setPage] = useState("overview");
  const [guided, setGuided] = useState(false);
  const [scenario, setScenario] = useState<Scenario>(baseline);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width:650px)");
    const change = () => setIsMobile(media.matches);
    change();
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("view");
    if (pages.some((x) => x.id === p)) setPage(p!);
    const encoded = params.get("scenario");
    if (encoded) {
      try {
        const parsed = scenarioSchema.safeParse(JSON.parse(encoded));
        if (parsed.success) setScenario(parsed.data);
      } catch {}
    }
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  function navigate(id: string) {
    setPage(id);
    setMobileOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("view", id);
    window.history.replaceState(null, "", url);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function startTour() {
    setGuided(true);
    navigate("lab");
  }
  function compareLunar() {
    setScenario(presets.lunar.scenario);
    navigate("lab");
    setTimeout(
      () => document.getElementById("tc-title")?.scrollIntoView({ block: "start" }),
      350,
    );
  }
  async function share(s: Scenario = scenario) {
    const url = new URL(scenarioUrl(s));
    try {
      await navigator.clipboard.writeText(url.toString());
      setNotice("Scenario link copied.");
    } catch {
      window.history.replaceState(null, "", url);
      setNotice("Scenario added to the address bar. Copy the URL to share.");
    }
  }
  const current = pages.find((p) => p.id === page)!;
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {mobileOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={"sidebar " + (mobileOpen ? "open" : "")}
        inert={isMobile && !mobileOpen}
        aria-hidden={isMobile && !mobileOpen}
      >
        <button
          className="brand"
          onClick={() => navigate("overview")}
          aria-label="Ember Atlas home"
        >
          <span className="brand-icon">
            <Flame size={27} strokeWidth={1.5} />
          </span>
          <span>
            Ember<small>Atlas</small>
          </span>
        </button>
        <div className="workspace-label">
          <span className="status-dot" /> SPACE APPS 2026
        </div>
        <span className="nav-caption">WORKSPACE</span>
        <nav aria-label="Main navigation">
          {pages
            .filter((p) => p.id !== "methodology")
            .map((p) => (
              <button
                key={p.id}
                className={page === p.id ? "active" : ""}
                aria-current={page === p.id ? "page" : undefined}
                onClick={() => navigate(p.id)}
              >
                <p.icon size={18} />
                <span>{p.label}</span>
                {p.id === "evidence" && <small>{findings.length}</small>}
                {page === p.id && p.id !== "evidence" && (
                  <span className="nav-dot" />
                )}
              </button>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="sidebar-guide" onClick={startTour}>
            <Compass size={23} />
            <span>
              FIVE STEPS / THREE MINUTES<b>Open guided lab ↗</b>
            </span>
          </button>
          <button
            className={
              page === "methodology" ? "method-link active" : "method-link"
            }
            onClick={() => navigate("methodology")}
          >
            <Layers size={16} /> Sources & methods
            <ArrowUpRight size={14} />
          </button>
          <a
            className="repo-link"
            href="https://github.com/hibawaheed/ember-atlas-nasaspaceapps"
            target="_blank"
            rel="noreferrer"
          >
            Open source project <ArrowUpRight size={13} />
          </a>
          <div className="sidebar-footer">
            <span className="tiny-logo">E</span>
            <span>
              Independent research demo.
              <small>Built with NASA open research.</small>
            </span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <span>/</span>
            <b>{current.label}</b>
          </div>
          <div className="topbar-right">
            <span className="snapshot">
              <i /> Research snapshot · Nov 2026
            </span>
            <a
              href="https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/"
              target="_blank"
              rel="noreferrer"
              className="challenge-link"
            >
              Flame in Freefall <ArrowUpRight size={14} />
            </a>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          <div className="page-actions">
            <div className="mini-breadcrumb">
              <span className="status-dot" /> MICROGRAVITY COMBUSTION RESEARCH
            </div>
            <div>
              <button className="button subtle" onClick={() => share()}>
                <Share2 size={15} />
                Share scenario
              </button>
              <button
                className="button secondary"
                onClick={() => exportBrief(scenario, build)}
                title="One-page brief for the scenario now in the lab: inputs, closest measured test, sources, limitation"
              >
                <Download size={15} />
                Scenario brief (HTML)
              </button>
            </div>
          </div>
          {page === "overview" && (
            <div className="view-enter">
              <section className="overview-hero galaxy-hero">
                <div className="galaxy-hero-copy">
                  <span className="eyebrow">
                    <span className="status-dot" /> NASA MICROGRAVITY RESEARCH
                  </span>
                  <h1>
                    Fire,
                    <br />
                    <span>beyond Earth.</span>
                  </h1>
                  <p>
                    For mission planners, students and fire-safety
                    researchers: compare a habitat atmosphere with measured
                    NASA fire tests, and follow every claim to its source.
                  </p>
                  <div className="galaxy-hero-actions">
                    <button className="button primary" onClick={compareLunar}>
                      Compare a lunar habitat with a NASA test{" "}
                      <ArrowUpRight size={17} />
                    </button>
                    <button className="galaxy-tour" onClick={startTour}>
                      <Play size={14} /> Take a guided tour
                    </button>
                  </div>
                  <div className="galaxy-byline">
                    <span>ISL TEAM A</span>
                    <i /> FLAME IN FREEFALL / SPACE APPS
                  </div>
                </div>
                <OrbitalScene />
              </section>
              <HomeResult
                onCompare={compareLunar}
                onBrief={() => exportBrief(presets.lunar.scenario, build)}
                onShare={() => share(presets.lunar.scenario)}
              />
              <AtlasMap />
              <div className="galaxy-paths" aria-label="Explore the research">
                <button onClick={() => navigate("missions")}>
                  <Telescope size={18} />
                  <span>
                    <small>01 / FIND</small>Research for your mission
                  </span>
                  <ArrowUpRight size={16} />
                </button>
                <button onClick={() => navigate("data")}>
                  <Activity size={18} />
                  <span>
                    <small>02 / COMPARE</small>Published measurements
                  </span>
                  <ArrowUpRight size={16} />
                </button>
                <button onClick={() => navigate("assistant")}>
                  <MessagesSquare size={18} />
                  <span>
                    <small>03 / UNDERSTAND</small>Ask the evidence
                  </span>
                  <ArrowUpRight size={16} />
                </button>
              </div>
              <section className="stats-grid" aria-label="Research collection">
                <article className="stat-accent">
                  <span>NASA TEST RECORDS</span>
                  <div>
                    <strong>{testMeta.counts.records.toLocaleString()}</strong>
                    <Database size={19} />
                  </div>
                  <p>From {testMeta.counts.investigations} investigations: PSI tables and the Saffire VI paper</p>
                </article>
                <article>
                  <span>WITH OXYGEN AND PRESSURE</span>
                  <div>
                    <strong>{testMeta.counts.plottable}</strong>
                    <Activity size={19} />
                  </div>
                  <p>Plotted on the atlas map</p>
                </article>
                <article>
                  <span>CURATED FINDINGS</span>
                  <div>
                    <strong>{findings.length}</strong>
                    <BookOpen size={19} />
                  </div>
                  <p>From {sources.length} NASA sources, each with its limits</p>
                </article>
                <article>
                  <span>PROBLEMS FLAGGED</span>
                  <div>
                    <strong>{testMeta.counts.quirks}</strong>
                    <Layers size={19} />
                  </div>
                  <p>Data-entry issues in NASA&apos;s tables, listed openly</p>
                </article>
              </section>
              <Lab
                scenario={scenario}
                setScenario={setScenario}
                onNotice={setNotice}
              />
              <div className="overview-bottom">
                <MeasurementChart />
                <section className="insight-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">RESEARCH NOTE / FLEX</span>
                      <h3>Combustion beyond the visible flame</h3>
                    </div>
                    <span className="insight-star">✳</span>
                  </div>
                  <p className="insight-lead">
                    Visible extinction can leave ongoing chemistry.
                  </p>
                  <p>
                    FLEX experiments uncovered cool-flame combustion in
                    microgravity. Visible-light appearance alone can be an
                    incomplete indicator of what’s happening.
                  </p>
                  <div className="insight-proof">
                    <span className="tag green">Observed</span>
                    <span>FLEX / NASA</span>
                  </div>
                  <button
                    className="text-link"
                    onClick={() => navigate("evidence")}
                  >
                    Follow the evidence <ArrowRight size={17} />
                  </button>
                  <span className="insight-annotation">
                    01 — DETECTION & EXTINCTION
                  </span>
                </section>
              </div>
              <section className="research-strip">
                <div>
                  <span className="section-number">02 /</span>
                  <h2>Selected findings</h2>
                </div>
                <button
                  className="text-link"
                  onClick={() => navigate("evidence")}
                >
                  Explore the library <ArrowRight size={16} />
                </button>
              </section>
              <div className="evidence-grid home-evidence">
                {["bass-flow", "acme-zero-flow", "saffire-oxygen"]
                  .map((id) => findings.find((f) => f.id === id))
                  .filter((f): f is (typeof findings)[number] => Boolean(f))
                  .slice(0, 3)
                  .map((f) => (
                    <EvidenceCard key={f.id} finding={f} compact />
                  ))}
              </div>
            </div>
          )}
          {page === "lab" && (
            <div
              className={"view-enter lab-page " + (guided ? "guided-page" : "")}
            >
              <div className="section-intro">
                <div>
                  <span className="eyebrow">
                    INTERACTIVE EXPERIMENT / ILLUSTRATIVE MODEL
                  </span>
                  <h1>Combustion lab</h1>
                  <p>
                    Explore a concept, replay observations, and compare gravity.
                  </p>
                </div>
                <div className="outline-mark">μg</div>
              </div>
              <Lab
                scenario={scenario}
                setScenario={setScenario}
                full
                guided={guided}
                onCloseGuide={() => setGuided(false)}
                onNotice={setNotice}
              />
            </div>
          )}
          {page === "missions" && (
            <MissionView
              onExplore={() => navigate("lab")}
              onOpenScenario={(s) => {
                setScenario(s);
                navigate("lab");
              }}
            />
          )}
          {page === "guide" && (
            <FieldGuide navigate={navigate} startTour={startTour} />
          )}
          {page === "evidence" && <EvidenceView />}
          {page === "data" && <DataView />}
          {page === "assistant" && <AssistantView />}
          {page === "methodology" && <MethodologyView />}
          <footer className="main-footer">
            <span>
              Ember Atlas <i /> ISL Team A
            </span>
            <p>
              Independent educational demo. NASA sources; no NASA endorsement.
              <span className="build-stamp">
                {" "}· Build {process.env.BUILD_COMMIT} · {process.env.BUILD_DATE}
              </span>
            </p>
            <button onClick={() => navigate("methodology")}>
              Read the methodology <ArrowUpRight size={12} />
            </button>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Check size={16} />
          {notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
