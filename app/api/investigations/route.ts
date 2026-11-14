import { missionQuerySchema, rankInvestigations } from "@/lib/investigations";
import { badRequest, readBody } from "@/lib/http";
export async function POST(request: Request) {
  try {
    const query = missionQuerySchema.parse(await readBody(request));
    return Response.json({
      query,
      investigations: rankInvestigations(query),
      rubric:
        "1 context + 4 priority match + 2 surface-atmosphere relevance. Authored relevance rubric, not AI, confidence, or hazard.",
      evidenceGap:
        query.destination === "orbit"
          ? "Vehicle-specific validation required."
          : "The challenge statement (checked November 13, 2026) reports no partial-gravity combustion data in NASA's Physical Sciences Informatics (PSI) archive. Published partial-gravity experiments exist outside that archive.",
      checkedAt: "2026-11-14",
    });
  } catch (error) {
    return badRequest(error);
  }
}
