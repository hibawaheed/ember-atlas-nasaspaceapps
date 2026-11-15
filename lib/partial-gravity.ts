import pg from "@/data/partial-gravity.json";

// Measured flammability limits at 0g*, lunar, Martian and Earth gravity
// (Olson & Ferkul 2012, Table I). Mean limit = (ULOI + MOC) / 2, as in the paper.
export const partialGravity = pg;
export type GravityKey = "zero" | "lunar" | "martian" | "earth";
export const meanLimit = (m: (typeof pg.materials)[number], k: GravityKey) => (m.limits[k].ULOI + m.limits[k].MOC) / 2;

/** Materials whose mean partial-gravity limit is below both their 0g* and 1-g limits. */
export function worseThanBothEnds(k: "lunar" | "martian") {
  return pg.materials.filter((m) => meanLimit(m, k) < meanLimit(m, "zero") && meanLimit(m, k) < meanLimit(m, "earth")).map((m) => m.material);
}

export function lunarGravityHeadline() {
  const mylar = pg.materials[0];
  return {
    text: `In NASA drop-tower tests, Mylar kept burning down to ${mylar.limits.lunar.ULOI}% oxygen at lunar gravity, against ${mylar.limits.zero.ULOI.toFixed(1)}% in microgravity and ${mylar.limits.earth.ULOI}% on Earth, at 10.2 psi. The tests lasted about 5 seconds.`,
    href: pg.source.pdfUrl + "#page=6",
    label: "NASA NTRS 20130010991, Table I",
  };
}

/** Plain-text inventory line for the AI. */
export const partialGravityInventory = `Measured partial-gravity flammability limits (Olson & Ferkul, NASA, ICES 2012, Table I; drop-tower tests of about 5 s, published outside PSI; lunar and 0g rows from Ferkul & Olson 2011): ${pg.materials
  .map((m) => `${m.material} at ${m.pressurePsia} psia — limiting oxygen (ULOI/MOC, mol %): Earth ${m.limits.earth.ULOI}/${m.limits.earth.MOC}, Martian ${m.limits.martian.ULOI}/${m.limits.martian.MOC}, lunar ${m.limits.lunar.ULOI}/${m.limits.lunar.MOC}, 0g with 30 cm/s flow ${m.limits.zero.ULOI}/${m.limits.zero.MOC}`)
  .join("; ")}. Reduced-gravity limits are defined differently from 1-g limits because of the short test time.`;
