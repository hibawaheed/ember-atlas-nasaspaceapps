// Builds data/tests.json from NASA PSI experimental tables in data/psi/raw.
//
//   node scripts/build-tests.mjs                 verify checksums, then build
//   node scripts/build-tests.mjs --write-manifest  record checksums first
//
// Rules: keep every raw cell; convert units in code; never guess a missing
// value; record anything odd as a quirk instead of silently fixing it.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const rawDir = path.join(root, "data/psi/raw");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data/psi/catalog.json"), "utf8"));
const saffire = JSON.parse(fs.readFileSync(path.join(root, "data/saffire.json"), "utf8"));
const bassReport = JSON.parse(fs.readFileSync(path.join(root, "data/measurements.json"), "utf8"));
const manifestPath = path.join(root, "data/psi/manifest.json");
const RETRIEVED = "2026-11-14";

// ---------- CSV ----------
function parseCSV(text) {
  text = text.replace(/^﻿/, "");
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const clean = rows.filter((r) => r.some((x) => x.trim()));
  const header = clean[0].map((h) => h.replace(/\s+/g, " ").trim());
  return clean.slice(1).map((r, i) => {
    const o = { __line: i + 2 };
    header.forEach((h, j) => (o[h] = (r[j] ?? "").replace(/\s+/g, " ").trim()));
    return o;
  });
}

// ---------- files and checksums ----------
const files = fs.readdirSync(rawDir).filter((f) => f.endsWith(".csv")).sort();
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(path.join(rawDir, f))).digest("hex");
const accOf = (f) => f.match(/^(PSI-\d+)/)[1];
const inv = (acc) => catalog.investigations.find((i) => i.accession === acc);

if (process.argv.includes("--write-manifest")) {
  const manifest = {
    source: "NASA Physical Sciences Informatics (PSI) repository, experimental tables",
    retrieved: RETRIEVED,
    licence: "CC0-1.0 (as stated on each PSI record; PSI-10 lists no licence field)",
    howToFetch: "node scripts/fetch-psi.mjs",
    files: files.map((f) => {
      const i = inv(accOf(f));
      return {
        file: f,
        accession: i.accession,
        investigation: i.acronym ?? i.title,
        doi: i.doi,
        recordVersion: i.version,
        record: i.url,
        bytes: fs.statSync(path.join(rawDir, f)).size,
        sha256: sha(f),
      };
    }),
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1) + "\n");
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
for (const m of manifest.files) {
  const got = sha(m.file);
  if (got !== m.sha256) throw new Error(`Checksum mismatch for ${m.file}: ${got}`);
}
const load = (prefix) => {
  const f = files.find((x) => x.startsWith(prefix));
  if (!f) throw new Error("missing table " + prefix);
  return { file: f, rows: parseCSV(fs.readFileSync(path.join(rawDir, f), "utf8")) };
};

// ---------- helpers ----------
const quirks = [];
const quirk = (accession, file, testId, field, raw, note, action) =>
  quirks.push({ accession, file, testId: testId ?? null, field, raw, note, action });
