"use client";
import { ArrowUpRight, Download, Share2, SlidersHorizontal } from "lucide-react";
import { presets } from "@/lib/scenario";
import { tableLink } from "@/lib/saffire";
import { nearestTests, testsAtAtmosphere } from "@/lib/nearest";
import { lunarGravityHeadline } from "@/lib/partial-gravity";

/**
 * The homepage's first result: the challenge's Moon base atmosphere answered
 * from NASA's measured tests, one answer per fuel type, plus what is known at
 * lunar gravity. Next actions sit beside it.
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
  const exact = testsAtAtmosphere(lunar);
  const fuels = [...new Set(exact.map((t) => t.f.toLowerCase()))].join(" and ");
  const pRange = exact.length ? `${Math.min(...exact.map((t) => t.p!))}–${Math.max(...exact.map((t) => t.p!))} kPa` : "";
  const solid = nearestTests(lunar, "solid")[0].test;
  const g = lunarGravityHeadline();
  return (
    <section className="home-result" aria-labelledby="home-result-q">
      <div className="hr-question">
        <span className="eyebrow">THE CHALLENGE’S MOON BASE QUESTION</span>
        <h2 id="home-result-q">
          Has NASA measured a fire in {lunar.oxygen}% oxygen at {lunar.pressure} kPa?
        </h2>
        <p>
          The challenge expects lunar habitats at 30% oxygen or more and 10.2 psi (70.3 kPa) or less. We searched{" "}
          2,008 NASA test records for it.
        </p>
      </div>
      <ol className="hr-answers">
        <li>
          <span className="hr-tag yes">Liquid droplets · yes</span>
          <p>
            <b>{exact.length} FLEX tests</b> burned {fuels} droplets at {lunar.oxygen}% oxygen and {pRange} on the ISS (2009–2010).
          </p>
          <a className="text-link" href="https://psi.nasa.gov/physci/repo/data/investigations/PSI-69" target="_blank" rel="noreferrer">
            NASA PSI-69 table <ArrowUpRight size={13} />
          </a>
        </li>
        <li>
          <span className="hr-tag partial">Solid materials · close</span>
          <p>
            <b>Saffire {solid.t}</b> burned acrylic at {solid.o2}% oxygen, but at {solid.p} kPa and 20 cm/s forced flow.
          </p>
          <a className="text-link" href={tableLink(3)} target="_blank" rel="noreferrer">
            ICES-2024-365, Table 1 <ArrowUpRight size={13} />
          </a>
        </li>
        <li>
          <span className="hr-tag gap">Lunar gravity · short tests only</span>
          <p>{g.text}</p>
          <a className="text-link" href={g.href} target="_blank" rel="noreferrer">
            {g.label} <ArrowUpRight size={13} />
          </a>
        </li>
      </ol>
      <div className="hr-actions" aria-label="Next steps">
        <button className="button secondary hr-main" onClick={onCompare}>
          <SlidersHorizontal size={15} /> Compare condition by condition
        </button>
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
