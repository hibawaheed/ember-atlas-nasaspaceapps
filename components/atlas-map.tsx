"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Download, X } from "lucide-react";
import { testRecords, fuelClassName, sourceLink, type TestRecord } from "@/lib/nearest";

const COLORS: Record<string, string> = { droplet: "#7cc8ff", gas: "#c3a8ff", solid: "#ffad7a" };
const CREW = [
  { name: "Earth air / ISS", o2: 20.9, p: 101.3 },
  { name: "Moon base scenario", o2: 30, p: 70.3 },
];

type Cluster = { key: string; inv: string; c: TestRecord["c"]; o2: number; p: number; tests: TestRecord[] };

/**
 * Oxygen × pressure map of every NASA test that records both, from the PSI
 * tables and the Saffire VI paper. Tests at the same conditions are drawn as
 * one circle sized by count.
 */
export default function AtlasMap() {
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(720);
  const [classes, setClasses] = useState<Record<string, boolean>>({ droplet: true, gas: true, solid: true });
  const [sel, setSel] = useState<Cluster | null>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.max(300, Math.round(el.clientWidth))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const plotted = useMemo(() => testRecords.filter((t) => t.r === 1 && t.p != null), []);
  const noPressure = useMemo(() => {
    const m = new Map<string, number>();
    testRecords.filter((t) => t.r === 1 && t.p == null).forEach((t) => m.set(t.inv, (m.get(t.inv) ?? 0) + 1));
    return [...m.entries()];
  }, []);
  const clusters = useMemo(() => {
    const m = new Map<string, Cluster>();
    for (const t of plotted) {
      const o2 = Math.round(t.o2 * 2) / 2, p = Math.round(t.p! / 2.5) * 2.5;
      const key = `${t.inv}|${o2}|${p}`;
      const c = m.get(key) ?? { key, inv: t.inv, c: t.c, o2, p, tests: [] };
      c.tests.push(t);
      m.set(key, c);
    }
    return [...m.values()].sort((a, b) => b.tests.length - a.tests.length);
  }, [plotted]);

  const phone = W < 560;
  const H = phone ? 360 : 430;
  const L = phone ? 44 : 58, R = 14, T = 16, B = phone ? 40 : 46;
  const xMin = 10, xMax = 42, pMin = 40, pMax = 520;
  const x = (o2: number) => L + ((o2 - xMin) / (xMax - xMin)) * (W - L - R);
  const y = (p: number) => T + (1 - (Math.log(p) - Math.log(pMin)) / (Math.log(pMax) - Math.log(pMin))) * (H - T - B);
  const fs = phone ? 12 : 13;
  const shown = clusters.filter((c) => classes[c.c]);
  const counts = { droplet: 0, gas: 0, solid: 0 } as Record<string, number>;
  plotted.forEach((t) => (counts[t.c] = (counts[t.c] ?? 0) + 1));
  // Constant oxygen partial pressure through Earth air: p = 21.2 kPa / x.
  const curve = Array.from({ length: 60 }, (_, i) => xMin + 0.5 + i * ((xMax - xMin - 0.5) / 59))
    .map((o) => [o, 2120 / o] as const)
    .filter(([, p]) => p >= pMin && p <= pMax)
    .map(([o, p]) => `${x(o).toFixed(1)},${y(p).toFixed(1)}`)
    .join(" ");

  return (
    <section className="panel atlas-map" aria-labelledby="map-title">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">THE ATLAS</span>
          <h2 id="map-title">Where NASA has burned things: oxygen and pressure</h2>
          <p className="map-lead">
            {plotted.length} microgravity tests from {new Set(plotted.map((t) => t.inv)).size} investigations record both. Click a circle for its tests and NASA record.
          </p>
        </div>
        <a className="button secondary" href="/api/tests?format=csv&limit=3000" download>
          <Download size={14} /> All tests (CSV)
        </a>
      </div>
      <div className="map-filters" role="group" aria-label="Fuel type">
        {(["droplet", "gas", "solid"] as const).map((c) => (
          <button key={c} aria-pressed={classes[c]} className={classes[c] ? "active" : ""} onClick={() => setClasses({ ...classes, [c]: !classes[c] })}>
            <i style={{ background: COLORS[c] }} /> {fuelClassName[c]} · {counts[c]}
          </button>
        ))}
      </div>
      <div className="map-box" ref={box}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Scatter of ${plotted.length} NASA tests by oxygen percentage and pressure. Droplet tests (FLEX, CFI) span 12 to 34 percent oxygen and 50 to 507 kPa; gas flames (CFI-G, Flame Design, s-Flame) 18 to 40 percent; solid materials (Saffire IV–VI) 22 to 31 percent at 54 to 100 kPa. Eight FLEX tests sit at the Moon base scenario of 30 percent and 70 kPa.`}>
          {[10, 15, 20, 25, 30, 35, 40].map((o) => (
            <g key={o}>
              <line x1={x(o)} x2={x(o)} y1={T} y2={H - B} stroke="var(--line)" strokeDasharray="2 5" />
              <text x={x(o)} y={H - B + 18} textAnchor="middle" fontSize={fs} className="map-axis">{o}%</text>
            </g>
          ))}
          {[50, 70, 100, 200, 300, 500].map((p) => (
            <g key={p}>
              <line x1={L} x2={W - R} y1={y(p)} y2={y(p)} stroke="var(--line)" strokeDasharray="2 5" />
              <text x={L - 6} y={y(p) + 4} textAnchor="end" fontSize={fs} className="map-axis">{p}</text>
            </g>
          ))}
          <text x={L + (W - L - R) / 2} y={H - 6} textAnchor="middle" fontSize={fs} className="map-axis">Oxygen in the chamber (% by volume)</text>
          <text x={12} y={T + (H - T - B) / 2} transform={`rotate(-90 12 ${T + (H - T - B) / 2})`} textAnchor="middle" fontSize={fs} className="map-axis">Pressure (kPa, log scale)</text>
          <polyline points={curve} fill="none" stroke="#7fe0c4" strokeOpacity="0.55" strokeDasharray="5 4" />
          {!phone && <text x={x(36.5)} y={y(2120 / 36.5) - 7} fontSize={fs - 0.5} className="map-curve" textAnchor="middle">same O₂ partial pressure as Earth air (21.2 kPa)</text>}
          {shown.map((c) => {
            const r = Math.min(phone ? 11 : 14, 3 + Math.sqrt(c.tests.length) * (phone ? 1.6 : 2));
            return (
              <circle
                key={c.key}
                cx={x(c.o2)}
                cy={y(c.p)}
                r={r}
                fill={COLORS[c.c]}
                fillOpacity={sel?.key === c.key ? 0.95 : 0.5}
                stroke={sel?.key === c.key ? "#fff" : COLORS[c.c]}
                strokeWidth={sel?.key === c.key ? 2 : 1}
                tabIndex={0}
                role="button"
                aria-label={`${c.inv}: ${c.tests.length} test${c.tests.length > 1 ? "s" : ""} at about ${c.o2}% oxygen and ${c.p} kPa`}
                onClick={() => setSel(c)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSel(c))}
                style={{ cursor: "pointer" }}
              >
                <title>{`${c.inv} · ${c.tests.length} test(s) · ~${c.o2}% O₂ · ~${c.p} kPa`}</title>
              </circle>
            );
          })}
          {CREW.map((a) => (
            <g key={a.name} pointerEvents="none">
              <path d={`M${x(a.o2)} ${y(a.p) - 10} l10 10 l-10 10 l-10 -10 z`} fill="none" stroke="#fff" strokeWidth="2" />
              <text x={x(a.o2) + (phone ? -14 : 14)} y={y(a.p) - 12} fontSize={fs} className="map-crew" textAnchor={phone ? "end" : "start"}>{phone ? a.name.replace(" scenario", "") : a.name}</text>
            </g>
          ))}
          <text x={W - R - 2} y={y(29.6 < pMin ? pMin : 29.6) - 6} textAnchor="end" fontSize={fs - 0.5} className="map-axis">{phone ? "Spacesuit (100% O₂) off chart →" : "Spacesuit: 100% O₂ at 29.6 kPa, off this chart →"}</text>
        </svg>
      </div>
      {sel && (
        <div className="map-card" aria-live="polite">
          <button className="map-close" aria-label="Close" onClick={() => setSel(null)}><X size={16} /></button>
          <b>{sel.inv}</b> · {sel.tests.length} test{sel.tests.length > 1 ? "s" : ""} near {sel.o2}% O₂ and {sel.p} kPa
          <ul>
            {sel.tests.slice(0, 6).map((t) => (
              <li key={t.id}>
                Test {t.t}{t.d ? ` (${t.d})` : ""}: {t.f}, {t.o2}% O₂, {t.p} kPa{t.o ? ` · ${t.o}` : ""}
              </li>
            ))}
            {sel.tests.length > 6 && <li>…and {sel.tests.length - 6} more in the CSV</li>}
          </ul>
          <a className="text-link" href={sourceLink(sel.tests[0]).href} target="_blank" rel="noreferrer">
            {sourceLink(sel.tests[0]).label} <ArrowUpRight size={13} />
          </a>
        </div>
      )}
      <p className="fine-print">
        All tests ran in microgravity (ISS or Cygnus). Oxygen is the chamber value at the start of each test; inverse flames, where oxygen comes from the burner, are left out. Also
        recorded but without a pressure in NASA&apos;s tables: {noPressure.map(([inv, n]) => `${inv} (${n})`).join(", ")}. The dashed line is arithmetic, not a
        flammability limit.
      </p>
    </section>
  );
}
