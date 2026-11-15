import type { Scenario } from "./scenario";
import { modelScenario, presets } from "./scenario";
import { saffireTests, tableLink } from "./saffire";
import { nearestTests, fuelClassOf, testsAtAtmosphere, sourceLink, testName } from "./nearest";
import { partialGravity, meanLimit } from "./partial-gravity";
import { rankForScenario, sourceFor } from "./evidence";
export function download(
  name: string,
  content: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
const esc = (s: unknown) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const gravityName = { micro: "Microgravity (orbit)", moon: "Lunar (0.166 g)", mars: "Martian (0.38 g)", earth: "Earth (1 g)" };
const fuelLabel = { pmma: "PMMA (acrylic) solid", cellulose: "Cellulose-type solid", droplet: "Liquid droplet" };

/** The URL that rebuilds this scenario in the lab. */
export function scenarioUrl(s: Scenario, origin = typeof window !== "undefined" ? window.location.origin : "https://emberatlas.tech") {
  const url = new URL("/", origin);
  url.searchParams.set("view", "lab");
  url.searchParams.set("scenario", JSON.stringify(s));
  return url.toString();
}

/** A one-page HTML brief: question, inputs, closest measured test, sources, limits. */
export function briefHtml(s: Scenario, build = { commit: "local", date: "" }, now = new Date()) {
  const model = modelScenario(s);
  const lunar = JSON.stringify(s) === JSON.stringify(presets.lunar.scenario);
  const question = lunar
    ? `Has NASA measured a fire in ${s.oxygen}% oxygen at ${s.pressure} kPa (the challenge's Moon base atmosphere)?`
    : "Which measured NASA fire test is closest to this scenario, and how does it differ?";
  const cls = fuelClassOf(s);
  const [best] = nearestTests(s, cls);
  const other = nearestTests(s, cls === "solid" ? "droplet" : "solid")[0];
  const t = best.test;
  const exact = testsAtAtmosphere(s);
  const sf = !t.a ? saffireTests.find((x) => x.id === t.t) : null;
  const link = sourceLink(t);
  const evidence = rankForScenario(s).slice(0, 3);
  const psi = (s.pressure / 6.894757).toFixed(1);
  const pressureDiff = best.rows.find((r) => r.condition === "Pressure");
  const gk = s.gravity === "moon" ? "lunar" : "martian";
  const next = s.gravity === "moon" || s.gravity === "mars"
    ? `Would ${testName(t)}'s result hold at ${gk === "lunar" ? "lunar" : "Martian"} gravity? Every test here ran in microgravity. NASA drop-tower tests outside PSI found three materials burning at lower oxygen at ${gk === "lunar" ? "lunar" : "Martian"} gravity than at either end, and LUCI and FM2 are planned to test longer burns.`
    : pressureDiff && pressureDiff.status === "differs"
    ? `What changes if total pressure matched ${testName(t)} (${t.p} kPa)?`
    : "Which test conditions would a lunar-gravity experiment need to repeat?";
  const row = (r: (typeof best.rows)[number]) =>
    `<tr><th>${esc(r.condition)}</th><td>${esc(r.scenario)}</td><td>${esc(r.test)}</td><td>${esc({ same: "Matches", close: "Close", differs: "Differs", unknown: "Not listed" }[r.status])}${r.note ? ` · ${esc(r.note)}` : ""}</td></tr>`;
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>EMBER Atlas scenario brief</title><style>
body{font:14px/1.5 system-ui,sans-serif;max-width:780px;margin:32px auto;padding:0 20px;color:#1d2230}
h1{font-size:22px;margin:4px 0 2px}h2{font-size:15px;margin:18px 0 6px;border-bottom:1px solid #ddd;padding-bottom:3px}
small,.meta{color:#5d6475;font-size:12px}table{border-collapse:collapse;width:100%;font-size:12.5px}
th,td{text-align:left;padding:4px 6px;border-bottom:1px solid #e5e5e5;vertical-align:top}thead th{background:#f4f1ee}
a{color:#a4371f}ul{padding-left:18px;margin:4px 0}li{margin:3px 0}.q{font-size:16px;font-weight:600}
@media print{body{margin:0;max-width:none}a{color:#1d2230}}
</style>
<small>EMBER ATLAS · SCENARIO BRIEF · ISL TEAM A</small>
<p class="q">${esc(question)}</p>
<p class="meta">Exported ${esc(now.toISOString().slice(0, 16).replace("T", " "))} UTC · build ${esc(build.commit)}${build.date ? ` (${esc(build.date)})` : ""} · <a href="${esc(scenarioUrl(s))}">reopen this scenario</a></p>
<h2>Inputs</h2>
<table><tbody>
<tr><th>Oxygen</th><td>${s.oxygen}% by volume</td></tr>
<tr><th>Total pressure</th><td>${s.pressure} kPa (${psi} psi)</td></tr>
<tr><th>O₂ partial pressure</th><td>${(s.oxygen / 100).toFixed(2)} × ${s.pressure} kPa = ${model.partialPressure.toFixed(2)} kPa (arithmetic, not a safety threshold)</td></tr>
<tr><th>Airflow</th><td>${s.airflow} cm/s</td></tr>
<tr><th>Gravity</th><td>${esc(gravityName[s.gravity])}</td></tr>
<tr><th>Fuel</th><td>${esc(fuelLabel[s.fuel])}</td></tr>
</tbody></table>
${lunar ? "<p class=meta>These are the challenge statement's Moon base conditions (30% O₂ or more at 10.2 psi or less), a scenario rather than a measured test.</p>" : ""}
${exact.length ? `<h2>Tests at this exact atmosphere</h2><p>NASA ran ${exact.length} test${exact.length === 1 ? "" : "s"} within 1 point of ${s.oxygen}% oxygen and 3 kPa of ${s.pressure} kPa: ${[...new Set(exact.map((x) => `${x.inv} (${x.f.toLowerCase()})`))].map(esc).join(", ")}; tests ${exact.map((x) => esc(x.t)).join(", ")}. All in microgravity. <a href="${esc(sourceLink(exact[0]).href)}">${esc(sourceLink(exact[0]).label)}</a></p>` : ""}
<h2>Closest measured ${cls === "solid" ? "solid-material" : "droplet"} test: ${esc(testName(t))}</h2>
<p>${esc(best.reason)}</p>
<table><thead><tr><th>Condition</th><th>Scenario</th><th>${esc(testName(t))}</th><th>Comparison</th></tr></thead><tbody>${best.rows.map(row).join("")}</tbody></table>
${sf ? `<p>Measured in ${esc(sf.id)} (Table 2): burn ${sf.burnDurationS} s${sf.peakHeatReleaseW ? `, peak heat release ${sf.peakHeatReleaseW} W` : ""}; CO₂ +${sf.co2IncreasePpm} ppm and CO +${sf.coIncreasePpm} ppm at the far-field unit. <a href="${esc(tableLink(3))}">Table 1, PDF p. 3</a> · <a href="${esc(tableLink(6))}">Table 2, p. 6</a></p>` : `<p>Outcome as NASA lists it: ${esc(t.o ?? "not listed")}. <a href="${esc(link.href)}">${esc(link.label)}</a></p>`}
${other ? `<p class="meta">Closest ${cls === "solid" ? "droplet" : "solid-material"} test for comparison: ${esc(testName(other.test))}, ${esc(other.test.f)}, ${other.test.o2}% oxygen${other.test.p != null ? ` at ${other.test.p} kPa` : ""}. ${esc(other.reason)}</p>` : ""}
${s.gravity === "moon" || s.gravity === "mars" ? `<h2>Measured at ${gk === "lunar" ? "lunar" : "Martian"} gravity</h2><table><thead><tr><th>Material</th><th>Earth</th><th>Microgravity*</th><th>${gk === "lunar" ? "Lunar" : "Martian"}</th></tr></thead><tbody>${partialGravity.materials.map((m) => `<tr><th>${esc(m.material)} (${m.pressurePsia} psia)</th><td>${meanLimit(m, "earth").toFixed(1)}%</td><td>${meanLimit(m, "zero").toFixed(1)}%</td><td>${meanLimit(m, gk).toFixed(2)}%</td></tr>`).join("")}</tbody></table><p class="meta">Mean limiting oxygen (ULOI + MOC) / 2, Olson &amp; Ferkul, NASA, <a href="${esc(partialGravity.source.pdfUrl)}#page=6">Table I</a>. About 5-second drop-tower tests; *0g with 30 cm/s flow; reduced-gravity limits defined differently from 1 g.</p>` : ""}
<h2>Limitation</h2>
<p>Every NASA test in this atlas ran in microgravity; NASA's PSI archive holds no partial-gravity combustion data (per the challenge statement). The partial-gravity limits above come from short drop-tower tests on three materials. The lab's flame picture is an authored illustration. ${esc(model.limitations)}</p>
<h2>Supporting findings</h2>
<ul>${evidence
    .map(
      (f) =>
        `<li><b>${esc(f.title)}</b> (${esc(f.experiment)}; ${esc(f.qualifier)}). ${esc(f.claim)} ${f.sourceIds
          .map((id) => {
            const src = sourceFor(id)!;
            return `<a href="${esc(src.url)}">${esc(src.title)}</a>`;
          })
          .join("; ")}</li>`,
    )
    .join("")}</ul>
<h2>Next question</h2>
<p>${esc(next)}</p>
<hr><p class="meta">Independent educational demo built from NASA sources; no NASA endorsement. Not a spacecraft fire predictor. Print this page to save a PDF.</p></html>`;
}

export function exportBrief(s: Scenario, build?: { commit: string; date: string }) {
  download("ember-atlas-scenario-brief.html", briefHtml(s, build), "text/html");
}
