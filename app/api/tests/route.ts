import { queryTests, testQuerySchema, testSummaries, testCounts, recordLink } from "@/lib/tests";

const numOrUndef = (v: string | null) => (v == null || v === "" ? undefined : Number(v));

/** GET /api/tests?investigation=FLEX&o2Min=29&o2Max=31&format=csv */
export async function GET(request: Request) {
  const u = new URL(request.url).searchParams;
  const parsed = testQuerySchema.safeParse({
    investigation: u.get("investigation") ?? undefined,
    fuelClass: u.get("fuelClass") ?? undefined,
    fuel: u.get("fuel") ?? undefined,
    o2Min: numOrUndef(u.get("o2Min")),
    o2Max: numOrUndef(u.get("o2Max")),
    pressureMin: numOrUndef(u.get("pressureMin")),
    pressureMax: numOrUndef(u.get("pressureMax")),
    sortBy: u.get("sortBy") ?? undefined,
    order: u.get("order") ?? undefined,
    limit: numOrUndef(u.get("limit")) ?? 500,
  });
  if (!parsed.success) return Response.json({ error: "Invalid filter." }, { status: 400 });
  const { total, rows } = queryTests(parsed.data);
  const headers = { "Cache-Control": "public, max-age=3600, s-maxage=86400" };
  if (u.get("format") === "csv") {
    const esc = (v: unknown) => {
      const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const cols = ["id", "accession", "investigation", "testId", "date", "fuelClass", "fuel", "o2Pct", "o2Role", "pressureKpa", "flowCms", "outcome", "measured", "flags", "record"];
    const body = [cols.join(","), ...rows.map((t) => cols.map((c) => esc(c === "record" ? recordLink(t) : (t as Record<string, unknown>)[c])).join(","))].join("\n");
    return new Response(body, { headers: { ...headers, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="nasa-combustion-tests-${rows.length}.csv"` } });
  }
  return Response.json({ counts: testCounts, total, returned: rows.length, filter: parsed.data, rows, summaries: testSummaries }, { headers });
}
