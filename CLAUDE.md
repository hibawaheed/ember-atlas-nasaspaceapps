# Claude continuation context

Read [README.md](README.md), then [docs/HANDOFF.md](docs/HANDOFF.md), before starting. The handoff is the detailed source of project context; this file is the compact entry point for Claude Code. Also follow the repository's [AGENTS.md](AGENTS.md) and inspect installed Next.js documentation for APIs you change.

## The owner's request

Hiba wants a polished, independently runnable NASA Space Apps demo for **Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data**. Claude will continue the work from **November 13, 2026 onward**, when challenge resources were scheduled to be released. That release must be checked, not assumed. She explicitly prefers a **dark galaxy theme** with a starfield and orbital illustration, convincing moving flames, useful explanations, and restrained design without generic AI-style slogans or decorative italic headlines.

## Existing project — preserve its identity

- Team: **ISL Team A**. Keep this credit in the shared site footer and README.
- Repository: `https://github.com/hibawaheed/ember-atlas-nasaspaceapps`, production branch `main` (started November 14, 2026 as a single snapshot of the project; the earlier development history stays in `hibawaheed/ember-atlas`, which is no longer the source).
- Site: `https://emberatlas.tech` (custom domain bought at Hostinger, DNS A record to Vercel, `www` redirects to the apex; added November 14, 2026). `https://ember-atlas-sigma.vercel.app` still works.
- Vercel project: `ember-atlas`, team slug `hibas-projects-09cdb13e`.
- Pushing `main` triggers a production deployment. Use a feature branch/preview for changes that need review. Check the deployed commit and domain after release.
- No database, accounts, or API key is required for the core demo. Do not introduce paid infrastructure just to run it.
- No credentials are stored here. Use Hiba's authorized GitHub/Vercel access in your own environment; previous agent connectors and temporary SSO approvals are not transferable credentials.

**AI is live since November 14, 2026.** The owner set up AI Gateway billing; production and preview use `ENABLE_GENERATIVE_AI=true` and `AI_MODEL=anthropic/claude-haiku-5.5` with Vercel OIDC (no API key stored). It powers research-companion answers and lab interpretation, limited to supplied findings, rate limited per visitor (10 per 10 minutes per server instance) and falling back to retrieval/authored notes on any failure. Measured cost: about $0.0005 per call. No in-app budget exists; the owner set a team AI Gateway budget of $5/month in the Vercel dashboard on November 14, 2026 (owner-reported; not readable through the Vercel connector), which is the hard cap. Answers are evaluated on a small live test set (see `docs/VALIDATION.md`), not scientifically validated.

## First session

1. Inspect `git status`, current branch/head, README, handoff, and installed dependencies. Preserve any new owner changes.
2. Run `npm ci` if needed, `npm run check`, and `npm run build`; inspect the app with `npm run dev`.
3. Review the official challenge Details and Resources tabs and record a dated resource inventory, as described in the handoff.
4. Choose one useful dataset; verify its units, run identity, geometry, instruments, uncertainty, source/version, and checksum before expanding the curated data.
5. Keep `docs/VALIDATION.md` and `docs/CHALLENGE-ALIGNMENT.md` current as work actually completes.

## Scientific boundaries

- `data/measurements.json` contains **39 published observations from 18 BASS-II PMMA runs** (every tracked run in Table 5.1; M6 and M12 were not tracked), not raw telemetry or independent experiments. Oxygen fell within every run, and runs differ in thickness, width and sides burning at once. Values were visually verified against the original PDF (Table 5.1, PDF page 65) on November 13, 2026; the file's SHA-256 is in `data/measurements.json`.
- `data/evidence.json` contains **32 curated findings / 20 sources** (NASA pages, reports, and the official challenge statement), not a complete archive. Findings citing only the challenge statement are labeled "Review", never "Observed". SAME additions are research objectives, not detector performance results.
- `lib/scenario.ts` is an authored visual-response model. Its coefficients are not fitted to NASA measurements. Only oxygen partial-pressure arithmetic has quantitative physical meaning here; it does not establish safety.
- Flame color, shape, brightness, replay timing, and visual activity are not calibrated temperature, heat release, extinction, or risk.
- Moon/Mars shape interpolation is conceptual. Recheck the current challenge's statement about missing partial-gravity data before updating that caveat.
- Relevance ranks are reading priorities, never confidence or hazard scores. The assistant retrieves with BM25, then Claude Haiku 5.5 writes a short answer citing only the retrieved findings; it has passed a small live test set but has not been scientifically evaluated.

## Where to edit

- Data/provenance: `data/evidence.json`, `data/measurements.json`, `lib/investigations.ts`.
- Retrieval/AI: `lib/evidence.ts`, `lib/synthesis.ts`, `app/api/ask/route.ts`.
- Lab: `components/lab.tsx`, `flame-scene.tsx`, `canvas-flame.tsx`; particle motion in `lib/flame-motion.ts`.
- Design: palette and base layout in `app/globals.css`, guide/mission layouts in `app/expedition.css`, dark hierarchy in `app/instrument.css` (imported last).
- Main navigation and URL state: `components/dashboard.tsx`.
- Test entry: `tests/run.cjs`; meaningful assertions in `tests/core.test.ts`.

Before finishing: run checks/build, test the changed browser → API → evidence → response flow, test phone layout, inspect logs after deployment, and report any limits. Keep fire playback and observation playback separate. Do not replace a working animation with a static placeholder.
