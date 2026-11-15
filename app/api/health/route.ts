import { findings, sources } from "@/lib/evidence";
import { investigations } from "@/lib/investigations";
import { testCounts } from "@/lib/tests";
export async function GET() {
  return Response.json({
    status: "ok",
    version: "1.5.0",
    build: process.env.BUILD_COMMIT,
    evidence: findings.length,
    sources: sources.length,
    assistant:
      process.env.ENABLE_GENERATIVE_AI === "true" && process.env.AI_MODEL
        ? "generative-with-retrieval-fallback"
        : "retrieval",
    investigations: investigations.length,
    nasaTests: testCounts.records,
    nasaTestsWithOxygenAndPressure: testCounts.plottable,
    dataQuirksFlagged: testCounts.quirks,
    renderer: "animated-volumetric-and-3d-particles-v2",
    challengeReviewedAt: "2026-11-13",
    simulation: "illustrative-v1",
  });
}
