# EMBER Atlas

[Open the live demo](https://emberatlas.tech) (also at [ember-atlas-sigma.vercel.app](https://ember-atlas-sigma.vercel.app)) · [GitHub repository](https://github.com/hibawaheed/ember-atlas-nasaspaceapps)

**Fire, beyond Earth.** An independent NASA Space Apps demo for _Flame in Freefall_: explore microgravity combustion evidence, compare published measurements, and investigate fire behavior in an interactive 3D lab.

**Built by ISL Team A.**

## Continuing with Claude — start here

**Handoff snapshot: November 9, 2026 · v1.3.0 · galaxy edition.** This repository is the working project, already connected to its Vercel production deployment. Continue it; do not create a replacement repository or hosting project.

1. Read **[CLAUDE.md](CLAUDE.md)** for the short operating context.
2. Read **[the complete continuation handoff](docs/HANDOFF.md)** for the architecture, file map, exact data limitations, known gaps, deployment/recovery instructions, and ordered work beginning November 13.
3. Use **[challenge alignment](docs/CHALLENGE-ALIGNMENT.md)** and **[verification record](docs/VALIDATION.md)** to distinguish implemented work from proposed work.

Copy this into Claude when resuming:

> Continue the existing `hibawaheed/ember-atlas-nasaspaceapps` project. Read README.md, CLAUDE.md, docs/HANDOFF.md, and AGENTS.md before editing. Begin with the November 13 resource-reconciliation checklist in the handoff. Check the official Flame in Freefall Details and Resources tabs as they exist now; do not assume the scheduled resource release happened. Keep the dark design and animated lab. Integrate verified NASA data with provenance and experimental context, preserve the distinction between measurements and illustrative graphics, run the checks, and update the existing GitHub-connected Vercel project. First report which resources are available and the concrete next change. Ask me only for access or decisions you actually need.

The next priority is **official resource integration and scientific verification**, followed by stronger retrieval and, if configured, evaluated generative answers. The public demo currently uses deterministic evidence retrieval. No raw NASA archive or official resource pack has been ingested, and no validated fire-risk model exists.

## What works

- **Galaxy research workspace:** midnight-blue surfaces, a subtle starfield, an original orbital illustration, lavender accents, warm flame controls, readable chart axes, and responsive layouts. Decorative space imagery is separate from scientific visualizations. Dark is the default and only in-app theme; exported HTML briefs keep a print-friendly light presentation.
- **3D combustion lab:** procedural volumetric flame with an interactive CPU 3D fallback, orbit/zoom, visible play/pause, animation speed, moving wisps and rising plumes, chamber outline, Earth comparison, atmosphere/airflow/fuel controls, and saved/shareable scenarios.
- **Measured replay:** 39 BASS-II observations from 18 runs drive visual radius and brightness, scaled to the fastest published rate. The encoding represents flame-spread rate, **not heat output or reconstructed flame shape**.
- **Evidence library:** 32 findings from 20 sources (NASA pages and reports, plus NASA's Space Apps challenge statement), filterable by research program and evidence type. Each keeps its source, implication, and limitations.
- **Mission desk:** ten investigation profiles (including BRE, E-FIELD Flames, CFI-G and SPICE/SLICE, added November 13), grouped by shared hardware, with an "on Earth" applications panel, ranked for orbital, lunar, Martian, and rover research questions; prevention/detection/suppression priorities, explicit ranking reasons, and a three-way comparison.
- **Guided lab & field guide:** five interactive chapters, plain-language science explainers, glossary, and a three-question knowledge check.
- **Measured data:** interactive scatter plot, original run conditions, accessible table, and CSV export.
- **Research companion:** BM25 retrieval with explicit synonym expansion, citation-linked answers, and abstention for unsupported topics. Works without an API key.
- **AI answers and lab interpretation (live):** Claude Haiku 5.5 via Vercel AI Gateway, schema-validated output limited to retrieved citation IDs, per-visitor rate limit, timeout, and retrieval fallback.
- **Data ingestion:** validated CSV/JSON, explicit units, source URLs, 1,000-row cap, and separation of unverified uploads from curated evidence.
- **Research briefs:** export an independently readable HTML report with scenario, implications, limits, and bibliography; print to PDF.

## Run independently

Node.js 20.9+ and npm are required. The current Vercel project runs Node 26; core tests and builds also pass locally on Node 20.20.2. All main features work without accounts, database provisioning, API keys, or live NASA access.

```sh
npm ci
npm run dev
# http://localhost:3000
npm run check
npm run build
npm start
```

Set `NEXT_TELEMETRY_DISABLED=1` if your environment restricts writes to user configuration directories.

## Data honesty

| Layer                | What it is                                                                  | What it is not                                                             |
| -------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| BASS-II measurements | Published summary values from NASA/TM-20210011385, Table 5.1, printed p. 57 | Raw telemetry, controlled single-variable trials, or uncertainty estimates |
| Research findings    | Curated paraphrases of primary NASA sources                                 | An exhaustive review or a spacecraft safety certification                  |
| Scenario flame       | Authored, dimensionless educational response model                          | CFD, temperature estimation, or a fire-risk score                          |
| Measured replay      | Visual encoding of observed spread rates                                    | A scientific reconstruction of flame geometry or heat release              |
| Moon/Mars comparison | Conceptual gravity-dependent shape                                          | Validated partial-gravity combustion prediction                            |
| Assistant ranking    | BM25 text relevance                                                         | A scientific confidence or hazard probability                              |

Oxygen changed within the BASS-II runs. Points are successive observations, not independent experiments. Do not infer isolated airflow causality. No per-point error bars were tabulated. On November 13, 2026 every value was checked by eye against Table 5.1 in the original NASA PDF (printed page 57, SHA-256 `5ffa911f…5f770`, recorded in full in `data/measurements.json`). Figure 5.2 of the same report shows a slightly different fitted M8 slope at 10 cm/s (0.0637 vs. 0.057 mm/s); the fixture uses the table value and notes the difference. The caveat is preserved in `data/measurements.json` and the UI.

The data snapshot is **November 13, 2026**. The official Details and Resources tabs were rechecked that day; see `docs/RESOURCES-2026-11-13.md` for the (partial) resource inventory. The visible resources contained no dataset, so the numeric data still comes from the BASS-II technical report. See `docs/CHALLENGE-ALIGNMENT.md` for the requirement mapping, project benchmarks, and remaining gaps.

## Optional generative answers

Copy `.env.example` to `.env.local`. Choose an available model ID from the live [AI Gateway catalog](https://ai-gateway.vercel.sh/v1/models), then set:

```dotenv
ENABLE_GENERATIVE_AI=true
AI_MODEL=provider/model-from-the-live-catalog
AI_GATEWAY_API_KEY=your-key-for-local-or-non-vercel-hosting
```

**Live since November 14, 2026:** the deployed site uses `anthropic/claude-haiku-5.5` through Vercel AI Gateway for research-companion answers and lab interpretations, authenticated with Vercel OIDC (no key stored). Answers may cite only the retrieved findings, are labeled as AI, are rate limited per visitor, and fall back to retrieval on any failure. Measured cost is about $0.0005 per call; test results are in [the verification record](docs/VALIDATION.md).

Vercel deployments can authenticate through their OIDC token instead. Secrets stay server-side. Generation is off by default for local runs. A $5/month team AI Gateway budget is set in the Vercel dashboard and is the hard spending cap; the in-app rate limit is per server instance, not global. Never commit `.env.local` or API keys. Model-generated facts still require scientific review; validating citation IDs does not prove entailment.

## Architecture

```text
React dashboard → Next.js route handlers → validated scenario / curated evidence
       │                      ├─ BM25 retrieval → source-linked response
       │                      └─ optional AI Gateway → validated citation IDs
       ├─ Three.js → procedural volumetric flame
       ├─ SVG chart → measured BASS-II data
       └─ localStorage → saved scenarios (device-local)
```

Source files are the versioned data store. This makes the demo deterministic and easy to audit. Import requests are validated on the server, then returned to the browser; uploads are not persisted. Saved scenarios remain in that browser. No login is needed and no server-side user profile is created.

### API

| Endpoint                      | Contract                                                                                                              |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `GET /api/health`             | Version, evidence counts, assistant mode                                                                              |
| `GET /api/evidence?q=airflow` | Curated evidence with optional ranked search                                                                          |
| `POST /api/analyze`           | Validated scenario → synthetic visual parameters, interpretation, related evidence                                    |
| `POST /api/investigations`    | `{ "destination": "moon", "priority": "detection" }` → ranked investigation metadata, disclosed rubric, transfer gaps |
| `POST /api/ask`               | `{ "question": "What did FLEX discover?" }` → answer, mode, citations, limits                                         |
| `POST /api/import`            | `{ "label": "Experiment", "csv": "..." }` or `{ "label": "...", "rows": [...] }`                                      |

Scenario fields: `oxygen` (15–40 vol%), `pressure` (50–110 kPa), `airflow` (0–20 cm/s), `gravity` (`micro`, `moon`, `mars`, `earth`), `fuel` (`pmma`, `cellulose`, `droplet`). These bounds define demo controls, not validated physical limits.

CSV columns: `testId,airflowCms,spreadRateMms,sourceUrl,material`. JSON import has the same typed fields. Use HTTPS provenance links. The downloadable template contains **synthetic example data** and must be replaced.

## Deployment

Import this repository into Vercel with the **Next.js** framework preset and root directory `.`. Production branch: `main`. Build command: `npm run build`. Install command: `npm ci`. Vercel provides a free `.vercel.app` hostname; no purchased domain is required. Keep the GitHub integration connected for deployments on pushes.

Other Node hosts can run `npm ci && npm run build && npm start`. No Vercel-only service is required for core features.

## Research extension plan

1. Ingest original files and metadata from [BASS-II / PSI-25](https://psi.nasa.gov/physci/repo/data/investigations/PSI-25) and [FLEX / PSI-69](https://psi.nasa.gov/physci/repo/data/investigations/PSI-69).
2. Preserve flow orientation, frame timing, geometry, instrument calibration, and measurement uncertainty.
3. Add a reviewed extraction pipeline and immutable file hashes before enlarging the evidence corpus.
4. Explore [PSI-62 two-color tomography](https://psi.nasa.gov/physci/repo/data/investigations/PSI-62) for reconstruction of measured soot/temperature fields.
5. Validate any predictive model on held-out experiments and involve a combustion scientist before assigning safety meaning.

See `docs/research-notes.txt`, `docs/DEMO.md`, and `docs/VALIDATION.md`.

## License and attribution

Original application code: MIT, © 2026 Hiba Waheed. Research material remains attributed to its original sources; the code license does not relicense third-party material. NASA PSI records used here identify CC0 dataset licenses. No NASA insignia is used. Independent project; no NASA endorsement or affiliation.
