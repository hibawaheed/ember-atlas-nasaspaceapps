"use client";
import { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  Orbit,
  BookOpen,
  LoaderCircle,
} from "lucide-react";
type Answer = {
  question: string;
  answer: string;
  mode: string;
  confidence: string;
  citations: { number: number; id?: string; title?: string; url?: string }[];
  notice?: string;
};
import { findings } from "@/lib/evidence";
const prompts = [
  "Why can a flame survive without airflow?",
  "What does a Moon base atmosphere mean for fire?",
  "Do suppressants that work on Earth work as well in space?",
  "Why must spacecraft smoke detectors differ from Earth ones?",
  "What did FLEX discover about cool flames?",
  "Has anyone studied flame spread in simulated lunar gravity?",
];
export default function AssistantView() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<{ question: string; text: string; sources?: string[] } | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (history.length === 0 && !draft) return;
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [history.length, draft?.question]);
  async function ask(q: string) {
    if (q.trim().length < 3 || loading) return;
    setQuestion("");
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          history: history
            .slice(-2)
            .map((h) => ({ question: h.question.slice(0, 800), answer: h.answer.slice(0, 4000) })),
          stream: true,
        }),
        signal: AbortSignal.timeout(40000),
      });
      const streamed = (response.headers.get("content-type") ?? "").includes("ndjson");
      if (!response.ok || !streamed || !response.body) {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to retrieve evidence.");
        setHistory((h) => [...h, { ...data, question: q }]);
        return;
      }
      // Show the answer while Claude writes it; the final line is the checked version.
      setDraft({ question: q, text: "" });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let final: Omit<Answer, "question"> | null = null;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let cut;
        while ((cut = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, cut).trim();
          buffer = buffer.slice(cut + 1);
          if (!line) continue;
          const msg = JSON.parse(line);
          if (msg.type === "sources") setDraft((d) => ({ question: q, text: d?.text ?? "", sources: msg.items }));
          else if (msg.type === "partial") setDraft((d) => ({ question: q, text: msg.text, sources: d?.sources }));
          else if (msg.type === "final") final = msg.data;
        }
      }
      setDraft(null);
      if (!final) throw new Error("The answer stream ended early. Please try again.");
      const done = final;
      setHistory((h) => [...h, { ...done, question: q }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to retrieve evidence.");
      setDraft(null);
      setQuestion(q);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="assistant-view view-enter">
      <div className="section-intro">
        <div>
          <span className="eyebrow">THE RESEARCH COMPANION</span>
          <h1>Ask the research</h1>
          <p>Explore the science with answers linked to the evidence.</p>
        </div>
        <span className="tag green">
          <i className="status-dot" /> AI + NASA evidence
        </span>
      </div>
      <div className="assistant-workspace">
        <div className="conversation">
          {!history.length && (
            <div className="assistant-welcome">
              <div className="assistant-orbit">
                <Orbit size={36} />
              </div>
              <h2>Search the findings</h2>
              <p>
                Ask about flame behavior, experiment results, or the limits of
                what we know.
              </p>
              <div className="prompt-grid">
                {prompts.map((p) => (
                  <button key={p} onClick={() => ask(p)} disabled={loading}>
                    {p}
                    <ArrowUpRight size={17} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {history.map((item, i) => (
            <div className="conversation-turn" key={i}>
              <div className="question-bubble">{item.question}</div>
              <div className="answer-label">
                <Orbit size={19} />
                <b>EMBER</b>
                <span>
                  {item.mode === "generative"
                    ? "AI synthesis · source grounded"
                    : "Evidence retrieval"}
                </span>
              </div>
              <div className="answer-text">{item.answer}</div>
              <div className="answer-citations">
                {item.citations.map((c) => (
                  <a
                    key={c.number}
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>{c.number}</span>
                    {c.title}
                    <ArrowUpRight size={13} />
                  </a>
                ))}
              </div>
              <p className="fine-print">
                {item.confidence}
                {item.notice ? " · " + item.notice : ""}
              </p>
            </div>
          ))}
          {draft && (
            <div className="conversation-turn" aria-live="polite">
              <div className="question-bubble">{draft.question}</div>
              <div className="answer-label">
                <Orbit size={19} />
                <b>EMBER</b>
                <span>Claude is writing from NASA findings…</span>
              </div>
              {draft.text ? (
                <div className="answer-text">{draft.text}</div>
              ) : (
                <div className="loading-answer" role="status">
                  <LoaderCircle size={18} className="spin" /> Reading the
                  matching NASA findings…
                  {draft.sources?.length ? (
                    <ul className="reading-sources">
                      {draft.sources.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )}
            </div>
          )}
          {loading && !draft && (
            <div className="loading-answer" role="status">
              <LoaderCircle size={18} className="spin" /> Finding relevant NASA
              evidence…
            </div>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div ref={bottom} />
        </div>
        <form
          className="ask-form"
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
        >
          <label className="sr-only" htmlFor="research-question">
            Ask a research question
          </label>
          <input
            id="research-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={800}
            placeholder="What would you like to understand?"
          />
          <button
            type="submit"
            disabled={loading || question.trim().length < 3}
            aria-label="Ask question"
          >
            <ArrowUp size={19} />
          </button>
        </form>
        <p className="assistant-disclosure">
          Answers are written by Claude Haiku 5.5 from the NASA findings that the
          search returns, and cite only those findings. If the AI is unavailable,
          you get the matching findings directly. Answers are research guidance,
          not operational instructions, and should be checked against the sources.
        </p>
      </div>
      <aside className="assistant-principles">
        <BookOpen size={20} />
        <h3>How answers are assembled</h3>
        <p>
          Sources stay attached. Inferences are labeled. When the evidence runs
          out, the answer should stop too.
        </p>
        <div>
          <span>01</span> Search {findings.length} curated NASA findings
        </div>
        <div>
          <span>02</span> Decline questions outside the evidence
        </div>
        <div>
          <span>03</span> AI writes from the top 5, citing only them
        </div>
        <div>
          <span>04</span> Unsupported citations are rejected
        </div>
      </aside>
    </div>
  );
}
