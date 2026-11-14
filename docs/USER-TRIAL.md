# User trial: protocol and recording sheet

A short task-based trial to find where people get stuck. Five participants is enough to find most problems. Aim for a mix: one or two engineering or science students, one person who knows nothing about combustion, and if possible one person with fire-safety or aerospace background.

## Before the session

- Use the live site, https://emberatlas.tech, on the participant's own device if possible (note phone or laptop). Write down the build from the footer.
- Tell the participant: "We're testing the site, not you. Think aloud. There are no wrong answers." Do not help unless they are stuck for more than two minutes; note when you do.
- About 15 minutes per person. Record notes only; no names in the notes.

## Main task: does the atlas save research effort?

Give each participant this task twice, once with the original sources and once with the atlas:

> "Find a published acrylic test close to the lunar preset (30% oxygen, 70.3 kPa). Cite its original table and name two conditions that differ."

- **Original-sources route:** start them at NTRS (https://ntrs.nasa.gov) and PSI (https://psi.nasa.gov) with no other hint.
- **Atlas route:** start them at https://emberatlas.tech.
- Alternate which route goes first (odd-numbered participants start with the original sources, even-numbered with the atlas), so learning from the first attempt does not always favor the same route.
- Stop a route after 10 minutes.

Record for each route:

| Participant | Route | First? | Time to reach the source table | Test identified (correct = Saffire VI-3, Table 1) | Differing conditions named | Limitations noticed unprompted | Mistakes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P1 | Original sources | yes | | | | | |
| P1 | Atlas | no | | | | | |

Report the actual times and correctness with the participant count. With five people this shows where people get stuck, not a statistically reliable speed-up. Use the first mistake two or more people make to choose the next interface change.

## Follow-up tasks

Read each task aloud. Don't use the button names in the task. Skip tasks 2 and 3 for participants who just completed the main task on the atlas route.

1. **First look (no clicks, 15 s).** "What do you think this site is for, and who is it for?"
2. **Moon question.** "A Moon base might run at 30% oxygen. Find out whether NASA has measured a fire close to that, and what is different about that test."
3. **Source.** "Show me where that number comes from in NASA's own document."
4. **Measured vs. illustrated.** "In the flame view, which numbers are measurements and which are not?"
5. **Search.** "Find what NASA has learned about acrylic burning."
6. **Detection.** "For a Moon base, find an example of how well a smoke alarm level worked in a real test."
7. **Ask.** "Ask the site whether anyone has studied fire in lunar gravity. Do you trust the answer? Why?"
8. **Take away.** "Save something you could send to a teammate about the Moon question."

## Recording sheet (copy one per participant)

| # | Task | Completed? (yes / with help / no) | Time | Where they hesitated or went wrong | Quote |
| --- | --- | --- | --- | --- | --- |
| 1 | First look | | | | |
| 2 | Moon question | | | | |
| 3 | Source | | | | |
| 4 | Measured vs. illustrated | | | | |
| 5 | Search | | | | |
| 6 | Detection | | | | |
| 7 | Ask | | | | |
| 8 | Take away | | | | |

Participant background: ______  Device: ______  Build: ______  Date: ______

## After the session

Ask three questions and note the answers:

- "What was the most useful thing you found?"
- "What was confusing?"
- "Did anything look more certain than it should be?"

## Summarize

For each task, count completions out of the number of participants, and list each problem with how many people hit it. Fix the problems most people hit first. Record the summary, the build tested and the date in `docs/VALIDATION.md`.

**Status:** protocol ready; no sessions run yet. Results will be added here when the team runs them.
