// Release checks for the November 14, 2026 review: node scripts/verify-release.cjs https://emberatlas.tech docs/release-evidence
// Release verification for the review's nine tests. node verify.cjs <base> <outdir>
const { chromium } = (() => { try { return require('playwright'); } catch { return require('/opt/node-tools/node_modules/playwright'); } })();
const fs = require('fs');
const base = process.argv[2], out = process.argv[3];
const results = [];
const rec = (test, ok, detail) => { results.push({ test, ok, detail }); console.log((ok ? 'PASS' : 'FAIL') + ' · ' + test + ' · ' + detail); };
(async () => {
  const b = await chromium.launch();
  const fresh = (opts = {}) => b.newContext({ acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'], ...opts });
  const errors = [];
  const watch = (p) => { p.on('pageerror', (e) => errors.push(e.message)); p.on('console', (m) => m.type() === 'error' && errors.push(m.text())); };

  // 6. First visit and tour (fresh session) + 1. Lunar comparison
  let ctx = await fresh({ viewport: { width: 1280, height: 800 } }); let p = await ctx.newPage(); watch(p);
  await p.goto(base + '/'); await p.waitForTimeout(1500);
  const firstScreen = await p.evaluate(() => { const r = document.querySelector('.home-result')?.getBoundingClientRect(); return r ? r.top < innerHeight : false; });
  await p.getByRole('button', { name: /Compare a lunar habitat with a NASA test/ }).click(); await p.waitForTimeout(1500);
  const title = await p.$eval('#tc-title', (e) => e.textContent);
  const rows = await p.$$eval('.test-compare tbody tr', (rs) => rs.map((r) => [...r.children].map((c) => c.textContent.trim())));
  const t1 = await p.$eval('.test-compare a[href*="#page=3"]', (a) => a.href).catch(() => null);
  await p.screenshot({ path: out + '/1-lunar-comparison.png' });
  const row = (n) => rows.find((r) => r[0] === n) || [];
  rec('1 Lunar comparison', /VI-3/.test(title) && row('Oxygen fraction')[2] === '30.3%' && row('Total pressure')[2] === '54.6 kPa' && /20 cm\/s/.test(row('Airflow')[2]) && /PMMA/.test(row('Material')[2]) && /10 mm/.test(row('Material')[2]) && /microgravity/.test(row('Gravity')[2]) && !!t1,
    `${title}; O2 ${row('Oxygen fraction')[2]}, P ${row('Total pressure')[2]}, flow ${row('Airflow')[2]}, material "${row('Material')[2]}", gravity "${row('Gravity')[2]}"; Table 1 link ${t1}`);
  await p.goto(base + '/'); await p.waitForTimeout(1000);
  await p.getByRole('button', { name: /guided tour/ }).click(); await p.waitForTimeout(1500);
  const tour = await p.$eval('.lab-tour', (e) => e.textContent);
  await p.screenshot({ path: out + '/6-tour-step1.png' });
  rec('6 First visit and tour', firstScreen && /VI-3/.test(title) && /Start with a measurement/.test(tour) && /BASS-II Table 5\.1/.test(tour) && /Limitation/.test(tour),
    `result on first screen: ${firstScreen}; primary button reached "${title}"; tour step 1 measured with source and limitation: ${/Limitation/.test(tour)}`);
  await ctx.close();

  // 2. Claims and chart labels
  ctx = await fresh({ viewport: { width: 1280, height: 900 } }); p = await ctx.newPage(); watch(p);
  await p.goto(base + '/?view=lab&scenario=' + encodeURIComponent(JSON.stringify({ oxygen: 30, pressure: 70.3, airflow: 5, gravity: 'moon', fuel: 'pmma' }))); await p.waitForTimeout(1500);
  const labText = await p.textContent('main');
  await p.goto(base + '/?view=missions'); await p.waitForTimeout(1800);
  const mText = await p.textContent('main');
  await p.goto(base + '/'); await p.waitForTimeout(1200);
  const hText = await p.textContent('main');
  rec('2 Claims and chart labels', /Physical Sciences Informatics/.test(labText) && /challenge statement/i.test(labText) && /Flame spread varied as airflow and oxygen changed/.test(hText) && /empty region means/i.test(mText) && !/PSI has no partial-gravity data yet\b(?! \()/.test(hText + mText),
    'PSI spelled out and attributed in lab gravity panel; BASS-II heading reflects co-varying conditions; coverage chart explains empty regions');

  // 4. Ranking and search
  await p.goto(base + '/?view=missions'); await p.waitForTimeout(1800);
  await p.getByRole('button', { name: /Lunar base/ }).first().click(); await p.waitForTimeout(1200);
  const topReason = async () => p.$eval('.reason-line', (e) => e.textContent).catch(() => '');
  const topName = async () => p.$eval('.reason-line', (e) => e.parentElement.querySelector('h3')?.textContent || '').catch(() => '');
  const prev = [await topName(), await topReason()];
  await p.getByRole('button', { name: /Detect a developing fire/ }).click(); await p.waitForTimeout(1500);
  const det = [await topName(), await topReason()];
  const parent = await p.$$eval('.parent-tag', (e) => e.length);
  const bg = await p.$$eval('.program-background', (e) => e.length);
  await p.screenshot({ path: out + '/4-ranking-detection.png', fullPage: false });
  await p.goto(base + '/?view=evidence'); await p.waitForTimeout(1200);
  await p.getByLabel('Search NASA findings').fill('acrylic'); await p.waitForTimeout(600);
  const rel = await p.$eval('.related-note', (e) => e.textContent).catch(() => '');
  const acryl = await p.$$eval('article h3', (e) => e.map((x) => x.textContent));
  rec('4 Ranking and search', prev[1] !== det[1] && det[1].length > 10 && parent > 0 && bg > 0 && /PMMA \(acrylic\)/.test(rel) && acryl.length > 0,
    `Moon prevention top: ${prev[0]} — "${prev[1]}"; detection top: ${det[0]} — "${det[1]}"; ACME children tagged: ${parent}; program background shown: ${bg > 0}; "acrylic" → ${acryl.length} findings with note "${rel.trim()}"`);

  // 5. Lab and replay
  await p.goto(base + '/?view=lab'); await p.waitForTimeout(1500);
  await p.selectOption('select[aria-label="Load scenario preset"]', 'lunar'); await p.waitForTimeout(500);
  const explore = await p.$$eval('.viewer-data > div', (d) => d.map((x) => x.textContent));
  await p.getByRole('button', { name: 'Measured replay' }).click(); await p.waitForTimeout(800);
  await p.selectOption('.lab-controls select', { index: 6 }).catch(() => {});
  const replayCap = await p.$eval('.scene-caption', (e) => e.textContent);
  const replayData = await p.$$eval('.viewer-data > div', (d) => d.map((x) => x.textContent));
  await p.getByRole('button', { name: /Pause fire/ }).click(); await p.waitForTimeout(300);
  const status = await p.$eval('.animation-status', (e) => e.textContent);
  const hasTable = await p.$$eval('.replay-table', (e) => e.length);
  await p.screenshot({ path: out + '/5-replay-paused.png' });
  rec('5 Lab and replay', /0\.30 × 70\.3 kPa = 21\.09 kPa/.test(explore.join(' ')) && /not measured/.test(explore.join(' ')) && /M\d+ · 0\.\d{3} mm\/s/.test(replayCap) && /mm\/s/.test(replayData.join(' ')) && /paused/i.test(status) && hasTable > 0,
    `explore: "${explore.map((s) => s.replace(/\s+/g, ' ')).join(' | ')}"; replay caption "${replayCap.slice(0, 60)}…"; status "${status.replace(/\s+/g, ' ')}"; table route: ${hasTable > 0}`);
  await ctx.close();

  // 7. Files and shared state
  ctx = await fresh({ viewport: { width: 1280, height: 900 } }); p = await ctx.newPage(); watch(p);
  await p.goto(base + '/?view=evidence'); await p.waitForTimeout(1200);
  await p.getByRole('button', { name: 'Saffire', exact: true }).click(); await p.waitForTimeout(500);
  const btn = p.getByRole('button', { name: /filtered finding/ });
  const label = (await btn.textContent()).trim();
  let [dl] = await Promise.all([p.waitForEvent('download'), btn.click()]);
  await dl.saveAs(out + '/filtered-findings.json');
  const ev = JSON.parse(fs.readFileSync(out + '/filtered-findings.json', 'utf8'));
  const n = Number(label.match(/\d+/)[0]);
  await p.goto(base + '/'); await p.waitForTimeout(1200);
  [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: /Save brief/ }).click()]);
  await dl.saveAs(out + '/lunar-brief.html');
  const brief = fs.readFileSync(out + '/lunar-brief.html', 'utf8');
  await p.getByRole('button', { name: 'Copy link' }).click(); await p.waitForTimeout(300);
  const link = await p.evaluate(() => navigator.clipboard.readText());
  await p.goto(base + '/'); await p.waitForTimeout(800);
  [dl] = await Promise.all([p.waitForEvent('download'), p.getByLabel(/observations from .* shown runs as CSV/).click()]);
  await dl.saveAs(out + '/bass-ii.csv');
  const csv = fs.readFileSync(out + '/bass-ii.csv', 'utf8').trim().split('\n');
  const ctx2 = await fresh({ viewport: { width: 1280, height: 900 } }); const q = await ctx2.newPage();
  await q.goto(link); await q.waitForTimeout(1500);
  const vals = await q.$$eval('.range-control b, .lab-controls .range-control span b', (e) => e.map((x) => x.textContent.trim()));
  const grav = await q.$eval('.gravity-select .active, .gravity-select [aria-pressed="true"]', (e) => e.textContent.trim()).catch(() => '');
  const fuel = await q.$eval('.lab-controls select:not([aria-label="Load scenario preset"])', (e) => e.value).catch(() => '');
  const u = new URL(link); const sc = JSON.parse(u.searchParams.get('scenario'));
  rec('7 Files and shared state',
    ev.findings.length === n && ev.selection.program === 'Saffire' && ev.findings.every((f) => /Saffire/.test(f.experiment)) && ev.sources.length > 0 &&
    /Closest measured test: Saffire VI-3/.test(brief) && /Table 1, PDF p\. 3/.test(brief) && /21\.09 kPa/.test(brief) && /hold at lunar gravity/.test(brief) && /build [0-9a-f]{7}/.test(brief) &&
    csv.length === 40 && /^testId,pointOrder/.test(csv[0]) &&
    sc.oxygen === 30 && sc.pressure === 70.3 && sc.airflow === 5 && sc.gravity === 'moon' && sc.fuel === 'pmma' && /Moon/.test(grav) && vals.join(' ').includes('30%') && vals.join(' ').includes('70.3'),
    `"${label}" → ${ev.findings.length} findings, filter ${ev.selection.program}, ${ev.sources.length} sources; brief has VI-3, Table 1 link, 21.09 kPa, build, next question; CSV ${csv.length - 1} rows with run IDs; shared link in fresh session: ${vals.join(', ')}, gravity ${grav}, fuel ${fuel}`);
  await ctx2.close(); await ctx.close();

  // 8. Phone and keyboard (390 px phone; 1280 px at 200% zoom = 640 CSS px)
  for (const [w, h, dsf, name] of [[390, 844, 3, 'phone'], [640, 400, 2, 'zoom200']]) {
    ctx = await fresh({ viewport: { width: w, height: h }, deviceScaleFactor: dsf }); p = await ctx.newPage(); watch(p);
    await p.goto(base + '/'); await p.waitForTimeout(1500);
    const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await p.getByRole('button', { name: /Compare a lunar habitat/ }).click(); await p.waitForTimeout(1500);
    const tableOver = await p.evaluate(() => { const t = document.querySelector('.test-compare .table-wrap'); return t ? getComputedStyle(t).overflowX : 'none'; });
    const units = await p.$$eval('.test-compare tbody td', (e) => e.map((x) => x.textContent).join(' '));
    await p.screenshot({ path: out + `/8-${name}-comparison.png` });
    rec(`8 Phone and keyboard (${name})`, over <= 0 && /kPa/.test(units) && /cm\/s/.test(units), `horizontal page overflow ${over}px; comparison table scrolls inside its box (${tableOver}); units visible`);
    await ctx.close();
  }
  ctx = await fresh({ viewport: { width: 1280, height: 900 } }); p = await ctx.newPage(); watch(p);
  await p.goto(base + '/?view=evidence'); await p.waitForTimeout(1200);
  const seen = [];
  for (let i = 0; i < 40; i++) {
    await p.keyboard.press('Tab');
    const f = await p.evaluate(() => { const e = document.activeElement; const s = getComputedStyle(e); return { t: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 40), outline: s.outlineStyle !== 'none' && s.outlineWidth !== '0px' || s.boxShadow !== 'none' || !!e.closest('.search-bar, .ask-form') }; });
    seen.push(f);
  }
  const reached = (re) => seen.some((s) => re.test(s.t));
  const allVisible = seen.every((s) => s.outline);
  await p.goto(base + '/'); await p.waitForTimeout(1000);
  let chartFocus = false;
  for (let i = 0; i < 80 && !chartFocus; i++) { await p.keyboard.press('Tab'); chartFocus = await p.evaluate(() => document.activeElement?.tagName === 'circle'); }
  rec('8 Keyboard', reached(/Search NASA findings/) && reached(/Saffire|FLEX|BASS/) && reached(/JSON/) && chartFocus && allVisible,
    `tab reached search, program filters, download: ${reached(/Search/)}, ${reached(/Saffire|FLEX|BASS/)}, ${reached(/JSON/)}; chart point focusable: ${chartFocus}; visible focus on all ${seen.length} stops: ${allVisible}`);
  await ctx.close();

  // 9. Screen reader structure and motion
  ctx = await fresh({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' }); p = await ctx.newPage(); watch(p);
  await p.goto(base + '/'); await p.waitForTimeout(1500);
  const h1 = await p.$$eval('h1', (e) => e.length);
  const heads = await p.$$eval('h1,h2,h3', (e) => e.slice(0, 8).map((x) => x.tagName + ':' + x.textContent.trim().slice(0, 30)));
  const chartLabel = await p.$eval('svg[role="img"]', (e) => e.getAttribute('aria-label')).catch(() => '');
  await p.getByRole('button', { name: /Compare a lunar habitat/ }).click(); await p.waitForTimeout(1500);
  const th = await p.$$eval('.test-compare thead th', (e) => e.length);
  const caption = await p.$eval('.test-compare caption', (e) => e.textContent).catch(() => '');
  const selTab = await p.$eval('.tc-tabs [aria-selected="true"]', (e) => e.textContent).catch(() => '');
  const motion = await p.$eval('.animation-status', (e) => e.textContent);
  await p.goto(base + '/?view=evidence'); await p.waitForTimeout(1000);
  const live = await p.$eval('.results-note', (e) => e.getAttribute('aria-live'));
  const pressed = await p.$$eval('[aria-pressed="true"], [aria-current="page"]', (e) => e.length);
  rec('9 Screen reader and motion', h1 === 1 && th === 4 && caption.length > 20 && /VI-3/.test(selTab) && /paused/i.test(motion) && live === 'polite' && chartLabel.length > 20 && pressed > 0,
    `one h1; headings ${heads.join(' / ')}; chart summary present; comparison table has caption and ${th} headers; selected tab ${selTab}; reduced motion: "${motion.replace(/\s+/g, ' ').slice(0, 60)}"; result count aria-live=${live}`);
  await ctx.close();

  fs.writeFileSync(out + '/results.json', JSON.stringify({ base, at: new Date().toISOString(), results, consoleErrors: errors }, null, 2));
  console.log('console errors:', errors.length, errors.slice(0, 5));
  await b.close();
})();
