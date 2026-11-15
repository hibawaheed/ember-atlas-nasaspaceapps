import { z } from "zod";
import { answerFromEvidence } from "@/lib/evidence";
import { synthesize, streamSynthesis, aiEnabled } from "@/lib/synthesis";
import { buildAskContext } from "@/lib/context";
import { buildDataContext } from "@/lib/data-context";
import { allowAiCall, visitorKey } from "@/lib/rate-limit";
import { readBody, badRequest } from "@/lib/http";
import { cacheGet, cacheSet, normalizeQuestion } from "@/lib/answer-cache";
export const maxDuration = 30;
const schema = z.object({
  question: z.string().trim().min(3).max(800),
  history: z
    .array(z.object({ question: z.string().max(800), answer: z.string().max(4000) }))
    .max(2)
    .optional(),
  stream: z.boolean().optional(),
});
export async function POST(request: Request) {
  try {
    const { question, history = [], stream = false } = schema.parse(await readBody(request));
    const base = buildAskContext(question, history.at(-1)?.question);
    const data = buildDataContext(question, base.followUp ? history.at(-1)?.question : undefined);
    const ctx = { ...base, dataRows: data.rows, dataSummaries: data.summaries };
    const answer = answerFromEvidence(ctx.query);
    const hasEvidence = answer.findings.length > 0 || ctx.profiles.length > 0 || data.rows.length > 0;
    if (!hasEvidence) return Response.json(answer);
    // Stand-alone questions are cached; follow-ups depend on the earlier turn.
    const key = history.length ? null : `ask:${normalizeQuestion(question)}`;
    const cached = key ? cacheGet<Record<string, unknown>>(key) : undefined;
    if (cached) {
      const data = { ...cached, cached: true };
      if (stream)
        return new Response(JSON.stringify({ type: "final", data }) + "\n", {
          headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
        });
      return Response.json(data);
    }
    const allowed = aiEnabled() ? allowAiCall(visitorKey(request)) : true;
    const remember = (r: { mode?: string }) => key && r.mode === "generative" && cacheSet(key, r);
    if (stream)
      return new Response(streamSynthesis(question, answer, allowed, ctx, history, remember), {
        headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
      });
    const result = await synthesize(question, answer, allowed, ctx, history);
    remember(result);
    return Response.json(result);
  } catch (e) {
    return badRequest(e);
  }
}
