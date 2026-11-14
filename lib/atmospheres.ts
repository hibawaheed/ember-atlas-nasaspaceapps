// Atmosphere figures quoted in the challenge statement (source "challenge-2026").
// Only oxygen partial-pressure arithmetic is computed. This is not a
// flammability estimate: no validated model maps these values to fire risk.
export const PSI_TO_KPA = 6.894757;
export const atmospheres = [
  {
    id: "earth",
    name: "Earth, sea level",
    oxygenPct: 20.9,
    pressurePsi: 14.7,
    bound: "",
    note: "Reference air. Most flammability tests and ratings are done here.",
  },
  {
    id: "lunar",
    name: "Moon base & rovers (expected)",
    oxygenPct: 30,
    pressurePsi: 10.2,
    bound: "≥30% O₂ at ≤10.2 psi",
    note: "Oxygen partial pressure stays close to Earth's, but the oxygen fraction is over 40% higher, which the challenge says makes materials much more flammable.",
  },
  {
    id: "suit",
    name: "Spacesuit",
    oxygenPct: 100,
    pressurePsi: 4.3,
    bound: "",
    note: "Pure oxygen at low pressure keeps the suit flexible. Astronauts pre-breathe 100% oxygen to avoid the bends; a Moon base atmosphere shortens that pre-breathe.",
  },
].map((a) => {
  const pressureKpa = Number((a.pressurePsi * PSI_TO_KPA).toFixed(1));
  return {
    ...a,
    pressureKpa,
    oxygenPartialKpa: Number(((a.oxygenPct * pressureKpa) / 100).toFixed(1)),
  };
});
