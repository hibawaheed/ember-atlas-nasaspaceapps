# Answer check: research companion

Checked November 14, 2026 against `https://emberatlas.tech`, build `8f1f975`, model `anthropic/claude-haiku-5.5` through Vercel AI Gateway. Script: `scripts/ai-eval.mjs` (run with `NODE_USE_ENV_PROXY=1` behind a proxy; add `PACE_MS=61000` for a run that stays under the 10-calls-per-10-minutes visitor limit).

For each answer, the reviewer reads the finding the search step retrieved, the source passage that finding summarizes, and the scope the answer must keep, then notes whether the answer stays inside it. The keyword checks in the script are a first pass. A person still reads the answers.

**Reviewer:** Claude (AI coding assistant), not a combustion scientist. A human review by the team is recorded at the end.

## Scope questions from the review

| Question | Retrieved finding(s) | Source passage the finding summarizes | Expected scope | Answer (opening, verbatim) | Reviewer note |
| --- | --- | --- | --- | --- | --- |
| What lunar-gravity fire measurements does this atlas hold? | `partial-gravity-tests`, `partial-gravity-gap`, `saffire-vi-conditions` | Olson & Ferkul (NTRS, 2012) and the FM2 poster (2025): drop-tower tests at Martian and lunar gravity; some materials burned to lower oxygen in reduced gravity. | The atlas holds **no** measured lunar-gravity record; published short tests exist **outside** PSI. Must not say nobody has tested it. | "This atlas holds no measured lunar-gravity fire records; its measured data come from microgravity tests on the ISS (BASS-II) and spacecraft (Saffire IV–VI). NASA researchers report drop-tower and parabolic-flight flammability tests at lunar and Martian gravity…" | Pass. States the atlas's holdings, then the outside studies, each at its own scope. |
| What does the challenge say about PSI and partial gravity? | `partial-gravity-gap`, `partial-gravity-tests`, `lunar-atmosphere` | Challenge statement (checked Nov 13, 2026): PSI currently holds no partial-gravity combustion data; LUCI and FM2 expected. | Claim limited to **the PSI archive**, attributed to the challenge statement. | "The challenge says PSI holds no partial-gravity combustion data, so its Moon and Mars questions rest on microgravity and Earth-gravity results. Partial-gravity studies exist elsewhere and should be consulted alongside the archive…" | Pass. The qualification is in the same passage as the claim. |
| Has anyone studied flame spread in simulated lunar gravity? | `partial-gravity-tests`, `partial-gravity-gap`, `bass-flow`, `efield-gravity` | As above (Olson & Ferkul; FM2 poster). | Yes, in limited short-duration tests; those measured flammability limits, not spread rate. | "Yes, but only in limited form. NASA has run flammability tests at lunar gravity in short drop-tower and parabolic-flight experiments, and those results concern the oxygen levels at which materials burn rather than flame-spread rate specifically. This atlas holds no measured lunar-gravity records…" | Pass. Correctly separates flammability limits from spread rate. |
| Which measured test is closest to a 30% oxygen Moon base? | `saffire-vi-conditions`, `lunar-atmosphere`, `saffire-atmospheres`, `saffire-oxygen`, `profile:saffire`, … | Saffire VI paper (ICES-2024-365), Table 1: VI-3 two-sided PMMA, 30.3% O₂, 54.6 kPa, 20 cm/s. | Names VI-3 and says pressure, airflow and gravity differ. | "The closest measured test in the atlas is Saffire VI run VI-3, which burned two-sided PMMA at 30.3% oxygen and 54.6 kPa, although that pressure is lower than the 10.2 psi the challenge statement expects for a Moon base. No measured lunar-gravity record exists in the atlas…" | Pass with a note: 54.6 kPa (7.9 psi) is within the statement's "10.2 psi or less", so "lower than" is accurate but could read as out of range. It did not mention the airflow difference in the opening; the site's comparison table does. |

## Unsupported question

| Question | Retrieved finding(s) | Expected | Answer (opening) | Reviewer note |
| --- | --- | --- | --- | --- |
| What is the ignition temperature of Nomex at 30% oxygen on the Moon? | `lunar-atmosphere`, `saffire-vi-conditions`, `partial-gravity-gap` | Says the evidence gives no ignition temperature; invents no number. | In the first run the visitor limit had been reached, so the site answered from retrieval: it showed the lunar-atmosphere finding and gave no temperature. Generative answer: see the rerun below. | Pass in both modes: no temperature is stated. The atlas records that Nomex (VI-1) did not ignite in Saffire VI; it holds no ignition temperature. |

## AI unavailable

The first full run sent 18 questions in a row from one address, so the visitor limit (10 per 10 minutes) engaged after the tenth AI call. Each later request returned the matching NASA findings with the notice "AI answers are paused for you briefly to limit cost; showing source-backed retrieval instead." The lab interpretation fell back to its authored notes and the Mission desk comparison reported `unavailable`, with the rest of the page working. Locally, with `ENABLE_GENERATIVE_AI` unset, `/api/ask` returns `mode: "retrieval"` with the same citations (unit test "assistant handles abstention and sources without external credentials" in `tests/core.test.ts`).

## Earlier cases (unchanged checks)

Eleven earlier cases all passed in the same run: follow-up after SAME, zero-airflow flames, Moon base atmosphere, risk-score refusal, FLEX cool flames, prompt-injection refusal, off-topic decline, smoke-detection experiments, BASS-II sensors, FLEX vs BASS-II, cabin-material reading list. The full output is reproduced by running the script.

## Rerun after the limit window

_Filled in below after the window cleared._
