"use client";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  BookOpen,
  MousePointer2,
  SlidersHorizontal,
  Database,
  MessageCircle,
  Download,
} from "lucide-react";
import { sourceFor } from "@/lib/evidence";
const concepts = [
  {
    n: "01",
    title: "Fire loses its up.",
    term: "BUOYANCY → DIFFUSION",
    text: "On Earth, buoyancy carries hot gases upward. In quiet microgravity, oxygen can reach a small flame by diffusion, producing a more spherical envelope. Airflow and fuel shape can change that picture.",
    source: "flex-discovery",
    className: "gravity-sketch",
  },
  {
    n: "02",
    title: "Air is part of the fuel story.",
    term: "VENTILATION & FLAME SPREAD",
    text: "A spacecraft fan changes the transport around a flame. BASS-II measurements connect flow conditions with observed spread, but oxygen also changed during the displayed tests. A correlation is not an isolated cause.",
    source: "bass-report",
    className: "flow-sketch",
  },
  {
    n: "03",
    title: "Your eyes are not a sensor suite.",
    term: "DETECTION & COOL FLAMES",
    text: "FLEX revealed combustion that could continue after a bright flame disappeared. SAME asks a complementary question: what smoke-particle signature should a detector look for?",
    source: "flex-2021",
    secondSource: "same-overview",
    className: "sensor-sketch",
  },
];
const history = [
  {
    year: "1967",
    name: "Apollo 1",
    text: "Three astronauts died when fire broke out in their oxygen-filled spacecraft during a pre-launch test.",
    source: "researchers-guide",
  },
  {
    year: "1970",
    name: "Apollo 13",
    text: "An oxygen tank exploded on the way to the Moon. The crew survived a life-threatening return.",
    source: "researchers-guide",
  },
  {
    year: "1997",
    name: "Mir",
    text: "An oxygen generator failure started a fire aboard the Russian space station; the multinational crew survived.",
    source: "challenge-2026",
  },
  {
    year: "2026",
    name: "Artemis II",
    text: "A smoke alarm went off during the mission. The commander: \u201cmake the fire alarm go off in your spacecraft when you\u2019re still about 80,000 miles from home.\u201d",
    source: "challenge-2026",
  },
];
const questions = [
  {
    question:
      "A flame gets smaller after you reduce ventilation. What can you conclude?",
    answers: [
      "It is definitely extinguished",
      "Its visible behavior changed; extinction still needs evidence",
      "The cabin is now safe",
    ],
    correct: 1,
    why: "Zero imposed flow is not a universal off switch. ACME experiments include flames sustained without forced airflow.",
    source: "acme-results",
  },
  {
    question:
      "Can the BASS-II points tell you exactly what airflow alone caused?",
    answers: [
      "Yes, because the chart contains numbers",
      "Yes, if the points are connected",
      "No; oxygen also changed within each run",
    ],
    correct: 2,
    why: "Keep confounding conditions attached to a measurement. These successive observations are not independent, controlled comparisons of airflow alone.",
    source: "bass-report",
  },
  {
    question: "The flame is blue. What temperature does that represent here?",
    answers: [
      "A precise measured temperature",
      "None; color is an illustrative design choice",
      "A certified low-risk state",
    ],
    correct: 1,
    why: "The animated flame helps you explore concepts. No temperature field, heat-release rate, or safety rating is reconstructed by this demo.",
    source: null,
  },
];
export default function FieldGuide({
  navigate,
  startTour,
}: {
  navigate: (page: string) => void;
  startTour: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const answered = Object.keys(answers).length;
  const correct = questions.filter((q, i) => answers[i] === q.correct).length;
  return (
    <div className="view-enter field-guide">
      <div className="section-intro">
        <div>
          <span className="eyebrow">START HERE / CONTROLS & SCIENCE</span>
          <h1>Field guide</h1>
          <p>
            Start here, then follow a question all the way back to NASA’s
            evidence.
          </p>
        </div>
        <BookOpen size={48} strokeWidth={1} />
      </div>
      <section className="guide-start">
        <div>
          <span className="tag">3-MINUTE WALKTHROUGH</span>
          <h2>Your first three minutes</h2>
          <p>
            The guided lab sets up each scene for you: change gravity, stop the
            flow, explore an atmosphere, replay real measurements, and interpret
            the evidence.
          </p>
        </div>
        <button className="button primary" onClick={startTour}>
          Start the guided lab <ArrowRight size={17} />
        </button>
      </section>
      <section className="howto-grid" aria-label="How to use EMBER Atlas">
        {[
          {
            icon: MousePointer2,
            title: "Move around",
            text: "Drag the flame to orbit. Scroll over it to zoom. Use Reset camera to return home.",
            page: "lab",
          },
          {
            icon: SlidersHorizontal,
            title: "Change one thing",
            text: "Choose Orbit or Earth, then adjust oxygen, airflow, or pressure. Play and speed controls change animation only.",
            page: "lab",
          },
          {
            icon: Database,
            title: "Inspect real data",
            text: "Switch to Measured replay. Select M7 or M8 and step through published observations. The units are mm/s.",
            page: "data",
          },
          {
            icon: MessageCircle,
            title: "Ask why",
            text: "Interpret a scenario, compare investigations in the Mission desk, or ask the Research companion a question.",
            page: "assistant",
          },
          {
            icon: Download,
            title: "Keep the trail",
            text: "Export a brief, download the measured CSV, or share your scenario link. Every claim keeps its source and limits.",
            page: "methodology",
          },
        ].map((s, i) => (
          <button onClick={() => navigate(s.page)} key={s.title}>
            <s.icon size={22} />
            <small>0{i + 1}</small>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <ArrowUpRight className="howto-arrow" size={17} />
          </button>
        ))}
      </section>
      <div className="research-strip">
        <div>
          <span className="section-number">THE SCIENCE /</span>
          <h2>Three essential concepts</h2>
        </div>
      </div>
      <div className="concept-grid">
        {concepts.map((c) => (
          <article key={c.n}>
            <div className={"concept-art " + c.className} aria-hidden="true">
              <span />
              <i />
              <i />
              <i />
              <b>{c.n}</b>
            </div>
            <div className="concept-body">
              <span className="eyebrow">{c.term}</span>
              <h2>{c.title}</h2>
              <p>{c.text}</p>
              <a
                className="text-link"
                href={sourceFor(c.source)!.url}
                target="_blank"
                rel="noreferrer"
              >
                Read the NASA source <ArrowUpRight size={14} />
              </a>
              {c.secondSource && (
                <a
                  className="text-link"
                  href={sourceFor(c.secondSource)!.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  SAME investigation <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
      <section className="panel fire-history">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">WHY IT MATTERS</span>
            <h2>Fires and alarms in crewed spaceflight</h2>
          </div>
        </div>
        <ol>
          {history.map((h) => (
            <li key={h.name}>
              <span className="fire-year">{h.year}</span>
              <div>
                <b>{h.name}</b>
                <p>{h.text}</p>
                <a
                  className="text-link"
                  href={sourceFor(h.source)!.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {sourceFor(h.source)!.type} <ArrowUpRight size={13} />
                </a>
              </div>
            </li>
          ))}
        </ol>
        <p className="fine-print">
          A spacecraft holds all three parts of the fire triangle: fuel, oxygen
          and ignition sources. NASA therefore controls materials, designs
          equipment to limit ignition and carries suppression on every
          spacecraft, according to its 2015 researcher&apos;s guide.
        </p>
      </section>
      <section className="knowledge-check panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">CHECK YOUR UNDERSTANDING</span>
            <h2>What does the evidence actually say?</h2>
          </div>
          <span className="tag">{answered} / 3 answered</span>
        </div>
        {questions.map((q, i) => (
          <fieldset key={q.question}>
            <legend>
              <span>0{i + 1}</span>
              {q.question}
            </legend>
            <div className="quiz-options">
              {q.answers.map((answer, n) => (
                <button
                  key={answer}
                  aria-pressed={answers[i] === n}
                  className={
                    answers[i] === n
                      ? n === q.correct
                        ? "correct"
                        : "retry"
                      : ""
                  }
                  onClick={() => setAnswers({ ...answers, [i]: n })}
                >
                  {answers[i] === n && n === q.correct && <Check size={16} />}
                  {answer}
                </button>
              ))}
            </div>
            {answers[i] !== undefined && (
              <div className="quiz-explanation" role="status">
                <b>
                  {answers[i] === q.correct
                    ? "Exactly."
                    : "Look a little closer."}
                </b>{" "}
                {q.why}
                {q.source && (
                  <a
                    href={sourceFor(q.source)!.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {" "}
                    NASA source ↗
                  </a>
                )}
              </div>
            )}
          </fieldset>
        ))}
        {answered === 3 && (
          <p className="quiz-score">
            {correct === 3
              ? "Three for three. You’re ready to follow the evidence."
              : `${correct} of 3 correct. You can revise an answer after reading the explanation.`}
          </p>
        )}
      </section>
      <section className="glossary panel">
        <span className="eyebrow">REFERENCE</span>
        <h2>Glossary</h2>
        <div>
          {[
            [
              "Microgravity",
              "A free-fall environment where apparent weight and buoyancy are greatly reduced. It does not mean that gravity has disappeared.",
            ],
            [
              "Buoyancy",
              "The density-driven force that makes hot gas rise in a gravity field.",
            ],
            [
              "Diffusion",
              "Molecules spreading from higher to lower concentration, even without a fan.",
            ],
            [
              "PMMA",
              "Polymethyl methacrylate: an acrylic plastic used as a solid fuel in the displayed BASS-II tests.",
            ],
            [
              "Opposed flow",
              "Air flowing against the direction in which the flame spreads along a fuel sample.",
            ],
            [
              "Oxygen partial pressure",
              "Oxygen fraction × total pressure. Useful atmosphere context, but not a complete flammability metric.",
            ],
            [
              "Spread rate",
              "How quickly a flame front travels along a material. It is not the same quantity as heat-release rate.",
            ],
            [
              "PSI",
              "NASA’s Physical Sciences Informatics repository, which links investigations to data and publications.",
            ],
          ].map(([word, meaning]) => (
            <details key={word}>
              <summary>{word}</summary>
              <p>{meaning}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
