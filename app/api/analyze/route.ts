import { z } from "zod";
import { scenarioSchema, modelScenario, scenarioNotes } from "@/lib/scenario";
import { rankForScenario } from "@/lib/evidence";
import { readBody, badRequest } from "@/lib/http";
import { interpretScenario, aiEnabled } from "@/lib/synthesis";
import { allowAiCall, visitorKey } from "@/lib/rate-limit";
import { replaySchema, lookupReplay } from "@/lib/replay";
export const maxDuration = 30;
export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    const scenario = scenarioSchema.parse(body);
    const replay = lookupReplay(replaySchema.parse(body?.replay));
    const model = modelScenario(scenario);
    const insights = scenarioNotes(scenario);
    const evidence = rankForScenario(scenario);
    // stage "notes" answers instantly without AI; stage "ai" returns only the
    // AI interpretation; no stage does both in one request.
    const stage = body?.stage === "notes" || body?.stage === "ai" ? body.stage : "both";
    if (stage === "notes")
      return Response.json({ scenario, model, insights, evidence, replay: replay ?? null, ai: { mode: aiEnabled() ? "pending" : "authored" } });
    const allowed = aiEnabled() ? allowAiCall(visitorKey(request)) : true;
    const ai = await interpretScenario(
      { scenario, partialPressureKpa: model.partialPressure, notes: insights, evidence, replay },
      allowed,
    );
    if (stage === "ai") return Response.json({ ai });
    return Response.json({
      scenario,
      model,
      insights,
      evidence,
      replay: replay ?? null,
      ai,
      ranking:
        "BM25 text relevance with scenario-derived query; not hazard or certainty",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return badRequest(e);
  }
}
