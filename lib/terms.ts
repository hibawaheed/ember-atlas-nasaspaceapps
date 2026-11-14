// Reviewed everyday terms and abbreviations used in search and on evidence cards.
export const materialAliases: { terms: string[]; label: string; token: string }[] = [
  { terms: ["acrylic", "plexiglass", "plexiglas", "perspex", "lucite"], label: "PMMA (acrylic)", token: "pmma" },
  { terms: ["fabric", "cloth", "textile", "clothing"], label: "fabrics (SIBAL cotton-fiberglass cloth, cotton, Nomex)", token: "cotton" },
  { terms: ["fuel droplet", "droplet", "drops", "liquid"], label: "liquid-fuel droplets (FLEX, FLEX-2, CFI)", token: "droplet" },
  { terms: ["smoke alarm", "smoke detector", "alarm"], label: "smoke detection (SAME, Saffire VI-3)", token: "detection" },
  { terms: ["extinguisher", "fire extinguisher"], label: "suppression and suppressants", token: "suppression" },
];

export function relatedTerm(query: string) {
  const q = query.toLowerCase();
  return materialAliases.find((a) => a.terms.some((t) => q.includes(t)) && !q.includes(a.token)) ?? null;
}

export const abbreviations: Record<string, string> = {
  PMMA: "polymethyl methacrylate, acrylic plastic",
  PSI: "NASA’s Physical Sciences Informatics archive",
  ISS: "International Space Station",
  MSG: "Microgravity Science Glovebox",
  CIR: "Combustion Integrated Rack",
  MDCA: "Multi-user Droplet Combustion Apparatus",
  BASS: "Burning and Suppression of Solids",
  FLEX: "Flame Extinguishment Experiment",
  SAME: "Smoke Aerosol Measurement Experiment",
  ACME: "Advanced Combustion via Microgravity Experiments",
  BRE: "Burning Rate Emulator",
  "CFI-G": "Cool Flames Investigation with Gases",
  SoFIE: "Solid Fuel Ignition and Extinction",
  SPICE: "Smoke Point In Co-flow Experiment",
  SLICE: "Structure and Liftoff In Combustion Experiment",
  DAFT: "Dust and Aerosol Measurement Feasibility Test",
  LUCI: "Lunar-g Combustion Investigation",
  FM2: "Flammability of Materials on the Moon",
  SIBAL: "a 75% cotton, 25% fiberglass fabric",
};

/** Abbreviations that appear in a text, expanded once. */
export function expansionsIn(text: string, limit = 3) {
  return Object.entries(abbreviations)
    .filter(([abbr]) => new RegExp(`(^|[^A-Za-z])${abbr.replace("-", "\\-")}([^A-Za-z]|$)`).test(text))
    .slice(0, limit);
}
