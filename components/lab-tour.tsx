"use client";
import { ArrowLeft, ArrowRight, X, ArrowUpRight } from "lucide-react";
export const tourSteps = [
  {
    title: "Start with a measurement.",
    instruction:
      "You’re replaying BASS-II run M7: four published flame-spread rates on a PMMA strip aboard the ISS. Step through them with the observation buttons.",
    science:
      "Values come from Table 5.1 of the BASS-II report. Limitation: oxygen fell during the run, so each rate mixes airflow and oxygen changes. Flame size encodes the rate; it is not video.",
    source: "https://ntrs.nasa.gov/citations/20210011385",
    label: "NASA · BASS-II Table 5.1",
  },
  {
    title: "Compare a Moon base with a real test.",
    instruction:
      "The lab now holds the challenge’s lunar habitat: 30% oxygen at 70.3 kPa. Scroll to the comparison below the lab to see the closest measured fire, Saffire VI-3.",
    science:
      "VI-3 burned acrylic (PMMA) at 30.3% oxygen in a Cygnus spacecraft. Limitation: its pressure (54.6 kPa), forced airflow and microgravity differ from a lunar habitat.",
    source: "https://ntrs.nasa.gov/citations/20240002981",
    label: "NASA · Saffire VI, Table 1",
  },
  {
    title: "Then take away the up.",
    instruction:
      "Drag either flame. Compare the round microgravity envelope with Earth’s rising plume.",
    science:
      "Gravity changes transport around a flame. These shapes illustrate the concept; actual geometry also depends on fuel and airflow.",
    source:
      "https://blogs.nasa.gov/ISS_Science_Blog/2013/11/25/cool-flames-on-the-international-space-station-an-anatomy-of-discovery/",
    label: "NASA · FLEX",
  },
  {
    title: "Turn down the flow.",
    instruction:
      "Airflow is set to zero. Raise it with the slider and watch the envelope respond.",
    science:
      "Still air is not proof of extinction. Some microgravity flames can sustain combustion without an imposed flow.",
    source:
      "https://www.nasa.gov/humans-in-space/space-stations-quest-for-the-secrets-of-fire/",
    label: "NASA · ACME",
  },
  {
    title: "Follow the evidence, not just the glow.",
    instruction:
      "Choose Interpret scenario below. Read the explanation, expand a source card, then save your brief.",
    science:
      "A useful research tool keeps the chain from conditions to measurement, interpretation and limitations. Try the Mission desk next to compare whole investigations.",
    source:
      "https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/",
    label: "Space Apps · The challenge",
  },
];
export default function LabTour({
  step,
  setStep,
  close,
}: {
  step: number;
  setStep: (n: number) => void;
  close: () => void;
}) {
  const item = tourSteps[step];
  return (
    <section className="lab-tour" aria-label="Guided lab walkthrough">
      <div className="tour-topline">
        <span className="eyebrow">
          GUIDED DISCOVERY / {step + 1} OF {tourSteps.length}
        </span>
        <button aria-label="Close guided walkthrough" onClick={close}>
          <X size={16} />
        </button>
      </div>
      <div className="tour-layout">
        <div>
          <h2>{item.title}</h2>
          <p>{item.instruction}</p>
        </div>
        <div className="tour-science">
          <span>WHY IT MATTERS</span>
          <p>{item.science}</p>
          <a href={item.source} target="_blank" rel="noreferrer">
            {item.label} <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
      <div className="tour-navigation">
        <div>
          {tourSteps.map((s, i) => (
            <button
              key={s.title}
              aria-label={`Walkthrough step ${i + 1}: ${s.title}`}
              aria-current={step === i ? "step" : undefined}
              className={i === step ? "active" : ""}
              onClick={() => setStep(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div>
          <button
            className="button subtle"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <button
            className="button primary"
            onClick={() =>
              step === tourSteps.length - 1 ? close() : setStep(step + 1)
            }
          >
            {step === tourSteps.length - 1
              ? "Finish & explore"
              : "Next discovery"}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
