# Three-minute demonstration

Live site: https://emberatlas.tech. Check the footer build stamp (or `/api/health`) before presenting, so you know which release is on screen.

The demo starts on the question the challenge raises for the Moon and answers it with a measured NASA test. Every number you say aloud is on screen with its source.

## Script

1. **The question (20 s).** On the homepage, read the result: *"Has NASA measured a fire in 30% oxygen at 70.3 kPa?"* The challenge expects Moon bases there. We imported 2,008 NASA test records to answer it.
2. **Three answers (40 s).** Droplets: yes, eight FLEX tests at 30% oxygen and 71–72 kPa (click "NASA PSI-69 table" to show the source). Solids: the closest is Saffire VI-3, at lower pressure. Lunar gravity: in drop-tower tests Mylar burned down to 15.6% oxygen, lower than in orbit or on Earth.
3. **The map (25 s).** Scroll to the atlas map: 754 tests by oxygen and pressure, crew atmospheres marked. Click the FLEX circle at the Moon base marker to show the test list and NASA link.
4. **Condition by condition (30 s).** Click **Compare condition by condition**. Switch between *Solid materials* (Saffire VI-3) and *Liquid droplets* (FLEX). Every row says what matches, what differs and what NASA's table does not list.
5. **Gravity (20 s).** Scroll to the gravity chart: limits at 0g, lunar, Martian and Earth gravity. The two ends do not bracket the middle for these three materials; about 5-second tests.
6. **Data quality (20 s).** Open **Measured data**: the 21 NASA tables, and 28 problems we found in them, such as spreadsheet autofill turning "CH4" into "CH5 … CH14". We flag, never silently fix.
7. **Ask (20 s).** In the **Research companion**, ask *"Which BASS-II run had the fastest flame spread?"* Claude answers M16, 0.144 mm/s at 5 cm/s, citing the NASA test row.
8. **Take it away (10 s).** **Save brief (HTML)** or **Copy link**: one page with the answer, sources and limits, or a link that reopens the scenario.

## Ready for questions

- **"How did you get the data?"** PSI has a public API. `scripts/fetch-psi.mjs` re-downloads all 21 tables and checks their SHA-256 against our manifest; `scripts/build-tests.mjs` rebuilds the dataset.
- **"How do you handle changing conditions?"** Switch the lab to **Measured replay**, run M7 and open **Read run M7 as a table**: each step is a published BASS-II spread rate with units, and oxygen fell during the run, so airflow and oxygen changed together.
- **"Can I ask it things?"** In the **Research companion**, ask *"Has anyone studied flame spread in simulated lunar gravity?"* The answer separates the short tests outside PSI from the atlas's holdings and cites both.

## If something fails

- **AI paused or unavailable:** the companion shows the matching NASA findings instead, with a notice. Say so and read the finding; the demo still works.
- **Slow or no 3D:** the lab switches to a lighter CPU flame automatically. Use the replay table for the numbers.
- **No network:** use the submission PDF slides.

## What not to claim

No safety threshold, mission certification, detector rating or NASA affiliation. The flame picture is an illustration; the comparison and replay values come from NASA tables.
