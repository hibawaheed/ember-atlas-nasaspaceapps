import type { Scenario } from "./scenario";
import { modelScenario, presets } from "./scenario";
import { closestTests, saffireSource, tableLink } from "./saffire";
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
  const [best] = closestTests(s);
  const t = best.test;
  const evidence = rankForScenario(s).slice(0, 3);
  const psi = (s.pressure / 6.894757).toFixed(1);
  const pressureDiff = best.rows.find((r) => r.condition === "Total pressure");
  const next = s.gravity === "moon" || s.gravity === "mars"
    ? `Would Saffire ${t.id}'s result hold at ${s.gravity === "moon" ? "lunar" : "Martian"} gravity? No measured fire at that gravity is in this atlas, and NASA's PSI archive has none (per the challenge statement); short drop-tower tests exist outside PSI, and LUCI and FM2 are planned to test it.`
    : pressureDiff && pressureDiff.status === "differs"
    ? `What changes if total pressure matched Saffire ${t.id} (${t.pressureKpa} kPa)?`
    : "Which test conditions would a lunar-gravity experiment need to repeat?";
  const row = (r: (typeof best.rows)[number]) =>
    `<tr><th>${esc(r.condition)}</th><td>${esc(r.scenario)}</td><td>${esc(r.test)}</td><td>${esc({ same: "Matches", close: "Close", differs: "Differs" }[r.status])}${r.note ? ` · ${esc(r.note)}` : ""}</td></tr>`;
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
<h2>Closest measured test: Saffire ${esc(t.id)} (${esc(t.flight)})</h2>
<p>${esc(best.reason)}</p>
<table><thead><tr><th>Condition</th><th>Scenario</th><th>Saffire ${esc(t.id)}</th><th>Comparison</th></tr></thead><tbody>${best.rows.map(row).join("")}</tbody></table>
<p>Measured in ${esc(t.id)} (Table 2): burn ${t.burnDurationS} s${t.peakHeatReleaseW ? `, peak heat release ${t.peakHeatReleaseW} W` : ""}${t.averageHeatReleaseW ? `, average ${t.averageHeatReleaseW} W` : ""}; CO₂ +${t.co2IncreasePpm} ppm and CO +${t.coIncreasePpm} ppm at the far-field unit.</p>
<p class="meta">Source: ${esc(saffireSource.authors)} ${esc(saffireSource.title)}. <a href="${esc(tableLink(3))}">Table 1, PDF p. 3</a> · <a href="${esc(tableLink(6))}">Table 2, p. 6</a> · <a href="${esc(saffireSource.citationUrl)}">NTRS ${esc(saffireSource.ntrsId)}</a> · SHA-256 ${esc(saffireSource.sha256.slice(0, 16))}…</p>
<h2>Limitation</h2>
<p>Saffire tests were microgravity fires with forced airflow inside an uncrewed Cygnus spacecraft. No measured lunar-gravity fire test is in this atlas, and NASA's PSI archive holds no partial-gravity combustion data (per the challenge statement). The lab's flame picture is an authored illustration. ${esc(model.limitations)}</p>
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
