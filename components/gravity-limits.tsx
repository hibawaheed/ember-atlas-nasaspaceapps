"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { partialGravity as pg, meanLimit, worseThanBothEnds, type GravityKey } from "@/lib/partial-gravity";

const colors = ["#ffb27d", "#8fd3ff", "#c8b6ff"];

/**
 * Measured limiting oxygen at 0g*, lunar, Martian and Earth gravity for three
 * materials (Olson & Ferkul 2012, Table I). Bars span MOC*–ULOI*; dots are the
 * mean the paper uses.
 */
export default function GravityLimits({ compact = false }: { compact?: boolean }) {
  const levels = pg.gravityLevels as { key: GravityKey; label: string; g: number }[];
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.max(280, Math.round(el.clientWidth))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const phone = W < 520;
  const short: Record<string, string> = { zero: "0g*", lunar: "Lunar", martian: "Mars", earth: "Earth" };
  const H = compact ? 250 : 290, L = phone ? 44 : 54, R = 12, T = 18, B = 46;
  const x = (i: number) => L + (i + 0.5) * ((W - L - R) / levels.length);
  const yMin = 13, yMax = 25;
  const y = (v: number) => T + ((yMax - v) / (yMax - yMin)) * (H - T - B);
  const lunarWorse = worseThanBothEnds("lunar");
  return (
    <figure className="gravity-limits">
      <figcaption>
        <b>Measured, not interpolated.</b> At lunar gravity all {lunarWorse.length} materials burned at lower oxygen than in either microgravity or Earth gravity, so for these materials the two ends do not bracket the middle.
      </figcaption>
      <div ref={box} className="gl-box">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Limiting oxygen by gravity level. ${pg.materials.map((m) => `${m.material} (${m.pressurePsia} psia): ${levels.map((l) => `${l.label} ${meanLimit(m, l.key).toFixed(1)}%`).join(", ")}`).join(". ")}.`}>
        {[14, 16, 18, 20, 22, 24].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeDasharray="3 4" />
            <text x={L - 8} y={y(v) + 4} textAnchor="end" className="gl-axis">{v}%</text>
          </g>
        ))}
        {!phone && <text x={14} y={T + (H - T - B) / 2} transform={`rotate(-90 14 ${T + (H - T - B) / 2})`} textAnchor="middle" className="gl-axis">Limiting oxygen (mol %)</text>}
        {levels.map((l, i) => (
          <text key={l.key} x={x(i)} y={H - 22} textAnchor="middle" className="gl-level">{phone ? short[l.key] : l.label}</text>
        ))}
        {levels.map((l, i) => (
          <text key={l.key + "g"} x={x(i)} y={H - 7} textAnchor="middle" className="gl-axis">{l.g} g</text>
        ))}
        {pg.materials.map((m, mi) => {
          const off = (mi - 1) * (phone ? 9 : 14);
          const pts = levels.map((l, i) => `${x(i) + off},${y(meanLimit(m, l.key))}`).join(" ");
          return (
            <g key={m.material}>
              <polyline points={pts} fill="none" stroke={colors[mi]} strokeWidth="1.6" strokeOpacity="0.65" />
              {levels.map((l, i) => (
                <g key={l.key}>
                  <line x1={x(i) + off} x2={x(i) + off} y1={y(m.limits[l.key].ULOI)} y2={y(m.limits[l.key].MOC)} stroke={colors[mi]} strokeWidth="5" strokeLinecap="round" strokeOpacity="0.45" />
                  <circle cx={x(i) + off} cy={y(meanLimit(m, l.key))} r="4.5" fill={colors[mi]}>
                    <title>{`${m.material}, ${l.label}: ULOI ${m.limits[l.key].ULOI}%, MOC ${m.limits[l.key].MOC}%`}</title>
                  </circle>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      </div>
      {phone && <p className="gl-note">Vertical axis: limiting oxygen (mol %). 0g* had 30 cm/s forced flow.</p>}
      <ul className="gl-legend">
        {pg.materials.map((m, i) => (
          <li key={m.material}>
            <i style={{ background: colors[i] }} /> {m.material} · {m.pressurePsia} psia
          </li>
        ))}
      </ul>
      {!compact && (
        <div className="table-wrap">
          <table className="gl-table">
            <caption>Limiting oxygen, mol % (ULOI / MOC). Lower means the material keeps burning in leaner air.</caption>
            <thead>
              <tr>
                <th>Material</th>
                {levels.map((l) => <th key={l.key}>{l.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {pg.materials.map((m) => (
                <tr key={m.material}>
                  <th>{m.material} ({m.pressurePsia} psia)</th>
                  {levels.map((l) => <td key={l.key}>{m.limits[l.key].ULOI} / {m.limits[l.key].MOC}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="fine-print">
        Drop-tower tests of about 5 s in NASA Glenn&apos;s Zero Gravity Facility; reduced-gravity limits are defined differently from 1-g limits because of the short test time; the 0g* tests had 30 cm/s forced flow. Three thin materials, published outside PSI. Every limit here is below the 30% oxygen expected in a Moon base.{" "}
        <a className="text-link" href={`${pg.source.pdfUrl}#page=6`} target="_blank" rel="noreferrer">
          Olson &amp; Ferkul, NASA, Table I <ArrowUpRight size={12} />
        </a>{" "}
        (lunar and 0g rows from Ferkul &amp; Olson, 2011)
      </p>
    </figure>
  );
}
