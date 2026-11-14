import { importSchema, parseCSV } from "@/lib/import";
import { readBody, badRequest, InputError } from "@/lib/http";
export async function POST(request: Request) {
  try {
    const body = await readBody(request, 1000000);
    if (typeof body.csv === "string") {
      try {
        body.rows = parseCSV(body.csv);
      } catch (e) {
        throw new InputError((e as Error).message);
      }
    }
    const data = importSchema.parse(body);
    return Response.json({
      ...data,
      provenance: "user-imported, not NASA-verified",
      persisted: false,
    });
  } catch (e) {
    return badRequest(e);
  }
}
