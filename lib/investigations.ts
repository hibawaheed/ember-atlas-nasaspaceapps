import { z } from "zod";
import testMeta from "@/data/tests-meta.json";
import { testRecords, testsAtAtmosphere } from "./nearest";
export const missionQuerySchema = z.object({
  destination: z.enum(["orbit", "moon", "mars", "rover"]),
  priority: z.enum(["prevention", "detection", "suppression"]),
});
export type MissionQuery = z.infer<typeof missionQuerySchema>;
export type Priority = MissionQuery["priority"];
export const destinations = {
  orbit: {
    name: "Orbital habitat",
    gravity: "Microgravity",
    symbol: "◎",
    question: "What changes when hot gases no longer rise?",
    note: "ISS and free-flying spacecraft research provides relevant microgravity context. Your particular cabin still needs its own validation.",
  },
  moon: {
    name: "Lunar base",
    gravity: "~0.166 g",
    symbol: "☾",
    question: "Which evidence can inform a new atmosphere?",
    note: "The challenge statement expects 30% oxygen or more at 10.2 psi or less in a Moon base and rovers. NASA ran droplet fires at exactly that atmosphere (FLEX) and drop-tower flammability tests at lunar gravity (outside PSI, which holds no partial-gravity data); no solid-material fire has been run at both.",
  },
  mars: {
    name: "Mars habitat",
    gravity: "~0.38 g",
    symbol: "◉",
    question: "What do we know before a long stay?",
    note: "Microgravity results can guide research questions, but cannot validate a Martian-gravity prediction. Treat the transfer from orbit to a surface habitat as an open research problem.",
  },
  rover: {
    name: "Pressurized rover",
    gravity: "Surface gravity",
    symbol: "◇",
    question: "How do materials, airflow, and detection meet?",
    note: "This is a habitable pressurized rover, not a rocket or propellant system. Atmosphere, compact geometry, and ventilation are research inputs; no vehicle certification is implied.",
  },
};
export const investigations = [
  {
    id: "bass",
    hardware: "MSG · SPICE flow duct",
    related: "BASS, BASS-II, SPICE and SLICE share this duct.",
    gravityProbe: false,
    name: "BASS-II",
    subtitle: "Burning & suppression of solids",
    phase: "Solid",
    facility: "ISS · Microgravity Science Glovebox",
    geometry:
      "Clear cast PMMA strips, 1–5 mm thick, 1.2 or 2.2 cm wide, burning on one or both sides.",
    objective:
      "Understand solid-fuel flame spread and extinction under controlled flow.",
    variables:
      "Flow velocity, oxygen concentration, material and sample geometry. Oxygen changed within the displayed runs.",
    measurements:
      "Flame-spread rate from imaging: a Nikon digital camera viewing the sample from above and an HD video camera viewing its edge through a mirror (images tracked with NASA's Spotlight-16). A radiometer measured flame intensity, an anemometer measured inlet air velocity, and a fan set the airflow. Oxygen and burn time were logged (report p. 56).",
    output:
      "251 test records from PSI-25 and PSI-26 (materials, oxygen, flow settings, CO and CO₂), plus 39 flame-spread rates from 18 runs (Table 5.1).",
    priorities: ["prevention", "suppression"] as Priority[],
    atmosphere: true,
    sources: ["bass-report", "psi-bass", "researchers-guide"],
    findings: ["bass-flow", "bass-calorimetry", "bass-nitrogen-jet", "bass-hypothesis"],
    limitation:
      "Oxygen fell in every run and samples differ in several ways at once. No per-point uncertainty; no independently controlled airflow effect.",
  },
  {
    id: "same",
    hardware: "MSG · SAME instrument suite",
    related: "SAME and SAME-R; one detector was reused for DAFT and DAFT-2 dust tests.",
    gravityProbe: false,
    name: "SAME / SAME-R",
    subtitle: "Smoke & aerosol measurement",
    phase: "Overheated solids / aerosols",
    facility: "ISS · Microgravity Science Glovebox",
    geometry:
      "Smoke produced from representative spacecraft materials; no sample dimensions imported.",
    objective:
      "Characterize smoke particles and evaluate detection technologies in microgravity.",
    variables:
      "Material and smoke-particle properties; exact test settings require the source files.",
    measurements:
      "Moments of the particle-size distribution and smoke detector response.",
    output:
      "119 test records from PSI-102, PSI-101 and PSI-47 (materials, airflow, heating and aging times). No detector time series imported.",
    priorities: ["detection"] as Priority[],
    atmosphere: false,
    sources: ["same-overview", "psi-same", "challenge-2026"],
    findings: ["same-particles", "same-detectors", "daft-instrument"],
    limitation:
      "The overview states objectives, not alarm thresholds or a certified detector comparison.",
  },
  {
    id: "flex",
    hardware: "CIR · MDCA droplet apparatus",
    related: "FLEX, FLEX-2 and the Cool Flames Investigation (CFI) used the MDCA.",
    gravityProbe: false,
    name: "FLEX",
    subtitle: "Flame extinguishment experiment",
    phase: "Liquid droplets",
    facility: "ISS · CIR / droplet apparatus",
    geometry:
      "Heptane and methanol droplets, 1–5 mm, free-floating or fiber-supported, in the MDCA (0–3 atm, up to 40% oxygen).",
    objective:
      "Investigate extinction limits and gaseous suppression of droplet combustion.",
    variables:
      "Fuel, droplet size, pressure, oxygen and inert diluent (nitrogen, CO₂, helium or xenon). FLEX-2 added fuel mixtures, surrogates, soot and droplet arrays.",
    measurements:
      "Droplet and flame imaging; observations of extinction and cool-flame behavior.",
    output:
      "361 droplet test records from PSI-69 and PSI-39 (fuel, pressure, oxygen, diluents, burning rate, how each test ended). No droplet time series imported.",
    priorities: ["suppression", "detection"] as Priority[],
    atmosphere: true,
    sources: ["flex-operations", "psi-flex", "researchers-guide"],
    findings: ["flex-cool", "flex-suppression", "flex-inert-margin", "flex2-scope", "cool-flame-persistence"],
    limitation:
      "Droplet chemistry is not interchangeable with a fabric or polymer fire.",
  },
  {
    id: "saffire",
    hardware: "Cygnus · Saffire flow unit",
    related: "Saffire-I through -VI flew on separate uncrewed Cygnus missions.",
    gravityProbe: false,
    name: "Saffire",
    subtitle: "Spacecraft-scale fire research",
    phase: "Solid materials",
    facility: "Uncrewed Cygnus spacecraft",
    geometry:
      "Larger samples than ISS-contained tests; geometry varies by Saffire campaign.",
    objective:
      "Study flame growth and combustion products at spacecraft-relevant scales.",
    variables:
      "Sample, ventilation and atmosphere; later campaigns explored reduced pressure and elevated oxygen.",
    measurements:
      "Flame imaging and combustion-product measurements, including gases.",
    output:
      "18 test records: Saffire-I to -III from PSI-98, -99, -100 and Saffire IV–VI from NASA ICES-2024-365 (materials, oxygen, pressure, flow, heat release). No raw cabin data imported.",
    priorities: ["prevention", "detection"] as Priority[],
    atmosphere: true,
    sources: ["saffire-overview", "saffire-results", "saffire-v"],
    findings: ["saffire-oxygen", "saffire-gas-hazard"],
    limitation:
      "Campaigns differ. Results cannot directly set limits for a different crew vehicle.",
  },
  {
    id: "acme",
    hardware: "CIR · ACME modular hardware",
    related: "Six ACME experiments, including BRE, E-FIELD Flames and CFI-G, shared this hardware.",
    gravityProbe: false,
    name: "ACME",
    subtitle: "Six experiments, shared hardware",
    phase: "Gaseous fuels",
    facility: "ISS · Combustion Integrated Rack",
    geometry:
      "Burner shapes and configurations vary across six investigations.",
    objective:
      "Investigate flame structure, stability and combustion physics without strong buoyancy.",
    variables:
      "Burner configuration, gas composition, flow and experiment-specific controls.",
    measurements:
      "Flame observations across more than 1,500 flames reported by NASA.",
    output:
      "Program overview; its experiments' test tables (BRE, CFI-G, Flame Design, s-Flame, CLD Flame, E-FIELD) are imported individually.",
    priorities: ["prevention", "suppression"] as Priority[],
    atmosphere: true,
    sources: ["acme-results"],
    findings: ["acme-zero-flow", "acme-radiation"],
    limitation:
      "ACME is a suite, not one comparable experiment. Burner flames are not direct solid-material tests.",
  },
  {
    id: "sofie",
    hardware: "CIR · SoFIE facility",
    related: "SoFIE hosts several solid-fuel studies, including SoFIE-GEL.",
    gravityProbe: false,
    name: "SoFIE-GEL",
    subtitle: "Growth & extinction limits",
    phase: "Solid",
    facility: "ISS · Combustion Integrated Rack",
    geometry:
      "Solid-fuel specimens with defined geometry; dimensions are not imported here.",
    objective:
      "Study how heating and flow affect growth and extinction of solid flames.",
    variables: "Fuel thermal history, imposed heating and airflow.",
    measurements: "Flame-growth and extinction observations described by NASA.",
    output:
      "Investigation description and NASA imagery; no quantitative series imported.",
    priorities: ["prevention", "suppression"] as Priority[],
    atmosphere: false,
    sources: ["sofie-gel", "sofie-imagery"],
    findings: ["sofie-gel-variables", "sofie-self-flow"],
    limitation:
      "A linked research program does not imply a validated predictive model in this demo.",
  },
  {
    id: "bre",
    hardware: "CIR · ACME modular hardware",
    related: "One of six ACME experiments sharing burners, chamber and diagnostics.",
    gravityProbe: true,
    name: "BRE",
    subtitle: "Burning rate emulator",
    phase: "Gaseous fuel emulating solids & liquids",
    facility: "ISS · Combustion Integrated Rack",
    geometry:
      "Flat porous burner fed with gaseous fuel, flow controlled from measured heat flux to mimic paper, plastic or alcohol.",
    objective:
      "Screen material flammability by burning gas under conditions matched to solid and liquid materials.",
    variables:
      "Fuel gas and flow chosen to emulate a material; atmosphere and flow conditions.",
    measurements: "Heat feedback to the burner, flame behavior and extinction.",
    output: "43 test-day records from PSI-20 (burner size, fuel, oxygen 21–40%, flames ignited).",
    priorities: ["prevention"] as Priority[],
    atmosphere: true,
    sources: ["bre-page", "acme-facility", "researchers-guide"],
    findings: ["bre-emulation"],
    limitation:
      "Emulation must be shown to match real materials before results are used to select them.",
  },
  {
    id: "efield",
    hardware: "CIR · ACME modular hardware",
    related: "One of six ACME experiments sharing burners, chamber and diagnostics.",
    gravityProbe: true,
    name: "E-FIELD Flames",
    subtitle: "Electric fields on diffusion flames",
    phase: "Gaseous fuel",
    facility: "ISS · Combustion Integrated Rack",
    geometry: "Burner and mesh electrode with up to 10,000 V between them.",
    objective:
      "Understand flame ion production and how an electric field can control flames.",
    variables: "Applied voltage, fuel and flow conditions.",
    measurements: "Flame shape, soot and stability limits under an ion wind.",
    output: "20 test-day records from PSI-22 (mesh polarity, fuel, flames ignited).",
    priorities: [] as Priority[],
    atmosphere: false,
    sources: ["efield-page", "challenge-2026"],
    findings: ["efield-gravity"],
    limitation:
      "Mimics a body force through ions, not buoyancy. NASA says it does not serve space applications directly.",
  },
  {
    id: "cfig",
    hardware: "CIR · ACME modular hardware",
    related: "One of six ACME experiments sharing burners, chamber and diagnostics.",
    gravityProbe: false,
    name: "CFI-G",
    subtitle: "Cool flames with gases",
    phase: "Gaseous fuel",
    facility: "ISS · Combustion Integrated Rack",
    geometry:
      "Spherical burner releasing oxygen-nitrogen mix into a chamber of nitrogen and fuel gas (inside-out flame).",
    objective:
      "Study cool and inside-out flames, including the highest-oxygen microgravity tests.",
    variables: "Oxygen fraction (up to 85%), fuel gas such as propane, chamber mix.",
    measurements: "Flame observations; detailed diagnostics are in the source files.",
    output: "333 test records from PSI-159 (fuel, oxygen, pressure, hot ignition, burn time, self-extinction).",
    priorities: [] as Priority[],
    atmosphere: true,
    sources: ["challenge-2026"],
    findings: ["cfig-oxygen"],
    limitation:
      "Inside-out gaseous flames are not cabin material fires; only the oxygen range is directly relevant.",
  },
  {
    id: "spice",
    hardware: "MSG · SPICE flow duct",
    related: "BASS, BASS-II, SPICE and SLICE share this duct.",
    gravityProbe: false,
    name: "SPICE & SLICE",
    subtitle: "Smoke point, structure & liftoff",
    phase: "Gaseous fuel",
    facility: "ISS · Microgravity Science Glovebox",
    geometry:
      "Laminar gas-jet diffusion flames with co-flowing air in the fan-driven MSG duct later reused by BASS.",
    objective:
      "SPICE (2009) studied the transition from non-sooting to sooting flames (smoke point). SLICE (completed 2012) studied lifted flames.",
    variables: "Fuel flow, co-flow velocity and fuel type.",
    measurements: "Flame imaging of soot emission and flame liftoff.",
    output: "481 test records from PSI-107 and PSI-106 (fuel, nozzle, fuel and air flow).",
    priorities: [] as Priority[],
    atmosphere: false,
    sources: ["challenge-2026", "researchers-guide"],
    findings: ["spice-smoke-point", "slice-liftoff"],
    limitation:
      "Gas-jet soot and liftoff studies, not material fire tests. Most useful as shared-hardware context for BASS.",
  },
];

