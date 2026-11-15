import { z } from "zod";
import { scenarioSchema, modelScenario, scenarioNotes } from "@/lib/scenario";
import { rankForScenario } from "@/lib/evidence";
import { readBody, badRequest } from "@/lib/http";
import { interpretScenario, aiEnabled } from "@/lib/synthesis";
import { allowAiCall, visitorKey } from "@/lib/rate-limit";
import { cacheGet, cacheSet } from "@/lib/answer-cache";
import { replaySchema, lookupReplay } from "@/lib/replay";
import { nearestTests, fuelClassOf, testsAtAtmosphere } from "@/lib/nearest";
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
    const key = `analyze:${JSON.stringify(scenario)}:${JSON.stringify(replay ?? null)}`;
    const cachedAi = cacheGet<{ mode: string }>(key);
    if (cachedAi && stage === "ai") return Response.json({ ai: { ...cachedAi, cached: true } });
    const allowed = cachedAi ? true : aiEnabled() ? allowAiCall(visitorKey(request)) : true;
    const nearest = [
      ...testsAtAtmosphere(scenario).slice(0, 3),
      ...nearestTests(scenario, fuelClassOf(scenario), 3).map((n) => n.test),
    ].map((t) => `${t.inv} test ${t.t}: ${t.f}, ${t.o2}% O2, ${t.p ?? "pressure not listed"} kPa, ${t.v ?? "flow not listed"} cm/s, outcome ${t.o ?? "not listed"} (microgravity)`);
    const ai = cachedAi ?? await interpretScenario(
      { scenario, partialPressureKpa: model.partialPressure, notes: insights, evidence, replay, nearestMeasured: [...new Set(nearest)] },
      allowed,
    );
    if (ai.mode === "generative") cacheSet(key, ai);
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
