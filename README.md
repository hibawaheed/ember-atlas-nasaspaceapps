# EMBER Atlas

**Fire, beyond Earth.** A research dashboard that summarizes, ranks and interprets NASA’s microgravity combustion investigations for fire safety in spacecraft, space stations, Moon and Mars bases, and pressurized rovers.

[**Live site: emberatlas.tech**](https://emberatlas.tech) · [Slides (PDF)](submission/EMBER-Atlas-Space-Apps-2026.pdf) · [Submission text](submission/SUBMISSION.md)

Built by **ISL Team A** (Hiba Waheed Ch, Zaafir Abbas Haidrie, Muhammad Ashar Hassan, Amin Adnan Mahmood) for the NASA Space Apps Challenge 2026 challenge **[Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data](https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/)**.

---

## The problem

NASA publishes the results of its ISS combustion experiments through the Physical Sciences Informatics (PSI) system, but, as the challenge puts it, the data is hard to find, harder to compare and harder yet to interpret. Meanwhile, future habitats will burn differently from Earth: a Moon base or pressurized rover is expected to run at **30% oxygen or more and 10.2 psi or less**, and **PSI holds no partial-gravity combustion data yet**.

EMBER Atlas brings that evidence into one place, keeps every number traceable to its NASA source, and uses AI only where it can be grounded in that evidence.

## What you can do

| Area | What it does |
| --- | --- |
| **Combustion lab** | An animated 3D flame that responds to gravity (orbit, Moon, Mars, Earth), oxygen, airflow, cabin pressure and fuel. Compare side by side with Earth, replay the 18 real BASS-II runs, and ask Claude to interpret the setup. Panels compare Earth air, a Moon base and a spacesuit, and explain the partial-gravity data gap. |
| **Mission desk** | Pick a habitat and a safety question (prevention, detection, suppression). Ten investigation profiles are ranked with a visible score, compared side by side, grouped by shared hardware, and explained by Claude on request. Includes an oxygen-coverage chart and a “Back on Earth” applications panel. |
| **Evidence library** | 32 curated findings from 20 NASA sources, searchable and filterable, each with its source, what it means and its limits, labeled Observed, Review or Research aim. |
| **Measured data** | 39 flame-spread measurements from 18 BASS-II runs, with run conditions, a “what varied / what stayed the same” summary, and CSV export. All investigation profiles can be exported too. |
| **Research companion** | Ask a question in plain language. Claude answers from the retrieved NASA findings and investigation profiles, cites every source, handles follow-ups, and declines what the evidence cannot support. |
| **Field guide** | A guided tour, key concepts, the history of spaceflight fires (Apollo 1, Apollo 13, Mir, Artemis II), a glossary and a short quiz. |

## How it works

```text
Browser (Next.js + React)
  ├─ Combustion lab ── Three.js volumetric flame (CPU particle fallback)
  ├─ Charts ────────── SVG, drawn from data/measurements.json
  └─ Questions, lab interpretation, comparisons
        │
        ▼
Next.js route handlers (app/api/*)
  ├─ Validate input (Zod, byte limits)
  ├─ Search findings (BM25 + synonyms, relevance cutoff)
  ├─ Build context: top findings + named investigation profiles + previous turn
  ├─ Rate limit per visitor
  └─ Claude Haiku 5.5 via Vercel AI SDK → Vercel AI Gateway
        │  structured output with the IDs it relied on
        ▼
  Check citations → label as AI → or fall back to the search results
```

### Frontend

- **Next.js 16 (App Router) and React 19.** One client dashboard (`components/dashboard.tsx`) holds the views; the URL keeps the current view and scenario (`?view=lab&scenario=…`) so any state can be shared.
- **3D flame.** `components/flame-scene.tsx` renders a ray-marched volumetric flame with Three.js when WebGL2 is available; `components/canvas-flame.tsx` is a CPU 3D particle fallback. Motion comes from `lib/flame-motion.ts`. Gravity changes the flame from a sphere (microgravity) to a rising teardrop (Earth). The flame is an authored illustration, not a simulation.
- **Design.** A dark galaxy theme with a starfield and an original orbital illustration (`app/globals.css`, `expedition.css`, `instrument.css`, `galaxy.css`). Fonts are bundled from npm; no external font or image services are needed.
- **Charts and panels.** SVG charts for measurements and oxygen coverage, accessible tables, and CSV/JSON/HTML exports (`lib/export.ts`). Layouts are checked on desktop and on a 390 px phone screen.

### Backend and API

All server code runs as Next.js route handlers on Vercel. There is no database and no login; data lives in versioned JSON files, so every change is reviewable in Git.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Version, deployed build, counts and AI mode |
| `GET /api/evidence?q=airflow` | Curated findings, optionally ranked by search |
| `POST /api/ask` | `{ question, history? }` → AI answer with citations, or search results |
| `POST /api/analyze` | Lab scenario (+ optional replay point) → notes, related findings, AI interpretation |
| `POST /api/investigations` | `{ destination, priority }` → ranked profiles with the scoring rubric |
| `POST /api/compare` | `{ destination, priority, ids }` → AI explanation of 2–3 selected profiles |
| `POST /api/import` | Validated CSV/JSON upload, returned to the browser and marked unverified |

Key modules: `lib/evidence.ts` (BM25 search and relevance cutoff), `lib/context.ts` (per-question evidence for the AI), `lib/synthesis.ts` (Claude calls, citation checks, fallbacks), `lib/rate-limit.ts`, `lib/investigations.ts` (profiles and ranking rubric), `lib/scenario.ts` (lab controls and oxygen arithmetic).

### The AI: Claude, kept honest

- **Model:** Anthropic **Claude Haiku 5.5** (`anthropic/claude-haiku-5.5`), called with the Vercel AI SDK through Vercel AI Gateway. The deployment authenticates with Vercel OIDC, so no API key is stored anywhere.
- **Where it runs:** research-companion answers, lab interpretations, and Mission-desk comparison explanations.
- **Grounding:** search runs first and decides what the model may see: a few NASA findings and investigation profiles, never the open web. Off-topic questions fall below the relevance cutoff and are declined without calling the model.
- **Checking:** the model returns structured output listing the IDs it used; any answer citing an item it was not given is rejected. It is instructed never to give risk scores or certifications and never to read the flame animation as data.
- **Cost controls:** 10 AI calls per visitor per 10 minutes, a $5/month AI Gateway budget, and a search-only fallback when the model is slow, down or over budget. Measured cost is about $0.0005 per answer.
- **Evaluation:** `scripts/ai-eval.mjs` runs 13 live checks (grounded answers, a Moon-atmosphere question, a risk-score request, a prompt injection, off-topic questions, a comparison, a follow-up, lab and Mission-desk explanations). Current result: **13/13**. Checked citations show the AI stayed within its evidence; they are not a scientific review of every sentence.

## The data

| Layer | What it is | What it is not |
| --- | --- | --- |
| BASS-II measurements | 39 published flame-spread values from 18 runs, NASA/TM-20210011385 Table 5.1, checked by eye against the original PDF (SHA-256 recorded) | Raw telemetry or independent experiments; oxygen fell during every run |
| Research findings | 32 curated summaries of NASA sources, each with source, meaning and limits | An exhaustive review or a safety certification |
| Investigation profiles | 10 profiles: objectives, fuels and sample sizes, conditions, variables, sensors, shared hardware | A complete PSI catalog |
| 3D flame | An authored visual model; only the oxygen partial-pressure arithmetic is physical | CFD, a temperature map or a fire-risk score |
| Moon/Mars flame shapes | A conceptual interpolation | A partial-gravity prediction (PSI has no such data yet) |
| Rankings | Disclosed reading-priority rubric | Hazard, confidence or suitability scores |

While verifying the BASS-II table we found that the report’s Figure 5.2 gives a different M8 slope at 10 cm/s (0.0637 mm/s) than Table 5.1 (0.057 mm/s). The app uses the table and records the difference. Full source list: [submission/SUBMISSION.md](submission/SUBMISSION.md#nasa-data-and-resources-used) and `data/evidence.json`.

## Development process

1. **Foundation (November 9).** Built the dashboard, the animated 3D lab with a CPU fallback, the evidence library with provenance fields, the Mission desk ranking, the field guide, and the dark galaxy design. Deployed on Vercel from GitHub.
2. **Challenge resources (November 13).** Reviewed the official Details and Resources tabs, recorded a dated inventory (`docs/RESOURCES-2026-11-13.md`), downloaded the 49 MB BASS-II report, verified Table 5.1 page by page and expanded the data from 2 runs to all 18 tracked runs.
3. **Challenge coverage (November 13–14).** Added the investigations the challenge names (BRE, E-FIELD Flames, CFI-G, SPICE & SLICE, SAME-R/DAFT), shared-hardware groupings, crew atmospheres including spacesuits, the oxygen-coverage chart, the partial-gravity panel, Earth applications, fire history, and findings from NASA’s 2015 ISS combustion guide.
4. **AI (November 14).** Connected Claude Haiku 5.5 through Vercel AI Gateway, added the context builder, citation checks, rate limits, follow-up support and a live evaluation script, and iterated until all 13 checks passed.
5. **Launch.** Custom domain emberatlas.tech, a build stamp in the footer, and this repository as a clean snapshot of the project.

Every change was tested with strict TypeScript and 23 automated tests (`npm run check`), a production build, browser checks on desktop and phone, and a review of Vercel runtime logs after each release. The verification log is in `docs/VALIDATION.md`; the requirement mapping is in `docs/CHALLENGE-ALIGNMENT.md`. Development was assisted by AI coding tools (Claude Code); NASA values were checked by hand against the original sources.

## Run it locally

Requires Node.js 20.9+ and npm. Everything except AI answers works offline, with no accounts or keys.

```sh
npm ci
npm run dev          # http://localhost:3000
npm run check        # strict TypeScript + 23 tests
npm run build && npm start
```

To try AI answers locally, copy `.env.example` to `.env.local` and set `ENABLE_GENERATIVE_AI=true`, `AI_MODEL=anthropic/claude-haiku-5.5` and an `AI_GATEWAY_API_KEY`. Never commit `.env.local`. Without these, the app shows search-based answers.

Run the live AI checks against any deployment:

```sh
node scripts/ai-eval.mjs https://emberatlas.tech
```

## Deployment

Vercel project `ember-atlas`, connected to this repository; every push to `main` deploys to [emberatlas.tech](https://emberatlas.tech) (also [ember-atlas-sigma.vercel.app](https://ember-atlas-sigma.vercel.app)). Framework preset Next.js, install `npm ci`, build `npm run build`. Other Node hosts can run `npm ci && npm run build && npm start`.

## Limits and next steps

EMBER Atlas is a research and teaching tool, not a fire-safety certification. Next steps: add partial-gravity data from LUCI and FM2 when NASA releases it, ingest more PSI datasets (starting with FLEX droplet series) with the same verification, and have a combustion scientist review the findings and rankings.

## Project docs

- [docs/VALIDATION.md](docs/VALIDATION.md): dated record of what was tested and verified, including the live AI checks.
- [docs/CHALLENGE-ALIGNMENT.md](docs/CHALLENGE-ALIGNMENT.md): how each challenge objective maps to a feature.
- [docs/RESOURCES-2026-11-13.md](docs/RESOURCES-2026-11-13.md): inventory of the official challenge resources.
- [docs/DEMO.md](docs/DEMO.md): demo walkthrough script.

## License and attribution

Original application code: MIT, © 2026 Hiba Waheed and ISL Team A. Research material remains attributed to its original NASA sources; NASA PSI records used here identify CC0 dataset licenses. No NASA insignia is used. Independent project; no NASA endorsement or affiliation.