// Ranking metadata, derived from the imported NASA test tables
// (data/tests-meta.json): how many test records each profile has, the chamber
// oxygen and pressure they cover, and how many sit near the Moon base
// atmosphere. Parent programs are shown as background, not ranked.
const tablesFor: Record<string, string[]> = {
  bass: ["BASS-II", "BASS"],
  same: ["SAME", "SAME-R", "DAFT / DAFT-2"],
  flex: ["FLEX", "CFI"],
  saffire: ["Saffire-I", "Saffire-II", "Saffire-III", "Saffire IV", "Saffire V", "Saffire VI"],
  bre: ["ACME BRE"],
  efield: ["ACME E-FIELD Flames"],
  cfig: ["ACME CFI-G"],
  spice: ["SPICE", "SLICE"],
  sofie: [],
};
const parents: Record<string, string> = { cfig: "acme", bre: "acme", efield: "acme" };
const programs = new Set(["acme"]);
const MOON = { oxygen: 30, pressure: 70.3 };
// Experiments with a measured result on exactly this question (shown as the
// worked example above the ranking).
const measuredExample: Record<string, string> = { detection: "saffire", suppression: "flex" };
const measuredExampleLabel: Record<string, string> = {
  detection: "Recorded smoke-detector and particle response during a fire (Saffire VI-3)",
  suppression: "Measured extinction with CO₂ and helium dilution (FLEX)",
};
const span = (xs: number[], unit: string) => (xs.length ? (Math.min(...xs) === Math.max(...xs) ? `${xs[0]}${unit}` : `${Math.min(...xs)}–${Math.max(...xs)}${unit}`) : null);

