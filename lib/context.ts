import { findings, retrieve, tokens, type Finding } from "./evidence";
import { investigations, rankInvestigations, type Priority } from "./investigations";

// Names people use for each investigation profile.
const aliases: Record<string, RegExp> = {
  bass: /\bbass(-?ii|\s?2)?\b|burning and suppression/i,
  same: /\bsame(-?r)?\b|smoke (and )?aerosol|\bdaft(-?2)?\b/i,
  flex: /\bflex(-?2)?\b|flame extinguishment|\bmdca\b|\bcfi\b(?!-g)|cool flames? investigation\b(?! with)/i,
  saffire: /\bsaffire/i,
  acme: /\bacme\b|advanced combustion/i,
  sofie: /\bsofie/i,
  bre: /\bbre\b|burning rate emulator/i,
  efield: /e-?field|electric[- ]field/i,
  cfig: /\bcfi-?g\b|cool flames? (investigation )?with gases/i,
  spice: /\bspice\b|\bslice\b|smoke point|liftoff/i,
};

export function namedInvestigations(text: string) {
  return investigations.filter((i) => aliases[i.id]?.test(text)).map((i) => i.id);
}

const FOLLOW_UP = /\b(it|its|they|them|their|those|these|that|this one|the same)\b/i;

function inferPriority(text: string): Priority {
  if (/detect|smoke|alarm|sensor|particle|aerosol/i.test(text)) return "detection";
  if (/suppress|extinguish|put out|extinction|inert|agent/i.test(text)) return "suppression";
  return "prevention";
}

export type ProfileContext = {
  id: string;
  name: string;
  hardware: string;
  fuel: string;
  geometry: string;
  objective: string;
  variables: string;
  measurements: string;
  dataHere: string;
  limitation: string;
  sources: string[];
};

function profile(id: string): ProfileContext {
  const i = investigations.find((p) => p.id === id)!;
  return {
    id: `profile:${i.id}`,
    name: i.name,
    hardware: `${i.facility} (${i.hardware})`,
    fuel: i.phase,
    geometry: i.geometry,
    objective: i.objective,
    variables: i.variables,
    measurements: i.measurements,
    dataHere: i.output,
    limitation: i.limitation,
    sources: i.sources,
  };
}

/**
 * Evidence the AI may use for one question: retrieved findings (diversified so
 * every named investigation is represented) plus investigation profiles.
 */
export function buildAskContext(question: string, previousQuestion?: string) {
  const followUp =
    !!previousQuestion &&
    (FOLLOW_UP.test(question) || tokens(question).length < 4) &&
    !namedInvestigations(question).length;
  const query = followUp ? `${question} ${previousQuestion}` : question;
  let named = namedInvestigations(query);
  const ranking = /\b(which|most|best|rank|useful|relevant|compare|comparison)\b/i.test(question);

  const picked: Finding[] = [];
  const add = (f?: Finding) => {
    if (f && !picked.some((p) => p.id === f.id)) picked.push(f);
  };
  // Up to two linked findings per named investigation, best-matching first.
  const scored = retrieve(query, 40);
  for (const id of named) {
    const linked = investigations.find((i) => i.id === id)!.findings;
    scored.filter((f) => linked.includes(f.id)).slice(0, 2).forEach(add);
    linked.slice(0, 2).forEach((fid) => picked.length < 8 && add(findings.find((f) => f.id === fid)));
  }
  scored.slice(0, 8).forEach((f) => picked.length < 7 && add(f));

  if (!named.length && ranking && picked.length) {
    named = rankInvestigations({ destination: /moon|lunar|mars|rover|surface/i.test(query) ? "moon" : "orbit", priority: inferPriority(query) })
      .slice(0, 4)
      .map((i) => i.id);
  }
  return {
    query,
    followUp,
    findings: picked.slice(0, 7),
    profiles: named.slice(0, 4).map(profile),
  };
}