const num = (s) => {
  if (s == null) return null;
  const t = String(s).replace(/[~≈]/g, "").trim();
  if (!/^-?\d*\.?\d+$/.test(t)) return null;
  return Number(t);
};
const round = (x, d = 2) => (x == null ? null : Math.round(x * 10 ** d) / 10 ** d);
const mmHgToKpa = (x) => round(x * 0.133322, 1);
const atmToKpa = (x) => round(x * 101.325, 1);
const barToKpa = (x) => round(x * 100, 1);
const tests = [];
const matrices = [];
const add = (t) => {
  tests.push({
    gravity: "microgravity",
    o2Pct: null, o2Role: null, pressureKpa: null, flowCms: null,
    outcome: null, measured: {}, flags: [],
    ...t,
  });
};
const usDate = (s, acc, file, id) => {
  const m = String(s).match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return s || null;
  let y = Number(m[3]);
  if (m[3].length === 2) {
    y += 2000;
    quirk(acc, file, id, "Test Date", s, "Two-digit year in a column that mostly uses four digits", "read as 20YY");
  }
  return `${y}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
};
const yyddd = (s) => {
  const m = String(s).match(/^(\d{2})(\d{3})$/);
  if (!m) return null;
  const d = new Date(Date.UTC(2000 + Number(m[1]), 0, 1));
  d.setUTCDate(Number(m[2]));
  return d.toISOString().slice(0, 10);
};

// ---------- PSI-69 FLEX ----------
{
  const acc = "PSI-69", { file, rows } = load("PSI-69");
  quirk(acc, file, null, "headers", "O / N / CO / He initial ambient composition", "Subscripts were lost in the column names; 'O', 'N' and 'CO' are O₂, N₂ and CO₂", "read as O₂, N₂, CO₂");
  quirk(acc, file, null, "Burning rate; mm", "unit 'mm'", "Values (0.05–1.06) are droplet burning-rate constants, normally in mm²/s; the unit's superscript appears lost", "unit stated as mm²/s (header reads 'mm')");
  for (const r of rows) {
    const id = r["FLEX Test #"];
    const flags = [];
    const cell = (k) => {
      const v = r[k];
      if (v && /�/.test(v)) {
        quirk(acc, file, id, k, v, "Unreadable character in the cell", "left empty");
        flags.push(`${k} unreadable`);
        return null;
      }
      return num(v);
    };
    let p = cell("Ambient pressure; mmHg");
    if (p === 0) {
      quirk(acc, file, id, "Ambient pressure; mmHg", "0", "Pressure of 0 mmHg is not physical for a burning test", "left empty");
      flags.push("pressure 0 in table"); p = null;
    }
    const o2 = cell("O initial ambient composition; mole fraction");
    const dext = cell("Visible flame extinction diameter; mm");
    if (dext === 0) flags.push("extinction diameter recorded as 0");
    add({
      id: `${acc}:${id}`, accession: acc, investigation: "FLEX", testId: id, label: r["FLEX Identifier"],
      date: usDate(r["Test Date"], acc, file, id), fuelClass: "droplet", fuel: r["Fuel"],
      o2Pct: o2 == null ? null : round(o2 * 100, 1), o2Role: "ambient",
      pressureKpa: p == null ? null : mmHgToKpa(p),
      diluentPct: {
        n2: round((cell("N initial ambient composition; mole fraction") ?? 0) * 100, 1),
        co2: round((cell("CO initial ambient composition; mole fraction") ?? 0) * 100, 1),
        he: round((cell("He initial ambient composition; mole fraction") ?? 0) * 100, 1),
      },
      outcome: r["Test end"] || null,
      measured: Object.fromEntries(
        [
          ["initialDiameter", cell("Droplet initial diameter; mm"), "mm"],
          ["extinctionDiameter", dext, "mm"],
          ["burningRate", cell("Burning rate; mm"), "mm²/s"],
          ["burnTime", cell("Burn time; s"), "s"],
        ].filter(([, v]) => v != null).map(([k, v, u]) => [k, { value: v, unit: u }]),
      ),
      flags, raw: r,
    });
  }
}

// ---------- PSI-68 FLEX-2 (test matrix, not individual tests) ----------
{
  const acc = "PSI-68", { file, rows } = load("PSI-68");
  quirk(acc, file, null, "table", "8 rows", "The table lists the planned range for each fuel, not individual tests", "kept as a test matrix, not plotted as tests");
  for (const r of rows)
    matrices.push({
      accession: acc, investigation: "FLEX-2", fuel: r["Sample (Fuel Type)"], fuelClass: "droplet",
      o2Pct: r["Oxygen Mole Fraction"].split(";").map((x) => round(Number(x) * 100, 0)),
      pressureKpa: r["Ambient Pressure (atm)"].replace(/or/g, "").split(";").map((x) => atmToKpa(Number(x))),
      diluent: r["Ambient Gas Mixture"], initialDiameterMm: r["Initial Droplet Diameter (mm)"], flowCms: r["Flow Velocity (cm/s)"], raw: r,
    });
}

// ---------- PSI-39 CFI ----------
{
  const acc = "PSI-39", { file, rows } = load("PSI-39");
  for (const r of rows) {
    const id = r["Flex Number"];
    const p = num(r["Pressure"].replace(/atm/i, ""));
    const o2 = num(r["Oxygen"]);
    add({
      id: `${acc}:${id}`, accession: acc, investigation: "CFI", testId: id, label: r["CIR"],
      date: r["Test Date"] || null, fuelClass: "droplet", fuel: r["Fuel"],
      o2Pct: o2 == null ? null : round(o2 * 100, 1), o2Role: "ambient",
      pressureKpa: p == null ? null : atmToKpa(p),
      diluentPct: { n2: round((num(r["Nitrogen"]) ?? 0) * 100, 1), he: round((num(r["Helium"]) ?? 0) * 100, 1) },
      outcome: null,
      measured: r["Fiber"] ? { fiberSupported: { value: r["Fiber"], unit: "" } } : {},
      flags: r["Fiber"] ? [] : ["fibre support not recorded"], raw: r,
    });
  }
}

// ---------- PSI-159 CFI-G ----------
for (const [suffix, role] of [["Normal", "ambient"], ["Inverse", "oxidizer stream"]]) {
  const acc = "PSI-159", { file, rows } = load(`PSI-159_Experimental_table_CFI-G_${suffix}`);
  const yesNo = new Set();
  for (const r of rows) {
    const id = `${suffix[0]}-${r["Test"].replace(/\s+/g, "")}`;
    const o2 = num(role === "ambient" ? r["XO2 before test"] : r["XO2"]);
    const p = num(r["approx p (bar)"]);
    const hot = (r["Hot ignition"] || "").toLowerCase();
    if (r["Hot ignition"]) yesNo.add(r["Hot ignition"]);
    const coolNote = r["Cool flame?"] || "";
    add({
      id: `${acc}:${id}`, accession: acc, investigation: "ACME CFI-G", testId: id, label: `${suffix} flame, day ${r["Day"]}`,
      date: null, fuelClass: "gas", fuel: r["Fuel"],
      o2Pct: o2 == null ? null : round(o2 * 100, 1), o2Role: role,
      pressureKpa: p == null ? null : barToKpa(p),
      outcome: hot ? (hot === "flash" ? "flash ignition" : hot === "yes" ? "hot flame ignited" : "no hot ignition") : null,
      measured: Object.fromEntries(
        [
          ["burnTime", num(r["burn time (sec)"]), "s"],
          ["adiabaticFlameTemperature", num(r["Tad (K)"]), "K (calculated)"],
          ["peakBurnerTemperature", num(r["Peak burner T (C )"] ?? r["Peak burner Temp (C)"]), "°C"],
        ].filter(([, v]) => v != null).map(([k, v, u]) => [k, { value: v, unit: u }]),
      ),
      flags: [
        ...(role === "oxidizer stream" ? ["inverse flame: oxygen fraction is the burner's oxidizer stream, not the chamber"] : []),
        ...(/yes/i.test(coolNote) ? [`cool flame noted (${coolNote})`] : []),
        ...(r["Self-ext or flow term"] === "SE" ? ["self-extinguished"] : r["Self-ext or flow term"] === "FT" ? ["flow terminated"] : []),
      ],
      raw: r,
    });
  }
  if (yesNo.size > 2)
    quirk(acc, file, null, "Hot ignition", [...yesNo].join(" / "), "Inconsistent spelling of yes/no values", "normalised case; 'flash' kept as its own outcome");
}

// ---------- PSI-10 Flame Design ----------
for (const [suffix, role] of [["Normal_Flame", "ambient"], ["Inverse_Flame", "oxidizer stream"]]) {
  const acc = "PSI-10", { file, rows } = load(`PSI-10_Experimental_table_Flame_Design_${suffix}`);
  let ramped = 0;
  for (const r of rows) {
    const id = `${suffix[0]}-${r["Test"]}`;
    const o2 = num(role === "ambient" ? r["XO2 (init)"] : r["XO2"]);
    const p = num(r["pmean (atm)"]);
    const isRamped = Object.values(r).some((v) => v === "RAMPED");
    if (isRamped) ramped++;
    add({
      id: `${acc}:${id}`, accession: acc, investigation: "ACME Flame Design", testId: id, label: `${suffix.split("_")[0]} flame, day ${r["Day"]}`,
      date: null, fuelClass: "gas", fuel: r["Fuel"] || "C2H4",
      o2Pct: o2 == null ? null : round(o2 * 100, 1), o2Role: role,
      pressureKpa: p == null ? null : atmToKpa(p),
      measured: Object.fromEntries(
        [["adiabaticFlameTemperature", num(r["Tad (K)"]), "K (calculated)"], ["stoichiometricMixtureFraction", num(r["mean Zst"]), ""]]
          .filter(([, v]) => v != null).map(([k, v, u]) => [k, { value: v, unit: u }]),
      ),
      flags: [
        ...(role === "oxidizer stream" ? ["inverse flame: oxygen fraction is the burner's oxidizer stream, not the chamber"] : []),
        ...(isRamped ? ["flow ramped during test; flow values not single numbers"] : []),
      ],
      raw: r,
    });
  }
  if (ramped) quirk(acc, file, null, "flow columns", "RAMPED", `${ramped} tests list 'RAMPED' instead of a number`, "kept as text; derived values left empty");
}

// ---------- PSI-20 ACME BRE (test-day level) ----------
{
  const acc = "PSI-20", { file, rows } = load("PSI-20");
  quirk(acc, file, null, "Oxygen Conc (percent)", "per test day", "Oxygen levels are listed per test day, not per flame, and only for flames that ignited", "one record per day and oxygen level; flame count is per day");
  for (const r of rows) {
    const day = `${r["Year"]}-${r["Month"]}-${r["Date"]}`;
    let list = r["Oxygen Conc (percent)"];
    if (/^\d+00%$/.test(list)) {
      const fixed = String(Number(list.replace("%", "")) / 100);
      quirk(acc, file, day, "Oxygen Conc (percent)", list, "Spreadsheet percent formatting multiplied the value by 100", `read as ${fixed}%`);
      list = fixed;
    }
    for (const v of list.split(";").map((x) => num(x)).filter((x) => x != null))
      add({
        id: `${acc}:${day}:${v}`, accession: acc, investigation: "ACME BRE", testId: `${day} · ${v}% O₂`, label: `${r["Burner Size (mm)"]} mm burner`,
        date: day, fuelClass: "gas", fuel: r["Fuel Bottle"], o2Pct: v, o2Role: "ambient",
        outcome: Number(r["Flames Ignited"]) > 0 ? `${r["Flames Ignited"]} flames ignited that day (all oxygen levels)` : "no flames ignited that day",
        flags: ["test-day record; pressure not listed"], raw: r,
      });
  }
}

// ---------- PSI-23 ACME s-Flame (test-day level) ----------
{
  const acc = "PSI-23", { file, rows } = load("PSI-23");
  for (const r of rows) {
    const day = r["Test Day*"];
    for (const k of ["Atmosphere*", "Fuel Bottle"]) {
      const m = r[k].match(/\bN([3-9])\b/);
      if (m) {
        quirk(acc, file, day, k, r[k], "Spreadsheet autofill turned 'N2' into an incrementing label", "read as N₂");
        r[k] = r[k].replace(/\bN[3-9]\b/, "N2");
      }
    }
    const levels = [...r["Atmosphere*"].matchAll(/~?(\d+)%\s*O2/g, "")].map((m) => Number(m[1]));
    const both = r["Atmosphere*"].match(/~(\d+)% and ~(\d+)% O2/);
    const o2s = both ? [Number(both[1]), Number(both[2])] : levels;
    for (const o of o2s)
      add({
        id: `${acc}:${day}:${o}`, accession: acc, investigation: "ACME s-Flame", testId: `${day} · ~${o}% O₂`, label: r["Test Type"],
        date: yyddd(day), fuelClass: "gas", fuel: r["Fuel Bottle"], o2Pct: o, o2Role: "ambient",
        pressureKpa: 101.3,
        outcome: `${r["Flames Ignited*"]} flames ignited that day`,
        flags: ["test-day record; oxygen approximate (~)", "pressure ~1 atm per table note (rises with vitiation)"], raw: r,
      });
  }
}

// ---------- PSI-21 ACME CLD Flame (test-day level, no oxygen listed) ----------
{
  const acc = "PSI-21", { file, rows } = load("PSI-21");
  let fixed = 0;
  for (const r of rows) {
    const day = r["Test Day"];
    const base = /methane/i.test(r["Test Type"]) ? "CH4" : /ethylene/i.test(r["Test Type"]) ? "C2H4" : null;
    let fuel = r["Fuel Bottle"];
    const m = fuel.match(/(CH\d+|C2H\d+)$/);
    if (m && !["CH4", "C2H4"].includes(m[1])) {
      const to = m[1].startsWith("C2") ? "C2H4" : "CH4";
      if (!base || base === to) {
        fuel = fuel.replace(m[1], to); fixed++;
      }
    }
    add({
      id: `${acc}:${day}`, accession: acc, investigation: "ACME CLD Flame", testId: day, label: r["Test Type"],
      date: yyddd(day), fuelClass: "gas", fuel,
      outcome: `${r["Flames ignited"]} flames ignited that day`,
      measured: { fuelConcentrationRange: { value: r["Fuel conc. Range"], unit: "% fuel in nitrogen" } },
      flags: ["test-day record; oxygen and pressure not listed", ...(fuel !== r["Fuel Bottle"] ? [`fuel corrected from '${r["Fuel Bottle"]}'`] : [])],
      raw: r,
    });
  }
  quirk(acc, file, null, "Fuel Bottle", "40% CH4, 40% CH5, 40% CH6 … 40% CH14; 100% C2H4 … C2H11", `Spreadsheet autofill incremented the chemical formula down the column (${fixed} rows)`, "read as CH₄ or C₂H₄, matching each row's test type; original kept in raw");
}

// ---------- PSI-22 ACME E-FIELD Flames (test-day level) ----------
{
  const acc = "PSI-22", { file, rows } = load("PSI-22");
  let last = null; const seen = new Set();
  for (const r of rows) {
    if (!r["Test Day"]) {
      if (last && r["Fuel Conc"]) last.measured.fuelConcentrations.value.push(r["Fuel Conc"]);
      continue;
    }
    const key = `${r["Test Day"]}|${r["Fuel Bottle"]}|${r["Mesh Polarity"]}`;
    if (seen.has(key)) {
      quirk(acc, file, r["Test Day"], "row", key, "The same test day appears twice with identical values", "second copy dropped");
      last = null; continue;
    }
    seen.add(key);
    add({
      id: `${acc}:${r["Test Day"]}`, accession: acc, investigation: "ACME E-FIELD Flames", testId: r["Test Day"], label: r["Test Type"],
      date: yyddd(r["Test Day"]), fuelClass: "gas", fuel: r["Fuel Bottle"],
      outcome: `${r["Flames Ignited"]} flames ignited that day`,
      measured: { meshPolarity: { value: r["Mesh Polarity"], unit: "" }, fuelConcentrations: { value: [r["Fuel Conc"]], unit: "% fuel in nitrogen" } },
      flags: ["test-day record; oxygen and pressure not listed"], raw: r,
    });
    last = tests.at(-1);
  }
}

// ---------- PSI-106 SLICE (test-day level) ----------
{
  const acc = "PSI-106", { file, rows } = load("PSI-106");
  for (const r of rows) {
    const m = r["Test Date"].match(/^(\d{4}-[A-Z]{3}-\d{2})\s*(.*)$/);
    if (m && m[2]) quirk(acc, file, m[1], "Test Date", r["Test Date"], "Notes typed into the date column", "date kept; note kept in raw");
    add({
      id: `${acc}:${m ? m[1] : r.__line}`, accession: acc, investigation: "SLICE", testId: m ? m[1] : r["Test Date"], label: "SLICE test day",
      date: m ? m[1] : null, fuelClass: "gas", fuel: r["Fuel Type"].replace(/\s+including.*$|\s+where.*$/i, ""),
      flags: ["test-day record; oxygen and pressure not listed"], raw: r,
    });
  }
}

// ---------- PSI-107 SPICE ----------
{
  const acc = "PSI-107", { file, rows } = load("PSI-107");
  const seen = new Map(); let dups = 0;
  rows.forEach((r, i) => {
    const key = JSON.stringify({ ...r, __line: 0 });
    if (seen.has(key)) dups++;
    seen.set(key, true);
    add({
      id: `${acc}:${i + 1}`, accession: acc, investigation: "SPICE", testId: String(i + 1), label: `GMT day ${r["GMT date"]}, ignition ${r["GMT ignition"]}`,
      date: null, fuelClass: "gas", fuel: r["Fuel"].replace(/\s*%\s*/, "% "),
      flowCms: num(r["Air Rate (cm/s)"]),
      measured: Object.fromEntries(
        [["nozzleDiameter", num(r["Nozzle (mm)"]), "mm"], ["fuelFlow", num(r["Fuel Rate (mg/s)"]), "mg/s"]]
          .filter(([, v]) => v != null).map(([k, v, u]) => [k, { value: v, unit: u }]),
      ),
      flags: ["cabin air; oxygen and pressure not listed"], raw: r,
    });
  });
  if (dups) quirk(acc, file, null, "rows", `${dups} rows`, "Rows repeat exactly (same ignition, fuel and flow)", "kept; each row may be a separate condition within one ignition");
}

// ---------- PSI-25 BASS-II ----------
{
  const acc = "PSI-25", { file, rows } = load("PSI-25");
  const reportRuns = new Map(bassReport.series.map((s) => [s.testId, s]));
  for (const r of rows) {
    const id = r["Test #"];
    const flags = [];
    const o2i = num(r["Calibrated initial O2 % by vol"]);
    let o2f = num(r["Calibrated final O2 % by vol"]);
    if (o2f != null && (o2f < 10 || o2f > 25)) {
      quirk(acc, file, id, "Calibrated final O2 % by vol", r["Calibrated final O2 % by vol"], "Implausible final oxygen for a cabin-scale test (outside 10–25%)", "not used");
      flags.push("final oxygen implausible; not used"); o2f = null;
    }
    for (const k of ["Initial CO (ppm)", "Final CO (ppm)", "Initial CO2 % by vol", "Final CO2 % by vol"]) {
      const v = r[k];
      if (v && num(v) == null) flags.push(`${k}: '${v}'`);
      if (num(v) != null && num(v) < 0) flags.push(`${k}: negative reading ${v}`);
    }
    const flows = (r["Air display"].match(/\d+(\.\d+)?/g) || []).map(Number).filter((x) => x <= 45);
    if (/no ign/i.test(r["Air display"])) flags.push("did not ignite at any flow");
    if (flows.length > 1) flags.push("several flow settings during the test");
    const rep = reportRuns.get(id);
    add({
      id: `${acc}:${id}`, accession: acc, investigation: "BASS-II", testId: id, label: `PI ${r["PI"]}, sample ${r["Sample #"]}`,
      date: usDate(r["Date"], acc, file, id), fuelClass: "solid", fuel: r["Fuel Sample Material"],
      o2Pct: o2i, o2Role: "ambient", flowCms: flows[0] ?? null,
      outcome: /no ign/i.test(r["Air display"]) ? "no ignition at any flow" : null,
      measured: Object.fromEntries(
        [
          ["finalOxygen", o2f, "% by volume"],
          ["flowSettings", flows.length ? flows : null, "cm/s (air display, in order)"],
          ["initialCO2", num(r["Initial CO2 % by vol"]), "% by volume"],
          ["finalCO2", num(r["Final CO2 % by vol"]), "% by volume"],
          ["initialCO", num(r["Initial CO (ppm)"]), "ppm"],
          ["finalCO", num(r["Final CO (ppm)"]), "ppm"],
          ["spreadRates", rep ? rep.points.map((p) => ({ airflowCms: p.airflowCms, spreadRateMms: p.spreadRateMms })) : null, "mm/s (Table 5.1, NASA/TM-20210011385)"],
        ].filter(([, v]) => v != null).map(([k, v, u]) => [k, { value: v, unit: u }]),
      ),
      flags: [...flags, "pressure not listed (ISS cabin)"], raw: r,
    });
  }
  quirk(acc, file, null, "CO / CO2 columns", "none, OR, over, -1", "Text and negative values in numeric gas columns", "left empty; text kept as a flag");
  quirk(acc, file, null, "Fan display / Air display", "e.g. '10  20  18'", "Several flow settings written in one cell", "parsed in order as flow settings; first used as the test's flow");
}

// ---------- PSI-26 BASS ----------
{
  const acc = "PSI-26", { file, rows } = load("PSI-26");
  for (const r of rows) {
    const id = r["As Run Test #"];
    add({
      id: `${acc}:${id}`, accession: acc, investigation: "BASS", testId: id, label: `planned test ${r["Test #"]}, sample ${r["Sample #"]}`,
      date: usDate(r["Date"], acc, file, id), fuelClass: "solid", fuel: r["Fuel Sample Material"],
      flags: ["oxygen, pressure and flow not listed"], raw: r,
    });
  }
}

// ---------- Saffire I–III (PSI-98, -99, -100) ----------
{
  const parseO2 = (s) => {
    const r = String(s).match(/(\d+(\.\d+)?)\s*(?:-|to)\s*(\d+(\.\d+)?)/);
    if (r) return { value: round((Number(r[1]) + Number(r[3])) / 2, 2), range: [Number(r[1]), Number(r[3])] };
    const v = num(String(s).replace("~", ""));
    return v == null ? null : { value: v, approx: /~/.test(s) };
  };
  for (const [acc, name] of [["PSI-98", "Saffire-I"], ["PSI-99", "Saffire-II"], ["PSI-100", "Saffire-III"]]) {
    const { file, rows } = load(acc + "_");
    for (const r of rows) {
      const id = r["Sample Number"];
      if (!/^S?\d|^\d-\d/.test(id)) {
        quirk(acc, file, /^F\d/.test(id) ? id : "note row", "Sample Number", id.slice(0, 60), "Note or flow-visualisation row inside the test table", "not a test; skipped");
        continue;
      }
      const flags = [];
      const material = r["Material"] || null;
      if (!material) { quirk(acc, file, id, "Material", "", "Material cell left blank", "left empty"); flags.push("material blank in table"); }
      const thick = r["Sample Thickness (cm)"] ?? r["Samle Thickness"] ?? r["Sample Thickness"];
      if (/^0\d/.test(thick || "")) { quirk(acc, file, id, "thickness", thick, "Decimal point missing ('037 mm')", "not interpreted"); flags.push(`thickness written '${thick}'`); }
      const o2 = parseO2(r["Percent O2"] ?? r["Percent O2 (Note 1)"] ?? "");
      const flow = num(String(r["Air Flow (cm/s)"] ?? r["Air Flow"] ?? "").replace(/cm\/s/, ""));
      const measured = {};
      if (name === "Saffire-II") {
        for (const [k, label] of [["?-g Burn Length", "microgravityBurnLength"], ["?-g Spread Length", "microgravitySpreadRate"], ["1-g Burn Length", "normalGravityBurnLength"], ["1-g Spread Rate", "normalGravitySpreadRate"]])
          if (r[k]) measured[label] = { value: r[k], unit: "as written" };
      }
      if (r["Burn Time (s)"]) measured.burnTime = { value: num(r["Burn Time (s)"]) ?? r["Burn Time (s)"], unit: num(r["Burn Time (s)"]) == null ? "as written" : "s" };
      add({
        id: `${acc}:${id}`, accession: acc, investigation: name, testId: id, label: `${r["Flow Direction"] || r["Direction"] || ""} flow`.trim(),
        date: null, fuelClass: "solid", fuel: material ?? "not recorded",
        o2Pct: o2?.value ?? null, o2Role: o2 ? "ambient" : null, flowCms: flow,
        measured, flags: [...flags, ...(o2?.approx ? ["oxygen approximate (~)"] : []), ...(o2?.range ? [`oxygen ${o2.range[0]}–${o2.range[1]}% during test`] : []), "pressure not listed", "Cygnus spacecraft"],
        platform: "Cygnus", raw: r,
      });
    }
    if (name === "Saffire-II")
      quirk(acc, file, null, "?-g columns", "?-g Burn Length", "The µ in 'µg' was lost and shows as '?'", "read as microgravity");
  }
  quirk("PSI-98", null, null, "Flight Platform (catalogue)", "International Space Station (ISS)", "Saffire-I and -III are listed under the ISS platform; their hardware field and NASA reports place them in the Cygnus spacecraft", "platform recorded as Cygnus");
}

// ---------- Saffire IV–VI (NASA ICES-2024-365, not in PSI) ----------
for (const t of saffire.tests.filter((x) => x.oxygenPct != null)) {
  add({
    id: `ICES-2024-365:${t.id}`, accession: null, source: "saffire6-paper", investigation: t.flight ?? "Saffire IV–VI", testId: t.id, label: t.materialDetail,
    date: null, fuelClass: "solid", fuel: t.material,
    o2Pct: t.oxygenPct, o2Role: "ambient", pressureKpa: t.pressureKpa, flowCms: t.airflowCms,
    outcome: t.burnDurationS ? `burned ${t.burnDurationS} s` : null,
    measured: Object.fromEntries(
      [["peakHeatRelease", t.peakHeatReleaseW, "W"], ["averageHeatRelease", t.averageHeatReleaseW, "W"], ["co2Increase", t.co2IncreasePpm, "ppm"], ["coIncrease", t.coIncreasePpm, "ppm"]]
        .filter(([, v]) => v != null).map(([k, v, u]) => [k, { value: v, unit: u }]),
    ),
    flags: ["Cygnus spacecraft", "from NASA paper Tables 1–2 (not a PSI table)"], platform: "Cygnus", raw: null,
  });
}

// ---------- SAME (PSI-102), SAME-R (PSI-101), DAFT (PSI-47) ----------
{
  let acc = "PSI-102", { file, rows } = load("PSI-102");
  for (const r of rows) {
    const same = /same conditions as/i.test(r["Sample Material"]);
    if (same) quirk(acc, file, r["Sample #"], "Sample Material", r["Sample Material"], "Conditions given as 'same as 1–4' instead of values", "values left empty, not copied");
    add({
      id: `${acc}:${r["Sample #"]}`, accession: acc, investigation: "SAME", testId: r["Sample #"], label: "smoke sample",
      date: null, fuelClass: "smoke", fuel: r["Sample Material"].split(":")[0].trim(), flowCms: num(r["Air Flow (cm/s)"]),
      measured: Object.fromEntries(
        [["weightLossRate", num(r["Weight loss rate (mg/min)"]), "mg/min"], ["agingDuration", num(r["Aging Duration (minutes)"]), "min"]]
          .filter(([, v]) => v != null).map(([k, v, u]) => [k, { value: v, unit: u }]),
      ),
      flags: same ? ["conditions 'same as 1–4'"] : [], raw: r,
    });
  }
  ({ file, rows } = load("PSI-101")); acc = "PSI-101";
  quirk(acc, file, null, "Date", "21-Jul", "Dates have no year", "year 2010 taken from the investigation dates (Jul–Sep 2010), noted in each record");
  for (const r of rows) {
    add({
      id: `${acc}:${r["SAME Test #"]}`, accession: acc, investigation: "SAME-R", testId: r["SAME Test #"], label: r["Description"],
      date: r["Date"] ? `${r["Date"]}-2010` : null, fuelClass: "smoke", fuel: r["Sample Type"], flowCms: num(r["Inlet velocity (cm/s)"]),
      measured: Object.fromEntries(
        [["heaterResistanceRatio", num(r["Rt/R0"]), "Rt/R0"], ["duration", num(r["Duration (sec)"]), "s"], ["netAgingTime", num(r["Net aging time (sec)"]), "s"]]
          .filter(([, v]) => v != null).map(([k, v, u]) => [k, { value: v, unit: u }]),
      ),
      flags: ["year inferred (2010)"], raw: r,
    });
  }
  ({ file, rows } = load("PSI-47")); acc = "PSI-47";
  for (const r of rows)
    add({
      id: `${acc}:${r["Session Name"]}`, accession: acc, investigation: "DAFT / DAFT-2", testId: r["Session Name"], label: r["Hardware Description"],
      date: r["Actual Day"], fuelClass: "smoke", fuel: r["Sample Material"].replace(/ in combination.*$/, ""),
      measured: { sampledLocation: { value: r["Sampled Location"], unit: "" } }, flags: ["dust aerosol, not combustion smoke"], raw: r,
    });
}

// ---------- summaries ----------
const byInv = new Map();
for (const t of tests) {
  const k = t.investigation;
  const s = byInv.get(k) ?? { investigation: k, accession: t.accession, source: t.accession ? "PSI" : "NASA paper", fuelClass: t.fuelClass, records: 0, withOxygen: 0, withPressure: 0, o2: [], p: [], fuels: new Set() };
  s.records++;
  if (t.o2Pct != null && t.o2Role === "ambient") { s.withOxygen++; s.o2.push(t.o2Pct); }
  if (t.pressureKpa != null) { s.withPressure++; s.p.push(t.pressureKpa); }
  s.fuels.add(t.fuel);
  byInv.set(k, s);
}
const summaries = [...byInv.values()].map((s) => ({
  investigation: s.investigation, accession: s.accession, source: s.source, fuelClass: s.fuelClass, records: s.records,
  withAmbientOxygen: s.withOxygen, withPressure: s.withPressure,
  ambientO2Pct: s.o2.length ? [Math.min(...s.o2), Math.max(...s.o2)] : null,
  pressureKpa: s.p.length ? [Math.min(...s.p), Math.max(...s.p)] : null,
  fuels: [...s.fuels].slice(0, 12),
}));

// One quirk entry per (table, field, issue), listing the affected tests.
const grouped = [];
for (const q of quirks) {
  const g = grouped.find((x) => x.accession === q.accession && x.field === q.field && x.note === q.note);
  if (g) {
    if (q.testId != null) g.tests.push(q.testId);
    if (g.examples.length < 3 && q.raw && !g.examples.includes(q.raw)) g.examples.push(q.raw);
  } else grouped.push({ accession: q.accession, file: q.file, field: q.field, note: q.note, action: q.action, tests: q.testId != null ? [q.testId] : [], examples: q.raw ? [q.raw] : [] });
}
const affectedCells = quirks.filter((q) => q.testId != null).length;

const out = {
  schemaVersion: 1,
  built: RETRIEVED,
  description: "One record per NASA combustion test row from PSI experimental tables (plus Saffire IV–VI from NASA ICES-2024-365). Units converted in code: mmHg, atm and bar to kPa; mole fraction to percent. Raw cells kept in `raw`.",
  sources: { manifest: "data/psi/manifest.json", catalog: "data/psi/catalog.json" },
  counts: {
    records: tests.length,
    investigations: summaries.length,
    plottable: tests.filter((t) => t.o2Pct != null && t.pressureKpa != null && t.o2Role === "ambient").length,
    quirks: grouped.length,
    quirkCells: affectedCells,
  },
  summaries, quirks: grouped, matrices, tests,
};
fs.writeFileSync(path.join(root, "data/tests.json"), JSON.stringify(out));
// Compact file for the browser: tests with an oxygen value, the fields the
// comparison and map need, and the PSI record link.
const compact = tests
  .filter((t) => t.o2Pct != null)
  .map((t) => ({
    id: t.id, a: t.accession, inv: t.investigation, t: t.testId, c: t.fuelClass, f: t.fuel,
    o2: t.o2Pct, r: t.o2Role === "ambient" ? 1 : 0, p: t.pressureKpa, v: t.flowCms,
    o: t.outcome, d: t.date,
  }));
fs.writeFileSync(path.join(root, "data/tests-compact.json"), JSON.stringify({ built: RETRIEVED, records: compact }));
// Small file for the browser: counts, per-investigation summaries and quirks.
fs.writeFileSync(path.join(root, "data/tests-meta.json"), JSON.stringify({ built: RETRIEVED, counts: out.counts, summaries, quirks: grouped.map(({ file: _f, ...q }) => ({ ...q, tests: q.tests.slice(0, 12), testCount: q.tests.length })), matrices: matrices.map(({ raw: _r, ...m }) => m) }, null, 1));
console.log(JSON.stringify(out.counts));
for (const s of summaries) console.log(`${(s.accession ?? "paper").padEnd(8)} ${s.investigation.padEnd(20)} ${String(s.records).padStart(4)}  O2 ${JSON.stringify(s.ambientO2Pct)}  P ${JSON.stringify(s.pressureKpa)}`);