export function dataFor(id: string) {
  const names = tablesFor[id] ?? [];
  const sums = testMeta.summaries.filter((x) => names.includes(x.investigation));
  const records = sums.reduce((n, x) => n + x.records, 0);
  const o2 = sums.flatMap((x) => x.ambientO2Pct ?? []);
  const p = sums.flatMap((x) => x.pressureKpa ?? []);
  const mine = testRecords.filter((t) => names.includes(t.inv) && t.r === 1);
  const nearMoonO2 = mine.filter((t) => Math.abs(t.o2 - MOON.oxygen) <= 2).length;
  const atMoon = testsAtAtmosphere(MOON).filter((t) => names.includes(t.inv)).length;
  return {
    records,
    accessions: [...new Set(sums.map((x) => x.accession ?? "NASA paper"))],
    oxygen: span(o2, "%"),
    pressure: span(p, " kPa"),
    nearMoonO2,
    atMoon,
    summary: records
      ? `${records.toLocaleString("en-US")} NASA test records (${[...new Set(sums.map((x) => x.accession ?? "ICES-2024-365"))].join(", ")}); chamber oxygen ${span(o2, "%") ?? "not listed"}, pressure ${span(p, " kPa") ?? "not listed"}.`
      : "No NASA test table imported (not in PSI yet); findings only.",
  };
}

