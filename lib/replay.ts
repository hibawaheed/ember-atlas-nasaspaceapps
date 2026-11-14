import { z } from "zod";
import measurements from "@/data/measurements.json";
export const replaySchema = z
  .object({ testId: z.string().max(8), index: z.number().int().min(0).max(10) })
  .optional();
// The measurement is looked up on the server; numbers sent by the browser are ignored.
export function lookupReplay(r: z.infer<typeof replaySchema>) {
  if (!r) return undefined;
  const run = measurements.series.find((s) => s.testId === r.testId);
  const point = run?.points[r.index];
  if (!run || !point) return undefined;
  return {
    source: "BASS-II, NASA/TM-20210011385 Table 5.1",
    run: run.testId,
    point: `${r.index + 1} of ${run.points.length}`,
    airflowCms: point.airflowCms,
    spreadRateMms: point.spreadRateMms,
    sample: `${run.thicknessMm} mm thick, ${run.widthCm} cm wide, ${run.sidesBurning === 1 ? "one side" : "two sides"} burning, clear cast PMMA`,
    oxygenVolPct: `${run.initialOxygenVolPct} at start to ${run.finalOxygenVolPct} at end of run (not per point)`,
  };
}
