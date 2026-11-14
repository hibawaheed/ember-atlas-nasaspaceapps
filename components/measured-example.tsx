"use client";
import { ArrowUpRight } from "lucide-react";
import saffire from "@/data/saffire.json";
import { saffireTests, tableLink } from "@/lib/saffire";
import { sourceFor } from "@/lib/evidence";

const guide = () => sourceFor("researchers-guide")!.url;

/**
 * One measured example per safety question, so detection and suppression
 * lead to a specific test rather than a topic list.
 */
export default function MeasuredExample({
  priority,
}: {
  priority: "prevention" | "detection" | "suppression";
}) {
  if (priority === "prevention") return null;
  if (priority === "detection") {
    const d = saffire.detection;
    const t = saffireTests.find((x) => x.id === d.test)!;
    return (
      <section className="panel measured-example" aria-labelledby="mx-title">
        <span className="eyebrow">MEASURED EXAMPLE · DETECTION</span>
        <h2 id="mx-title">
          Saffire {t.id}: a common alarm level came after much of the gas release
        </h2>
        <p className="mx-lead">
          The test burned {t.materialDetail} at {t.oxygenPct}% oxygen and {t.pressureKpa} kPa
          inside an uncrewed Cygnus spacecraft. A far-field unit near the hatch
          recorded smoke and particles.
        </p>
        <dl className="mx-facts">
          <div>
            <dt>What the instruments recorded</dt>
            <dd>{d.instruments}.</dd>
          </div>
          <div>
            <dt>Threshold the authors chose</dt>
            <dd>
              {d.authorThresholdMgM3} mg/m³ of particulate, described as a relatively
              tight alarm level. It is a particle concentration, not the
              ionization detector’s electrical signal.
            </dd>
          </div>
          <div>
            <dt>When it was reached</dt>
            <dd>
              {d.thresholdReachedS} s on the Figure 7 time axis. The authors write
              that by then much of the hazardous gas release had occurred
              (rises of CO₂ +{t.co2IncreasePpm} ppm and CO +{t.coIncreasePpm} ppm
              at the far-field unit, Table 2).
            </dd>
          </div>
        </dl>
        <p className="fine-print">
          One test and one detector location, in microgravity. It shows why gas
          sensing and detector placement matter; it is not a detector rating.
        </p>
        <div className="tc-actions">
          <a className="button secondary" href={tableLink(5)} target="_blank" rel="noreferrer">
            Figure 7 (PDF p. 5) <ArrowUpRight size={14} />
          </a>
          <a className="button secondary" href={tableLink(6)} target="_blank" rel="noreferrer">
            Table 2 gases (p. 6) <ArrowUpRight size={14} />
          </a>
        </div>
      </section>
    );
  }
  return (
    <section className="panel measured-example" aria-labelledby="mx-title">
      <span className="eyebrow">OBSERVED EXAMPLE · EXTINCTION</span>
      <h2 id="mx-title">FLEX: a droplet kept burning after its visible flame went out</h2>
      <p className="mx-lead">
        In FLEX, large alkane fuel droplets burned in still air aboard the ISS. The
        hot, visible flame went out when radiative heat loss cooled it, yet the
        droplet kept vaporizing at the same rate for an extended period, supported
        by a low-temperature cool flame.
      </p>
      <dl className="mx-facts">
        <div>
          <dt>Fuel and setting</dt>
          <dd>Single alkane droplets, quiescent microgravity (Combustion Integrated Rack, MDCA insert).</dd>
        </div>
        <div>
          <dt>What signalled the hidden burning</dt>
          <dd>
            The droplet’s vaporization rate stayed constant after visible
            extinction, then stopped suddenly as a vapor cloud formed.
          </dd>
        </div>
        <div>
          <dt>Related suppression result</dt>
          <dd>
            With heptane and methanol droplets and inert gases (nitrogen, CO₂,
            helium, xenon), FLEX found the flammability limit is lower in reduced
            gravity, so Earth standards for inert suppressants give less margin.
          </dd>
        </div>
      </dl>
      <p className="fine-print">
        Reported in NASA’s 2015 ISS combustion guide, not a table of measurements
        in this atlas. Specific to the tested droplet fuels; solids and real
        cabin fires need their own tests.
      </p>
      <div className="tc-actions">
        <a className="button secondary" href={`${guide()}#page=33`} target="_blank" rel="noreferrer">
          Cool flames (guide p. 33–34) <ArrowUpRight size={14} />
        </a>
        <a className="button secondary" href={`${guide()}#page=12`} target="_blank" rel="noreferrer">
          Inert suppressants (p. 12) <ArrowUpRight size={14} />
        </a>
      </div>
    </section>
  );
}
