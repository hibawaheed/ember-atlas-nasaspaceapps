export class InputError extends Error {}
export async function readBody(request: Request, maxBytes = 24000) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > maxBytes) throw new InputError("Request is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new InputError("A JSON body is required.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new InputError("Request is too large.");
    }
    chunks.push(value);
  }
  const all = new Uint8Array(total);
  let offset = 0;
  chunks.forEach((c) => {
    all.set(c, offset);
    offset += c.length;
  });
  try {
    return JSON.parse(new TextDecoder().decode(all));
  } catch {
    throw new InputError("Invalid JSON.");
  }
}
export function badRequest(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof InputError
          ? error.message
          : "Invalid request. Please check the input fields.",
    },
    { status: 400 },
  );
}
