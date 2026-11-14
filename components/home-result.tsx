"use client";
import { ArrowUpRight, Download, Share2, SlidersHorizontal } from "lucide-react";
import { presets } from "@/lib/scenario";
import { closestTests, tableLink } from "@/lib/saffire";

/**
 * The homepage's first result: the challenge's Moon base atmosphere compared
 * with the closest measured NASA test, with the next actions beside it.
 */
export default function HomeResult({
  onCompare,
  onBrief,
  onShare,
}: {
  onCompare: () => void;
  onBrief: () => void;
  onShare: () => void;
}) {
  const lunar = presets.lunar.scenario;
  const { test: t, rows } = closestTests(lunar)[0];
  const differs = rows
    .filter((r) => r.status === "differs" && r.condition !== "Material")
    .map((r) => r.condition.replace("Total pressure", "pressure").toLowerCase());
  return (
    <section className="home-result" aria-labelledby="home-result-q">
      <div className="hr-question">
        <span className="eyebrow">THE CHALLENGE’S MOON BASE QUESTION</span>
        <h2 id="home-result-q">
          Has NASA measured a fire in {lunar.oxygen}% oxygen at {lunar.pressure} kPa?
        </h2>
        <p>
          The challenge statement expects lunar habitats at 30% oxygen or more and
          10.2 psi (70.3 kPa) or less. This is a scenario, not a measured test.
        </p>
      </div>
      <div className="hr-answer">
        <span className="eyebrow">CLOSEST MEASURED TEST</span>
        <h3>
          Saffire {t.id} · {t.material}
        </h3>
        <p className="hr-values">
          {t.oxygenPct}% O₂ · {t.pressureKpa} kPa · {t.airflowCms} cm/s · microgravity
          {t.peakHeatReleaseW ? ` · peak ${t.peakHeatReleaseW} W` : ""}
        </p>
        <p className="hr-limit">
          Same material, oxygen within{" "}
          {Math.abs(t.oxygenPct - lunar.oxygen).toFixed(1)} points. Its{" "}
          {differs.length > 1 ? differs.slice(0, -1).join(", ") + " and " + differs.at(-1) : differs[0]}{" "}
          differ, and no lunar-gravity test is in the atlas.
        </p>
      </div>
      <div className="hr-actions" aria-label="Next steps">
        <button className="button secondary hr-main" onClick={onCompare}>
          <SlidersHorizontal size={15} /> Compare condition by condition
        </button>
        <a className="button secondary" href={tableLink(3)} target="_blank" rel="noreferrer">
          Source table (NASA PDF) <ArrowUpRight size={14} />
        </a>
        <button className="button secondary" onClick={onBrief}>
          <Download size={14} /> Save brief (HTML)
        </button>
        <button className="button secondary" onClick={onShare}>
          <Share2 size={14} /> Copy link
        </button>
      </div>
    </section>
  );
}
