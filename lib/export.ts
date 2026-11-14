import type { Scenario } from "./scenario";
import { modelScenario, scenarioNotes } from "./scenario";
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
export function exportBrief(s: Scenario) {
  const model = modelScenario(s);
  const evidence = rankForScenario(s);
  download(
    "ember-atlas-research-brief.html",
    `<!doctype html><html lang="en"><meta charset="utf-8"><title>EMBER Atlas research brief</title><style>body{font:16px/1.65 system-ui;max-width:850px;margin:60px auto;padding:24px;color:#222}h1{font-size:42px}small{color:#666}article{border-top:1px solid #ddd;margin-top:24px}a{color:#a4371f}@media print{body{margin:0}a{color:#222}}</style><small>EMBER ATLAS / INDEPENDENT SPACE APPS DEMO</small><h1>Fire, beyond Earth.</h1><p>Exported ${esc(new Date().toISOString())}</p><h2>Scenario</h2><pre>${esc(JSON.stringify(s, null, 2))}</pre><p>Oxygen partial pressure: ${model.partialPressure} kPa (arithmetic, not a safety threshold).</p><p>${esc(model.limitations)}</p><h2>Interpretation</h2>${scenarioNotes(
      s,
    )
      .map(
        (n) =>
          `<article><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p></article>`,
      )
      .join("")}<h2>Supporting evidence</h2>${evidence
      .map(
        (f) =>
          `<article><h3>${esc(f.title)}</h3><p>${esc(f.claim)}</p><p><b>Inference:</b> ${esc(f.safetyImplication)}</p><p><b>Limitation:</b> ${esc(f.limitations)}</p>${f.sourceIds
            .map((id) => {
              const source = sourceFor(id)!;
              return `<a href="${esc(source.url)}">${esc(source.title)}</a>`;
            })
            .join("<br>")}</article>`,
      )
      .join(
        "",
      )}<hr><p>Educational research demo. Not a validated spacecraft fire predictor. Independent project; no NASA endorsement. Print this page to save a PDF.</p></html>`,
    "text/html",
  );
}
