import { z } from "zod";
import { answerFromEvidence } from "@/lib/evidence";
import { synthesize, aiEnabled } from "@/lib/synthesis";
import { buildAskContext } from "@/lib/context";
import { allowAiCall, visitorKey } from "@/lib/rate-limit";
import { readBody, badRequest } from "@/lib/http";
export const maxDuration = 30;
const schema = z.object({
  question: z.string().trim().min(3).max(800),
  history: z
    .array(z.object({ question: z.string().max(800), answer: z.string().max(4000) }))
    .max(2)
    .optional(),
});
export async function POST(request: Request) {
  try {
    const { question, history = [] } = schema.parse(await readBody(request));
    const ctx = buildAskContext(question, history.at(-1)?.question);
    const answer = answerFromEvidence(ctx.query);
    const hasEvidence = answer.findings.length > 0 || ctx.profiles.length > 0;
    if (!hasEvidence) return Response.json(answer);
    const allowed = aiEnabled() ? allowAiCall(visitorKey(request)) : true;
    return Response.json(await synthesize(question, answer, allowed, ctx, history));
  } catch (e) {
    return badRequest(e);
  }
}
