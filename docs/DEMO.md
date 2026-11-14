# Three-minute demonstration

Live site: https://emberatlas.tech. Check the footer build stamp (or `/api/health`) before presenting, so you know which release is on screen.

The demo starts on the question the challenge raises for the Moon and answers it with a measured NASA test. Every number you say aloud is on screen with its source.

## Script

1. **The question (20 s).** On the homepage, read the result strip: *"Has NASA measured a fire in 30% oxygen at 70.3 kPa?"* Say: the challenge expects Moon bases at 30% oxygen or more and 10.2 psi or less. That's a scenario. We wanted to know what NASA has actually burned near it.
2. **Open VI-3 and compare (45 s).** Click **Compare a lunar habitat with a NASA test**. The lab opens on the comparison table: Saffire VI-3, acrylic (PMMA) at 30.3% oxygen. Walk down the rows: material matches, oxygen within 0.3 points, but pressure (54.6 kPa), airflow (20 cm/s forced) and gravity (microgravity) differ.
3. **Follow the NASA table (20 s).** Click **Open Table 1 (PDF p. 3)**. The NASA paper opens on the page with the VI-3 row.
4. **What the flame picture is (20 s).** Scroll up to the flame. *O₂ partial pressure 0.30 × 70.3 kPa = 21.09 kPa* is arithmetic; *Animation intensity: Moderate* is authored for the picture, not measured.
5. **Detection (25 s).** On the **Mission desk**, choose **Moon** and **Detect a developing fire**. The measured example: in VI-3 the authors' 1 mg/m³ particle threshold was reached at 981 s, by which point much of the gas release had occurred. The threshold is the authors' chosen level, not the detector's signal.
6. **Share the brief (20 s).** Back on the homepage, click **Save brief (HTML)** and open it: one page with the inputs, the comparison, the source tables, the limitation, the build and a link that reopens the scenario in any browser.
7. **End on the open question (15 s).** The brief's last line is the unanswered one: no measured fire at lunar gravity is in the atlas, and NASA's PSI archive has none (per the challenge statement). Short drop-tower tests exist outside PSI; LUCI and FM2 are meant to fill the gap.

## Ready for questions

- **"How do you handle changing conditions?"** Switch the lab to **Measured replay**, run M7 and open **Read run M7 as a table**: each step is a published BASS-II spread rate with units, and oxygen fell during the run, so airflow and oxygen changed together.
- **"Can I ask it things?"** In the **Research companion**, ask *"Has anyone studied flame spread in simulated lunar gravity?"* The answer separates the short tests outside PSI from the atlas's holdings and cites both.

## If something fails

- **AI paused or unavailable:** the companion shows the matching NASA findings instead, with a notice. Say so and read the finding; the demo still works.
- **Slow or no 3D:** the lab switches to a lighter CPU flame automatically. Use the replay table for the numbers.
- **No network:** use the submission PDF slides.

## What not to claim

No safety threshold, mission certification, detector rating or NASA affiliation. The flame picture is an illustration; the comparison and replay values come from NASA tables.
