import { z } from "zod";
export const importedRowSchema = z.object({
  testId: z.string().trim().min(1).max(80),
  airflowCms: z.number().min(0).max(1000),
  spreadRateMms: z.number().min(0).max(10000),
  sourceUrl: z
    .url()
    .refine((v) => v.startsWith("https://"), "Use an HTTPS source URL"),
  material: z.string().max(120).default("unspecified"),
});
export const importSchema = z.object({
  label: z.string().min(1).max(120),
  rows: z.array(importedRowSchema).min(1).max(1000),
});
export type ImportedDataset = z.infer<typeof importSchema>;
// RFC 4180-style quoted fields, escaped quotes, CRLF, and embedded newlines.
export function parseCSV(input: string) {
  const records: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '"') {
      if (quoted && input[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && input[i + 1] === "\n") i++;
      row.push(field);
      if (row.some(Boolean)) records.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (quoted) throw new Error("Unclosed quote in CSV.");
  row.push(field);
  if (row.some(Boolean)) records.push(row);
  if (records.length < 2)
    throw new Error("Include a header and at least one data row.");
  const header = records.shift()!.map((x) => x.trim().replace(/^\uFEFF/, ""));
  if (new Set(header).size !== header.length)
    throw new Error("Duplicate column headers.");
  const required = ["testId", "airflowCms", "spreadRateMms", "sourceUrl"];
  if (required.some((k) => !header.includes(k)))
    throw new Error("Required columns: " + required.join(", "));
  return records.map((r) => {
    if (r.length !== header.length)
      throw new Error("Inconsistent number of columns.");
    const obj = Object.fromEntries(header.map((k, i) => [k, r[i]]));
    for (const k of ["airflowCms", "spreadRateMms"]) {
      if (!obj[k].trim()) throw new Error("Numeric cells cannot be blank.");
    }
    return {
      ...obj,
      testId: obj.testId,
      sourceUrl: obj.sourceUrl,
      material: obj.material,
      airflowCms: Number(obj.airflowCms),
      spreadRateMms: Number(obj.spreadRateMms),
    };
  });
}
