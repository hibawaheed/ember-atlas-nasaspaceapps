"use client";
import { useMemo, useState } from "react";
import {
  Search,
  ArrowUpRight,
  Filter,
  Download,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import {
  findings,
  sources,
  retrieve,
  type Finding,
  sourceFor,
} from "@/lib/evidence";
import { download } from "@/lib/export";
export function EvidenceCard({
  finding,
  compact = false,
}: {
  finding: Finding;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <article className={"evidence-card " + (compact ? "compact" : "")}>
      <div className="evidence-top">
        <span className="experiment-label">{finding.experiment}</span>
        <span
          className={"tag " + (finding.strength === "observed" ? "green" : "")}
        >
          {finding.strength === "observed"
            ? "Observed"
            : finding.strength === "review"
              ? "Review"
              : "Research aim"}
        </span>
      </div>
      <h3>{finding.title}</h3>
      <p>{finding.claim}</p>
      <div className="inference">
        <span>WHAT THIS MEANS</span>
        <p>{finding.safetyImplication}</p>
      </div>
      <div className="evidence-bottom">
        <button onClick={() => setOpen(!open)} aria-expanded={open}>
          Scope & sources{" "}
          <ChevronDown size={14} className={open ? "rotated" : ""} />
        </button>
        <span>{finding.date?.slice(0, 4) || "NASA"}</span>
      </div>
      {open && (
        <div className="evidence-expanded">
          <p>
            <b>Limitations:</b> {finding.limitations}
          </p>
          <p>Safety implication is an editorial inference.</p>
          {finding.sourceIds.map((id) => {
            const s = sourceFor(id);
            return s ? (
              <a key={id} href={s.url} target="_blank" rel="noreferrer">
                {s.title}
                <ArrowUpRight size={14} />
              </a>
            ) : null;
          })}
        </div>
      )}
    </article>
  );
}
export default function EvidenceView() {
  const [query, setQuery] = useState("");
  const [program, setProgram] = useState("All programs");
  const [strength, setStrength] = useState("all");
  const [sort, setSort] = useState("relevance");
  const results = useMemo(() => {
    let list = query ? retrieve(query, 50) : [...findings];
    list = list.filter(
      (f) =>
        (program === "All programs" || f.experiment.startsWith(program)) &&
        (strength === "all" || f.strength === strength),
    );
    if (sort === "newest")
      list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    return list;
  }, [query, program, strength, sort]);
  return (
    <div className="view-enter">
      <div className="section-intro">
        <div>
          <span className="eyebrow">THE EVIDENCE LIBRARY</span>
          <h1>Evidence library</h1>
          <p>
            Find the observation. Understand the implication. Follow the source.
          </p>
        </div>
        <button
          className="button secondary"
          onClick={() =>
            download(
              "ember-evidence.json",
              JSON.stringify({ findings: results, sources }, null, 2),
            )
          }
        >
          <Download size={16} /> Export evidence
        </button>
      </div>
      <div className="search-bar">
        <Search size={19} />
        <input
          aria-label="Search NASA findings"
          placeholder="Search airflow, cool flames, extinction…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span>{findings.length} curated findings</span>
      </div>
      <div className="filter-row">
        <div className="filter-pills">
          {[
            "All programs",
            "FLEX",
            "BASS-II",
            "ACME",
            "Saffire",
            "SoFIE",
            "SAME",
          ].map((p) => (
            <button
              key={p}
              aria-pressed={program === p}
              className={program === p ? "active" : ""}
              onClick={() => setProgram(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <label className="select-label">
          <Filter size={14} />
          <select
            aria-label="Evidence type"
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
          >
            <option value="all">All evidence</option>
            <option value="observed">Observations</option>
            <option value="review">Reviews</option>
            <option value="program-goal">Research aims</option>
          </select>
        </label>
        <select
          aria-label="Sort findings"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest</option>
        </select>
      </div>
      <p className="results-note">
        {results.length} findings · Relevance uses transparent text matching. It
        is not a scientific confidence score.
      </p>
      <div className="evidence-grid">
        {results.map((f) => (
          <EvidenceCard key={f.id} finding={f} />
        ))}
      </div>
      {!results.length && (
        <div className="empty-state">
          <BookOpen />
          <h3>No matching evidence yet</h3>
          <p>
            Try a broader term or another program. This is a curated subset of
            NASA’s research.
          </p>
          <button
            className="button secondary"
            onClick={() => {
              setQuery("");
              setProgram("All programs");
              setStrength("all");
            }}
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
