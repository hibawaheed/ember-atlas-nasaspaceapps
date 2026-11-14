import { z } from "zod";
import { readBody, badRequest } from "@/lib/http";
import { investigations, rankInvestigations, missionQuerySchema } from "@/lib/investigations";
import { findings } from "@/lib/evidence";
import { explainComparison, aiEnabled } from "@/lib/synthesis";
import { allowAiCall, visitorKey } from "@/lib/rate-limit";
export const maxDuration = 30;
const ids = new Set(investigations.map((i) => i.id));
const schema = missionQuerySchema.extend({
  ids: z.array(z.string().refine((id) => ids.has(id))).min(2).max(3),
});
export async function POST(request: Request) {
  try {
    const { ids: picked, destination, priority } = schema.parse(await readBody(request));
    const ranked = rankInvestigations({ destination, priority });
    const profiles = picked.map((id) => {
      const r = ranked.find((i) => i.id === id)!;
      return {
        id: r.id,
        name: r.name,
        phase: r.phase,
        hardware: r.hardware,
        geometry: r.geometry,
        objective: r.objective,
        variables: r.variables,
        measurements: r.measurements,
        limitation: r.limitation,
        score: r.score,
        reasons: r.reasons,
        findings: r.findings
          .map((fid) => findings.find((f) => f.id === fid))
          .filter((f): f is NonNullable<typeof f> => !!f)
          .map((f) => ({ id: f.id, claim: f.claim, limitations: f.limitations })),
      };
    });
    const allowed = aiEnabled() ? allowAiCall(visitorKey(request)) : true;
    return Response.json(await explainComparison({ destination, priority, profiles }, allowed));
  } catch (e) {
    return badRequest(e);
  }
}
