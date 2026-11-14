import { z } from "zod";
export const scenarioSchema = z.object({
  oxygen: z.number().min(15).max(40),
  pressure: z.number().min(50).max(110),
  airflow: z.number().min(0).max(20),
  gravity: z.enum(["micro", "moon", "mars", "earth"]),
  fuel: z.enum(["pmma", "cellulose", "droplet"]),
});
export type Scenario = z.infer<typeof scenarioSchema>;
export const baseline: Scenario = {
  oxygen: 21,
  pressure: 101.3,
  airflow: 5,
  gravity: "micro",
  fuel: "pmma",
};
export const gravityValues = { micro: 0, moon: 0.166, mars: 0.38, earth: 1 };
export const presets: Record<
  string,
  { label: string; description: string; scenario: Scenario }
> = {
  orbit: {
    label: "Orbital laboratory",
    description: "An illustrative atmosphere near Earth ambient conditions.",
    scenario: baseline,
  },
  exploration: {
    label: "Oxygen-enriched habitat",
    description:
      "Hypothetical exploration atmosphere; not a mission specification.",
    scenario: {
      oxygen: 34,
      pressure: 56.5,
      airflow: 8,
      gravity: "micro",
      fuel: "pmma",
    },
  },
  lunar: {
    label: "Lunar habitat (challenge scenario)",
    description:
      "The challenge statement expects a Moon base atmosphere of 30% oxygen or more at 10.2 psi (70.3 kPa) or less. Lunar flame shape remains illustrative.",
    scenario: {
      oxygen: 30,
      pressure: 70.3,
      airflow: 5,
      gravity: "moon",
      fuel: "pmma",
    },
  },
  earth: {
    label: "Earth reference",
    description: "Compare buoyancy-driven shape with microgravity.",
    scenario: { ...baseline, gravity: "earth" },
  },
  still: {
    label: "Quiescent microgravity",
    description: "Explore why zero ventilation is not proof of extinction.",
    scenario: { ...baseline, airflow: 0, fuel: "droplet" },
  },
};
export function modelScenario(s: Scenario) {
  const oxygenFactor = (s.oxygen - 15) / 25;
  const transport = 0.18 + 0.82 * (1 - Math.exp(-s.airflow / 6));
  const pressureFactor = 0.65 + (0.35 * (s.pressure - 50)) / 60;
  const fuelFactor = { pmma: 1, cellulose: 0.88, droplet: 0.72 }[s.fuel];
  const activity = Math.max(
    0.08,
    Math.min(
      1,
      (0.22 + oxygenFactor * 0.68) * transport * pressureFactor * fuelFactor +
        0.12,
    ),
  );
  return {
    activity: Number(activity.toFixed(3)),
    partialPressure: Number(((s.oxygen * s.pressure) / 100).toFixed(2)),
    gravity: gravityValues[s.gravity],
    shape:
      s.gravity === "micro"
        ? s.airflow < 2
          ? "Diffusion-dominated envelope"
          : "Flow-distorted envelope"
        : "Buoyancy-influenced plume",
    modelVersion: "illustrative-v1",
    provenance: "synthetic" as const,
    limitations:
      "An artistic response model, not CFD, a temperature estimate, an extinction boundary, or a fire-risk score. Model coefficients are authored for the demo, not fitted to NASA measurements.",
  };
}
export function scenarioNotes(s: Scenario) {
  const notes = [
    {
      title: "Atmosphere is more than oxygen percentage",
      body: `${s.oxygen}% oxygen at ${s.pressure} kPa gives ${modelScenario(s).partialPressure} kPa oxygen partial pressure. Both concentration and total pressure matter; this arithmetic alone does not determine flammability.`,
      tags: ["oxygen", "pressure"],
    },
  ];
  if (s.gravity !== "earth")
    notes.push({
      title:
        s.airflow < 2
          ? "Still air does not mean a fire is out"
          : "Ventilation becomes part of the experiment",
      body:
        s.airflow < 2
          ? "NASA has observed microgravity combustion persisting under conditions with little or no imposed flow. Do not infer extinction from a smaller visualization."
          : "Without strong buoyancy, imposed flow can shape oxygen delivery and flame spread. Responses depend on fuel, geometry, atmosphere, and flow direction.",
      tags: ["airflow", "extinction"],
    });
  if (s.oxygen >= 28)
    notes.push({
      title: "An enriched atmosphere deserves closer study",
      body: "Saffire-V reported more energetic flames with elevated oxygen. That supports an investigation priority, not a universal numerical hazard threshold.",
      tags: ["oxygen", "Saffire"],
    });
  if (s.fuel === "droplet")
    notes.push({
      title: "Visible flame is an incomplete signal",
      body: "FLEX observed cool-flame combustion after visible hot-flame extinction in some droplet experiments. The rendering does not reproduce that chemistry.",
      tags: ["cool flames", "FLEX"],
    });
  if (s.gravity === "moon" || s.gravity === "mars")
    notes.push({
      title: "Partial gravity is an evidence gap",
      body: "Lunar and Martian settings here interpolate visual shape only. ISS microgravity results cannot simply be relabeled as validated Moon or Mars predictions.",
      tags: ["partial gravity", "limitations"],
    });
  return notes;
}