const priorityPhrase = {
  prevention: "material flammability and fire growth",
  detection: "smoke and fire detection",
  suppression: "extinction and suppression",
};

// Authored, disclosed research-priority rubric. Never a hazard/confidence score.
export function rankInvestigations(query: MissionQuery) {
  const surface = query.destination !== "orbit";
  const ranked = investigations
    .filter((item) => !programs.has(item.id))
    .map((item) => {
      const data = dataFor(item.id);
      const matches = item.priorities.includes(query.priority);
      const reasons = [{ label: "Microgravity research context", points: 1 }];
      if (matches) reasons.push({ label: `Addresses ${query.priority}`, points: 4 });
      if (data.records)
        reasons.push(
          matches
            ? { label: `${data.records} NASA test records in this atlas`, points: 3 }
            : { label: `${data.records} NASA test records (background for this question)`, points: 1 },
        );
      if (surface && data.nearMoonO2)
        reasons.push({ label: `${data.nearMoonO2} tests within 2 points of 30% oxygen`, points: matches ? 2 : 1 });
      if (surface && data.atMoon && query.priority !== "detection")
        reasons.push({ label: `${data.atMoon} tests at the Moon base atmosphere`, points: 1 });
      if (surface && item.atmosphere && query.priority !== "detection")
        reasons.push({ label: "Atmosphere variables for exploration questions", points: 2 });
      if (surface && item.gravityProbe)
        reasons.push({ label: "Probes gravity dependence", points: 1 });
      if (measuredExample[query.priority] === item.id)
        reasons.push({ label: measuredExampleLabel[query.priority], points: 1 });
      const reason = [
        matches
          ? `Addresses ${priorityPhrase[query.priority]}.`
          : `Background only: does not directly address ${priorityPhrase[query.priority]}.`,
        data.summary,
        surface && data.atMoon ? `${data.atMoon} of its tests ran at the Moon base atmosphere (30% oxygen, about 70 kPa).` : surface && data.nearMoonO2 ? `${data.nearMoonO2} of its tests ran within 2 points of 30% oxygen.` : "",
        surface && data.records ? "All in microgravity." : "",
      ]
        .filter(Boolean)
        .join(" ");
      return {
        ...item,
        parent: parents[item.id] ?? null,
        measuredInAtlas: data.records > 0,
        testRecords: data.records,
        score: reasons.reduce((s, r) => s + r.points, 0),
        reasons,
        reason,
        tieNote: "",
        transfer: surface
          ? "Partial-gravity validation missing"
          : "Microgravity context; vehicle validation missing",
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(b.priorities[0] === query.priority) - Number(a.priorities[0] === query.priority) ||
        Number(b.measuredInAtlas) - Number(a.measuredInAtlas) ||
        b.findings.length - a.findings.length ||
        a.name.localeCompare(b.name),
    );
  for (const r of ranked) {
    const tied = ranked.filter((o) => o !== r && o.score === r.score).map((o) => o.name);
    if (tied.length)
      r.tieNote = `Tied at ${r.score} point${r.score === 1 ? "" : "s"} with ${tied.join(", ")}; ordered by primary focus, then measured data, then number of cited findings.`;
  }
  return ranked;
}

/** Parent programs shown as background navigation beside the ranked experiments. */
export function programBackground() {
  return investigations
    .filter((i) => programs.has(i.id))
    .map((p) => ({
      id: p.id,
      name: p.name,
      subtitle: p.subtitle,
      objective: p.objective,
      children: investigations.filter((c) => parents[c.id] === p.id).map((c) => c.name),
      sources: p.sources,
    }));
}

export function hardwareGroups() {
  const groups = new Map<string, { names: string[]; note: string }>();
  for (const i of investigations) {
    const g = groups.get(i.hardware) ?? { names: [], note: i.related };
    g.names.push(i.name);
    groups.set(i.hardware, g);
  }
  return [...groups].map(([hardware, g]) => ({ hardware, ...g }));
}

import type { LinkKey } from "./links";
// Earth applications named in the challenge statement and NASA investigation pages.
export const earthApplications: { title: string; text: string; source: string; links?: LinkKey[] }[] = [
  {
    title: "Fine-water-mist extinguishers",
    text: "Developed for use on the ISS, with practical uses on Earth.",
    source: "challenge-2026",
  },
  {
    title: "Smoke detection",
    text: "A shuttle-era NASA fire detector that tells combustion particles from dust became an early-warning system for places like mines; SAME later studied smoke and detectors in orbit.",
    source: "challenge-2026",
    links: ["spinoffFireDetector"] as LinkKey[],
  },
  {
    title: "Firefighter clothing and air tanks",
    text: "Spacesuit materials and breathing technology were adapted for firefighter clothing and lighter air tanks.",
    source: "challenge-2026",
    links: ["spinoffAirTanks", "spinoffFireAttire"] as LinkKey[],
  },
  {
    title: "Faster material screening",
    text: "BRE's burner emulation aims to speed up selecting fire-resistant materials, which NASA says could also improve fire safety on Earth.",
    source: "bre-page",
  },
  {
    title: "Cleaner combustion",
    text: "Electric fields that control flames could cut soot and pollutants in practical burners.",
    source: "efield-page",
  },
];
