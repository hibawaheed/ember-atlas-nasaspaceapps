import { missionQuerySchema, rankInvestigations } from "@/lib/investigations";
import { badRequest, readBody } from "@/lib/http";
export async function POST(request: Request) {
  try {
    const query = missionQuerySchema.parse(await readBody(request));
    return Response.json({
      query,
      investigations: rankInvestigations(query),
      rubric:
        "See each result's reasons. Authored relevance rubric for reading priority, not AI, confidence or hazard.",
      evidenceGap:
        query.destination === "orbit"
          ? "Vehicle-specific validation required."
          : "The challenge statement (checked November 13, 2026) reports no partial-gravity combustion data in NASA's Physical Sciences Informatics (PSI) archive. NASA drop-tower tests published outside PSI measured flammability limits at lunar and Martian gravity for three materials (see /api/partial-gravity).",
      checkedAt: "2026-11-14",
    });
  } catch (error) {
    return badRequest(error);
  }
}
