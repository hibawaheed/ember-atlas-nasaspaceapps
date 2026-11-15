import {
  ArrowUpRight,
  Database,
  Layers,
  Search,
  Box,
  FileCheck,
} from "lucide-react";
import { sources } from "@/lib/evidence";
import measurements from "@/data/measurements.json";
const pointCount = measurements.series.reduce((n, s) => n + s.points.length, 0);
export default function MethodologyView() {
  return (
    <div className="view-enter">
      <div className="section-intro">
        <div>
          <span className="eyebrow">PROVENANCE / SCOPE / LIMITATIONS</span>
          <h1>Sources & methods</h1>
          <p>A transparent path from NASA research to an explorable demo.</p>
        </div>
        <span className="outline-mark">μg</span>
      </div>
      <section className="panel challenge-audit">
        <span className="eyebrow">
          OFFICIAL CHALLENGE / DETAILS AND RESOURCES CHECKED NOVEMBER 13, 2026
        </span>
        <h2>Challenge coverage</h2>
        <p>
          We reviewed the full Details and Resources tabs of Flame in Freefall.
          The scope is fire safety in habitable crew environments: spacecraft,
          stations, surface habitats, and pressurized rovers. Rocket and
          propellant combustion is outside this demo’s scope.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Challenge direction</th>
                <th>In EMBER Atlas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Summarize and rank investigations</td>
                <td>
                  Mission desk: ranked investigation profiles with a reason
                  for each, shared-hardware groups, a comparison table and the
                  oxygen × pressure map of every NASA test that records both.
                </td>
              </tr>
              <tr>
                <td>Support prevention, detection, and suppression research</td>
                <td>
                  BASS-II, Saffire, SoFIE-GEL, ACME, SAME, and FLEX; research
                  aims are distinguished from observed results.
                </td>
              </tr>
              <tr>
                <td>Preserve experimental context</td>
                <td>
                  Fuel, geometry, atmosphere, flow, hardware, measurement types,
                  sources, and missing fields remain visible.
                </td>
              </tr>
              <tr>
                <td>Extract useful data</td>
                <td>
                  2,008 test records imported from 21 NASA PSI experimental
                  tables and the Saffire VI paper, with checksums, unit
                  conversions in code and 28 flagged data-entry problems;
                  filtered CSV downloads; plus {pointCount} BASS-II flame-spread
                  rates checked against the original NASA PDF.
                </td>
              </tr>
              <tr>
                <td>SI-powered interpretation</td>
                <td>
                  Claude Haiku 5.5 writes research-companion answers, lab
                  interpretations and Mission-desk comparisons from retrieved
                  NASA findings and investigation profiles, citing only those
                  items and the matching NASA test rows, with a search-only
                  fallback. Checked on a small live
                  test set; not scientifically validated. No claim of
                  superintelligence.
                </td>
              </tr>
              <tr>
                <td>Inform Moon and Mars research</td>
                <td>
                  The Moon base atmosphere is answered from every test: eight
                  FLEX droplet tests ran at it, Saffire VI-3 is the closest
                  solid test. PSI holds no partial-gravity data (per the
                  challenge statement); NASA drop-tower limits measured at
                  lunar and Martian gravity are charted from the published
                  paper.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <b>Data sources:</b> NASA&apos;s PSI repository (experimental tables
          for 21 combustion investigations, downloaded November 14, 2026 and
          checksummed), NASA technical reports and papers on NTRS checked page
          by page, and the official challenge resources.
        </p>
        <a
          className="text-link"
          href="https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/"
          target="_blank"
          rel="noreferrer"
        >
          Read the complete challenge <ArrowUpRight size={15} />
        </a>
      </section>
      <div className="method-cards">
        <article>
          <span className="tag green">Observed</span>
          <h3>NASA test records</h3>
          <p>
            2,008 rows from NASA&apos;s PSI experimental tables and the Saffire
            VI paper, plus {pointCount} BASS-II flame-spread rates from
            NASA/TM-20210011385, Table 5.1, checked by eye against the PDF.
            Original cells are kept with every record.
          </p>
        </article>
        <article>
          <span className="tag orange">Illustrative</span>
          <h3>The 3D flame</h3>
          <p>
            A moving procedural volumetric rendering, with a software 3D
            particle fallback. Its shape, brightness, and activity respond to
            authored rules. It is not a reconstructed experiment, CFD solution,
            temperature map, or safety prediction.
          </p>
        </article>
        <article>
          <span className="tag">Inferred</span>
          <h3>Safety interpretations</h3>
          <p>
            Concise editorial implications attached to specific observations.
            Relevance rankings organize evidence; they do not certify a material
            or quantify fire risk.
          </p>
        </article>
      </div>
      <section className="panel method-pipeline">
        <span className="eyebrow">THE DATA JOURNEY</span>
        <h2>Evidence pipeline</h2>
        <div className="pipeline">
          {[
            [
              Database,
              "01",
              "Discover",
              "NASA PSI API, NTRS, and investigation pages.",
            ],
            [
              FileCheck,
              "02",
              "Verify",
              "Checksums, units converted in code, quirks flagged.",
            ],
            [
              Search,
              "03",
              "Retrieve",
              "BM25 ranking with explicit query expansion.",
            ],
            [
              Layers,
              "04",
              "Interpret",
              "AI answers from cited findings and test rows.",
            ],
            [Box, "05", "Explore", "Atlas map, comparisons and a separate 3D model."],
          ].map(([Icon, n, title, desc]) => {
            const Component = Icon as typeof Database;
            return (
              <div key={String(n)}>
                <Component size={22} />
                <small>{String(n)}</small>
                <h3>{String(title)}</h3>
                <p>{String(desc)}</p>
              </div>
            );
          })}
        </div>
      </section>
      <div className="method-two">
        <section className="panel">
          <span className="eyebrow">MODEL CARD</span>
          <h3>Illustrative model v1</h3>
          <p>
            The activity index is dimensionless, bounded, and synthetic. Oxygen,
            pressure, airflow, and fuel selections alter an artistic response.
            Gravity interpolates shape. These coefficients are not fitted to
            NASA data.
          </p>
          <p>
            Extinction chemistry, soot kinetics, heat transfer, toxic products,
            and material ignition are not solved. A blue color is a visual
            convention, not a temperature measurement.
          </p>
          <p>
            Lunar and Martian settings are conceptual comparisons. They are not
            validated extrapolations from ISS experiments.
          </p>
        </section>
        <section className="panel">
          <span className="eyebrow">WHAT COMES NEXT</span>
          <h3>A path to real reconstruction</h3>
          <p>
            The experimental tables are in. Next are the files behind them:
            BASS-II alone holds 275 GB of video and data on PSI, and four PSI
            ground investigations (PSI-60, -62, -115, -117) already reuse
            flight data for modelling, including two-color tomography of BASS
            flames.
          </p>
          <p>
            Future ingestion should retain instrument calibration, frame timing,
            flow direction, uncertainty, and fuel geometry. Model validation
            needs held-out experiments and expert review.
          </p>
          <a
            className="text-link"
            href="https://psi.nasa.gov/physci/repo/data/investigations/PSI-62"
            target="_blank"
            rel="noreferrer"
          >
            Explore the tomography investigation <ArrowUpRight size={16} />
          </a>
        </section>
      </div>
      <section className="source-library">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">PRIMARY SOURCES</span>
            <h2>The bibliography</h2>
          </div>
          <span>{sources.length} NASA sources</span>
        </div>
        {sources.map((s, i) => (
          <a
            className="source-row"
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noreferrer"
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h4>{s.title}</h4>
              <p>
                {s.type} · {s.publishedDate || "Publication date not specified"}
              </p>
            </div>
            <ArrowUpRight size={19} />
          </a>
        ))}
      </section>
      <p className="fine-print">
        Research snapshot: November 13, 2026. This is an independent Space Apps
        demo, not a NASA product or endorsement. The challenge statement and
        published resources were reviewed on that date.
      </p>
    </div>
  );
}
