import corpus from "@/data/evidence.json";
import type { Scenario } from "./scenario";
export const sources = corpus.sources;
export const findings = corpus.findings;
export type Finding = (typeof findings)[number];
const stop = new Set(
  "the a an and or to of in on for with is are how does what why can do it be as from at that this about tell me best good top give make write please would could should you your i my we our which who".split(
    " ",
  ),
);
const synonyms: Record<string, string[]> = {
  airflow: ["ventilation", "flow"],
  air: ["ventilation", "flow"],
  round: ["spherical", "shape"],
  sphere: ["spherical", "shape"],
  oxygen: ["atmosphere", "atmospheres"],
  moon: ["partial", "gravity", "exploration"],
  mars: ["partial", "gravity", "exploration"],
  danger: ["safety", "hazards"],
  hot: ["heat", "temperature"],
  invisible: ["cool", "detection"],
  out: ["extinction"],
  plastic: ["pmma", "solid"],
  fire: ["flame", "combustion"],
  fires: ["flames", "combustion"],
  alarm: ["smoke", "detection", "sensor"],
  detector: ["detection", "sensor", "smoke"],
  extinguish: ["extinction", "suppression"],
  astronaut: ["spacecraft", "safety"],
};
export function tokens(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, " ")
    .split(/[\s-]+/)
    .filter((x) => x.length > 1 && !stop.has(x));
}
const docs = findings.map((f) =>
  tokens(
    [f.title, f.claim, f.safetyImplication, f.experiment, ...f.tags].join(" "),
  ),
);
const avgLength = docs.reduce((n, d) => n + d.length, 0) / docs.length;
export function retrieve(query: string, limit = 6) {
  const original = [...new Set(tokens(query))];
  const terms = [
    ...new Set(original.flatMap((t) => [t, ...(synonyms[t] || [])])),
  ];
  return findings
    .map((finding, i) => {
      const doc = docs[i];
      let score = 0;
      const matched: string[] = [];
      for (const term of terms) {
        const tf = doc.filter((t) => t === term).length;
        if (!tf) continue;
        matched.push(term);
        const df = docs.filter((d) => d.includes(term)).length;
        const idf = Math.log(1 + (docs.length - df + 0.5) / (df + 0.5));
        score +=
          ((idf * (tf * 2.2)) /
            (tf + 1.2 * (0.25 + (0.75 * doc.length) / avgLength))) *
          (original.includes(term) ? 1 : 0.55);
      }
      return { ...finding, score: Number(score.toFixed(3)), matched };
    })
    .filter((f) => !terms.length || f.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit);
}
export function rankForScenario(s: Scenario) {
  let query = `${s.fuel === "droplet" ? "FLEX liquid cool flames" : s.fuel === "pmma" ? "BASS PMMA solid spread" : "solid fuel"} ${s.gravity === "earth" ? "" : "microgravity"} ventilation ${s.airflow < 2 ? "extinction zero flow" : ""} ${s.oxygen >= 28 ? "oxygen exploration atmospheres" : ""} ${s.pressure < 80 ? "pressure" : ""}`;
  return retrieve(query, 5);
}
export function sourceFor(id: string) {
  return sources.find((s) => s.id === id);
}
// Below this BM25 score the best match is too weak to answer from.
export const MIN_RELEVANCE = 1.5;
export function answerFromEvidence(question: string) {
  const matches = retrieve(question, 6);
  if (!matches.length || matches[0].score < MIN_RELEVANCE)
    return {
      mode: "retrieval" as const,
      answer:
        "That question is outside the curated NASA fire-safety evidence, so there is no source-backed answer. Try asking about airflow, cool flames, oxygen, extinction, smoke detection, suppression, or PMMA flame spread.",
      citations: [],
      findings: [],
      confidence: "insufficient evidence",
    };
  return {
    mode: "retrieval" as const,
    answer: matches
      .slice(0, 3)
      .map(
        (f, i) =>
          `${f.claim} [${i + 1}]\nInterpretation: ${f.safetyImplication}\nScope: ${f.limitations}`,
      )
      .join("\n\n"),
    citations: matches
      .slice(0, 3)
      .map((f, i) => ({
        number: i + 1,
        findingId: f.id,
        ...sourceFor(f.sourceIds[0]),
      })),
    findings: matches,
    confidence: "source-backed retrieval; interpretation is an inference",
  };
}
