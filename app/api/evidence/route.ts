import { findings, sources, retrieve } from "@/lib/evidence";
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") || "";
  if (q.length > 800)
    return Response.json(
      { error: "Search must be 800 characters or fewer." },
      { status: 400 },
    );
  return Response.json(
    {
      findings: q ? retrieve(q, 50) : findings,
      sources,
      provenance: "curated NASA primary sources",
      retrievedAt: "2026-11-14",
    },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
