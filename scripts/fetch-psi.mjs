// Re-downloads the NASA PSI combustion tables listed in data/psi/manifest.json
// and checks each against its recorded SHA-256.
//
//   node scripts/fetch-psi.mjs            download to a temp folder and verify
//   node scripts/fetch-psi.mjs --replace  also overwrite data/psi/raw
//
// PSI's file endpoint returns a short-lived signed URL as plain text; the file
// itself is fetched from that URL. Behind a proxy, run with NODE_USE_ENV_PROXY=1.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "data/psi/manifest.json"), "utf8"));
const API = "https://psi.nasa.gov/geode-py/ws";
const out = fs.mkdtempSync(path.join(os.tmpdir(), "psi-"));
let ok = 0, changed = 0;

for (const m of manifest.files) {
  const record = await (await fetch(`${API}/repo/investigations/${m.accession}`)).json();
  const entry = (record.experimentalTable ?? []).find((e) => e.file_name.replace(/ /g, "_").replace(/[()]/g, "") === m.file);
  if (!entry) { console.log(`MISSING  ${m.file} (no longer listed on ${m.accession})`); continue; }
  const signed = (await (await fetch(`${API}/studies/${m.accession}/download?file=${encodeURIComponent(entry.file_name)}&version=${entry.version ?? 1}&redirect=false`)).text()).trim();
  const buf = Buffer.from(await (await fetch(signed)).arrayBuffer());
  const hash = crypto.createHash("sha256").update(buf).digest("hex");
  fs.writeFileSync(path.join(out, m.file), buf);
  if (hash === m.sha256) { ok++; console.log(`OK       ${m.file}`); }
  else { changed++; console.log(`CHANGED  ${m.file}  (record v${record.version}; was v${m.recordVersion})`); }
  if (process.argv.includes("--replace")) fs.writeFileSync(path.join(root, "data/psi/raw", m.file), buf);
}
console.log(`\n${ok} unchanged, ${changed} changed. Downloads in ${out}`);
if (changed) console.log("Rebuild with: node scripts/build-tests.mjs --write-manifest");
