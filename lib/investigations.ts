import { z } from "zod";
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
    note: "The challenge statement expects 30% oxygen or more at 10.2 psi or less in a Moon base and rovers. It also reports that NASA's PSI archive has no partial-gravity combustion data yet (published studies exist outside it); LUCI and FM2 are expected to add some.",
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
      "39 published spread-rate observations from 18 runs (Table 5.1); broader files at PSI.",
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
      "Curated experiment objectives; linked PSI record. No detector time series imported.",
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
      "Source-backed findings and PSI archive link. No raw droplet time series imported.",
    priorities: ["suppression", "detection"] as Priority[],
    atmosphere: true,
    sources: ["flex-operations", "psi-flex", "flex-discovery", "researchers-guide"],
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
      "Research summaries and Saffire-VI presentation; no raw cabin data imported.",
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
      "Curated research overview; the full experimental collection is not ingested.",
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
    output: "NASA investigation description only; no BRE data imported.",
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
    output: "NASA investigation description only; no E-FIELD data imported.",
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
    output: "Described from the challenge statement; no CFI-G data imported.",
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
    output: "Described from NASA's 2015 researcher's guide; no data imported.",
    priorities: [] as Priority[],
    atmosphere: false,
    sources: ["challenge-2026", "researchers-guide"],
    findings: ["spice-smoke-point", "slice-liftoff"],
    limitation:
      "Gas-jet soot and liftoff studies, not material fire tests. Most useful as shared-hardware context for BASS.",
  },
];

// Ranking metadata: what measured data the atlas holds, which oxygen levels are
// known, and parent programs (shown as background, not ranked against their
// own experiments).
const rankMeta: Record<string, { measured?: string; oxygen?: string; nearLunarO2?: boolean; parent?: string; program?: boolean }> = {
  bass: { measured: "39 measured flame-spread values in this atlas", oxygen: "16.8–22.2% O₂ (run start and end values)" },
  saffire: { measured: "5 measured Saffire IV–VI tests in this atlas", oxygen: "22.0–31.0% O₂ at 54–100 kPa", nearLunarO2: true },
  flex: { oxygen: "apparatus allows up to 40% O₂; tested values not yet extracted" },
  cfig: { oxygen: "burner supply up to 85% O₂", parent: "acme" },
  bre: { parent: "acme" },
  efield: { parent: "acme" },
  acme: { program: true },
};
const priorityPhrase = {
  prevention: "material flammability and fire growth",
  detection: "smoke and fire detection",
  suppression: "extinction and suppression",
};

// Authored, disclosed research-priority rubric. Never a hazard/confidence score.
export function rankInvestigations(query: MissionQuery) {
  const surface = query.destination !== "orbit";
  const ranked = investigations
    .filter((item) => !rankMeta[item.id]?.program)
    .map((item) => {
      const meta = rankMeta[item.id] ?? {};
      const matches = item.priorities.includes(query.priority);
      const reasons = [{ label: "Microgravity research context", points: 1 }];
      if (matches) reasons.push({ label: `Addresses ${query.priority}`, points: 4 });
      if (meta.measured)
        reasons.push(
          matches
            ? { label: "Measured data in this atlas", points: 3 }
            : { label: "Measured data in this atlas (background for this question)", points: 1 },
        );
      if (surface && meta.nearLunarO2 && matches)
        reasons.push({ label: "Measured near the Moon base oxygen scenario", points: 2 });
      if (surface && item.atmosphere && query.priority !== "detection")
        reasons.push({ label: "Atmosphere variables for exploration questions", points: 2 });
      if (surface && item.gravityProbe)
        reasons.push({ label: "Probes gravity dependence", points: 1 });
      const reason = [
        matches
          ? `Addresses ${priorityPhrase[query.priority]}.`
          : `Background only: does not directly address ${priorityPhrase[query.priority]}.`,
        meta.measured ? `${meta.measured[0].toUpperCase()}${meta.measured.slice(1)}.` : `${item.findings.length} cited finding${item.findings.length === 1 ? "" : "s"}; no measured values in this atlas.`,
        surface && meta.nearLunarO2 && matches ? "Includes tests within about 1 percentage point of the 30% Moon base scenario." : "",
        meta.oxygen ? `Oxygen: ${meta.oxygen}.` : "Tested oxygen and pressure not recorded here.",
        surface ? "Microgravity only; lunar gravity untested." : "",
      ]
        .filter(Boolean)
        .join(" ");
      return {
        ...item,
        parent: meta.parent ?? null,
        measuredInAtlas: !!meta.measured,
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
      r.tieNote = `Tied at ${r.score} points with ${tied.join(", ")}; ordered by primary focus, then measured data, then number of cited findings.`;
  }
  return ranked;
}

/** Parent programs shown as background navigation beside the ranked experiments. */
export function programBackground() {
  return investigations
    .filter((i) => rankMeta[i.id]?.program)
    .map((p) => ({
      id: p.id,
      name: p.name,
      subtitle: p.subtitle,
      objective: p.objective,
      children: investigations.filter((c) => rankMeta[c.id]?.parent === p.id).map((c) => c.name),
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
