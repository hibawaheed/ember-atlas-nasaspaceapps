import measurements from "@/data/measurements.json";

const runs = measurements.series;
const uniq = (xs: number[]) => [...new Set(xs)].sort((a, b) => a - b);
const range = (xs: number[]) => `${Math.min(...xs)}–${Math.max(...xs)}`;

// Computed from Table 5.1 so the summary cannot drift from the data.
export const bassVariation = {
  varied: [
    { label: "Sample thickness", value: `${uniq(runs.map((r) => r.thicknessMm)).join(", ")} mm` },
    { label: "Sample width", value: `${uniq(runs.map((r) => r.widthCm)).join(" or ")} cm` },
    { label: "Sides burning", value: "one or two" },
    { label: "Airflow (changed within runs)", value: `${range(runs.flatMap((r) => r.points.map((p) => p.airflowCms)))} cm/s` },
    { label: "Oxygen (fell during every run)", value: `${range(runs.flatMap((r) => [r.initialOxygenVolPct, r.finalOxygenVolPct]))} vol%` },
    { label: "Burn time", value: `${range(runs.map((r) => r.burnTimeMin))} min` },
  ],
  constant: [
    { label: "Material", value: "clear cast PMMA" },
    { label: "Flow direction", value: "opposed flow" },
    { label: "Gravity", value: "ISS microgravity" },
    { label: "Hardware", value: "SPICE flow duct in the Microgravity Science Glovebox" },
    { label: "Measured quantity", value: "flame-spread rate (mm/s) from imaging" },
  ],
};
