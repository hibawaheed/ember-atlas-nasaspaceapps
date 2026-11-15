# Official resource inventory — November 13, 2026

Source: the [Flame in Freefall challenge page](https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/), Details and Resources tabs. The owner captured them in a browser on November 13, 2026, because this cloud session could not load the site (the network proxy failed to connect to it). The page says: "More resources may be added before the hackathon begins." Check again before submission.

**Status (updated November 15): link targets for the visible items were supplied later and are listed in `submission/SUBMISSION.md`; the data itself now comes from the PSI API (21 experimental tables, see `data/psi/manifest.json`). Original note:** The screenshot starts partway down the Resources list. Any items above "NASA ScienceCasts" (likely including PSI repository links) are not yet recorded. Link targets were not visible, except for the video URL the owner provided.

## Resources tab (visible portion)

| # | Title (as listed) | Description on the page | URL | Type | Disposition |
| - | ----------------- | ----------------------- | --- | ---- | ----------- |
| 1 | NASA ScienceCasts: The Power of Studying Combustion on the ISS | Introduction to NASA's ISS combustion research; 3.6-minute video from 2018 | https://www.youtube.com/watch?v=AVuEiKxOpc0 | Video | Background only. Can be linked from the field guide. Not a data source. |
| 2 | A Researcher's Guide to International Space Station Combustion Science | 2015 review of ISS combustion research conducted or planned; 50+ pages; most investigations described also appear in PSI | https://www.nasa.gov/sites/default/files/atoms/files/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf (NP-2015-10-034-JSC, 56 pages, SHA-256 `5fe046ef…d6b6`; the owner's upload matches the NASA copy) | PDF | **Integrated November 13.** Source for five findings (FLEX inert-gas margin, BASS nitrogen jet, overturned fire misconceptions, microgravity smoke particle size, BASS ventilation hypothesis) and for FLEX/MDCA, BRE and SPICE/SLICE profile details. |
| 3 | Apollo 1 | Crew, mission, pre-launch fire, investigation, lessons learned | not recorded | Web page | Context for prevention (oxygen-rich atmosphere, materials). Overview/story only. |
| 4 | Apollo 13 | Crew, mission, oxygen tank explosion, investigation, lessons learned | not recorded | Web page | Context only. Tank failure is outside PSI combustion data. |
| 5 | 25 Years Ago: Fire Aboard Space Station Mir | 1997 fire caused by an oxygen generator failure | not recorded | Web page | Context for detection/suppression in a station. Overview/story only. |
| 6 | Fireman's Air Tanks | 1970s spacesuit technology adapted for firefighter breathing gear | not recorded | Web page (spinoff) | Supports the optional "applications on Earth" direction. |
| 7 | Fire Detector | 1970s shuttle smoke detector that tells smoke from dust | not recorded | Web page (spinoff) | Earth applications; relates to SAME/DAFT detection topic. |
| 8 | New Technology for the Fire Attire | 1980s spacesuit technology applied to firefighter clothing | not recorded | Web page (spinoff) | Earth applications. |

None of the visible items is a dataset. The numeric data in the app still comes from NASA/TM-20210011385 (BASS-II), which was verified against the original PDF on November 13 (see `docs/VALIDATION.md`).

## Details tab — what changed since November 9

Rechecked against the owner's screenshots. Still present: the objective (SI-powered web dashboard that summarizes, ranks and interprets combustion investigations), the three "you may consider" bullets, the rocket/propellant scope footnote, and the statement that **"there is currently no partial-gravity combustion data available in PSI."** The app's partial-gravity caveat stays as it is.

New or more specific than the November 9 notes:

- **Background:** Artemis II smoke alarm quote; Apollo 13, Mir and Apollo 1 fires; candle flame as a "ghostly blue sphere"; prevention/detection/suppression framing; SAME **and SAME-R**; FLEX suppression by CO₂ and helium dilution.
- **Earth applications (optional):** fine-water-mist extinguishers from the ISS, smoke detection, firefighter clothing and air tanks.
- **Other PSI investigations named:** DAFT and DAFT-2 (dust, using a SAME/SAME-R instrument); ACME Burning Rate Emulator (BRE); ACME E-FIELD Flames (partial gravity mimicked with electric fields); ACME Cool Flames Investigation with Gases (CFI-G, up to 85% oxygen).
- **Shared hardware:** six ACME experiments in the Combustion Integrated Rack (CIR); FLEX, FLEX-2 and CFI with the Multi-user Droplet Combustion Apparatus (MDCA); BASS, BASS-II, SPICE and SLICE in the Microgravity Science Glovebox using the SPICE flow duct.
- **Atmospheres:** spacesuits at 100% O₂, 4.3 psi; Moon base and rovers likely **≥30% O₂ at ≤10.2 psi** (70.3 kPa), described as a >40% increase in oxygen concentration over Earth's air.
- **Future partial-gravity data:** LUCI (Lunar-g Combustion Investigation) and FM2 (Flammability of Materials on the Moon). Microgravity and normal-gravity results "could bound" intermediate gravity.
- **Audience:** professors, graduate and undergraduate students, aerospace researchers and engineers.

## Actions taken

- Added a "Lunar habitat (challenge figures)" lab preset at 30% O₂, 70.3 kPa (oxygen partial pressure 21.09 kPa). The lunar flame shape remains illustrative.
- Replaced the outdated "resources available November 13" notice in the Methodology view.

## Added November 13 (second update)

- Investigation profiles for BRE, E-FIELD Flames, CFI-G and SPICE & SLICE. SAME is now "SAME / SAME-R" with the DAFT note. Every profile has a hardware family, and the Mission desk shows a "Shared hardware" panel. The ranking gives +1 to profiles that probe gravity dependence (BRE, E-FIELD) for surface destinations.
- Six findings: partial-gravity data gap (LUCI/FM2), lunar habitat atmosphere, BRE emulation, E-FIELD as a partial-gravity analogue, CFI-G high-oxygen flames, and DAFT instrument reuse.
- A "Back on Earth" panel listing the challenge's Earth applications, plus BRE and E-FIELD's stated Earth benefits.
- Sources: NASA pages for BRE, E-FIELD Flames and the ACME facility (science.nasa.gov), and the challenge statement. The ACME page says five experiments; the challenge statement says six (the later CFI-G). The app follows the challenge statement.

## Next actions

1. Get the top of the Resources list and the remaining link targets, then finish this table.
2. ~~Use the 2015 Researcher's Guide to check profiles.~~ Done for FLEX, BASS, BRE and SPICE/SLICE; SoFIE, CLD Flame, Flame Design and s-Flame sections are still unused. Add the missing PSI investigations named in Details (SAME-R, FLEX-2, CFI, CFI-G, BRE, E-FIELD, SPICE, SLICE, DAFT) as profiles with hardware groupings.
3. Add a short "Earth applications" section linked to the spinoff resources.
4. Add the 16 other tracked BASS-II runs from Table 5.1 (M1–M5, M9–M11, M13–M20). They share the oxygen-drift caveat.
