import React, { useState } from "react";
import { toHHMM, toHuman, toHumanAbs } from "../utils/attendanceCalculator.js";

export default function AttendanceTable({ dayResults }) {
  const [expanded, setExpanded] = useState(null);
  if (!dayResults?.length) return null;

  const toggle = (i) => setExpanded((p) => (p === i ? null : i));

  return (
    <div style={s.wrap}>
      <div style={s.titleRow}>
        <h3 style={s.title}>Day-wise Attendance</h3>
        <span style={s.hint}>
          Click any row to see full calculation breakdown
        </span>
      </div>

      <div style={s.scroll}>
        <table style={s.table}>
          <thead>
            <tr>
              {COLS.map((c) => (
                <th key={c.key} style={{ ...s.th, ...c.style }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dayResults.map((day, i) => (
              <React.Fragment key={day.dateStr}>
                <tr
                  style={{
                    ...s.tr,
                    background:
                      expanded === i
                        ? "rgba(102,126,234,0.1)"
                        : i % 2 === 0
                          ? "rgba(255,255,255,0.015)"
                          : "transparent",
                    cursor: "pointer",
                  }}
                  onClick={() => toggle(i)}
                >
                  <td style={s.td}>{fmtDate(day.dateStr)}</td>
                  <td style={s.td}>{day.inTime || "—"}</td>
                  <td style={s.td}>{day.outTime || "—"}</td>
                  <td style={s.td}>{renderOOO(day.oooPairs)}</td>
                  <td style={s.td}>{toHHMM(day.grossMins)}</td>
                  <td style={s.td}>
                    {day.totalOOODeductedMins > 0 ? (
                      <span style={{ color: "#faad14" }}>
                        −{toHHMM(day.totalOOODeductedMins)}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>
                  <td
                    style={{
                      ...s.td,
                      fontWeight: 700,
                      color: "var(--text-white)",
                    }}
                  >
                    {toHHMM(day.effectiveMins)}
                  </td>

                  {/* ── +/- diff column ── */}
                  <td style={s.td}>{renderDiff(day.diffMins, day.status)}</td>

                  <td style={s.td}>
                    <span
                      style={{
                        ...s.badge,
                        background: day.statusColor + "22",
                        color: day.statusColor,
                        border: `1px solid ${day.statusColor}44`,
                      }}
                    >
                      {day.status}
                    </span>
                  </td>
                  <td
                    style={{
                      ...s.td,
                      color: "var(--text-muted)",
                      textAlign: "center",
                    }}
                  >
                    {expanded === i ? "▲" : "▼"}
                  </td>
                </tr>

                {expanded === i && (
                  <tr>
                    <td
                      colSpan={COLS.length}
                      style={{
                        padding: 0,
                        borderBottom: "1px solid rgba(102,126,234,0.2)",
                      }}
                    >
                      <Breakdown day={day} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>

          {/* ── Running totals footer ── */}
          <TableFooter dayResults={dayResults} />
        </table>
      </div>
    </div>
  );
}

// ── Running diff column renderer ──────────────────────────────────────────────

function renderDiff(diffMins, status) {
  if (diffMins == null)
    return <span style={{ color: "var(--text-muted)" }}>—</span>;

  // Week off: no diff shown
  if (status === "Week Off")
    return <span style={{ color: "var(--text-muted)" }}>—</span>;

  const isPositive = diffMins >= 0;
  const color = isPositive ? "#04ff58" : "#ff4d4f";
  const prefix = isPositive ? "+" : "";
  const h = Math.floor(Math.abs(diffMins) / 60);
  const m = Math.abs(diffMins) % 60;
  const label = h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`;

  return (
    <span style={{ color, fontWeight: 700, fontSize: 13 }}>
      {prefix}
      {label}
    </span>
  );
}

// ── Footer with column totals ─────────────────────────────────────────────────

function TableFooter({ dayResults }) {
  const workDays = dayResults.filter((d) => d.status !== "Week Off");
  const totalEff = workDays.reduce((s, d) => s + (d.effectiveMins || 0), 0);
  const totalOOO = workDays.reduce(
    (s, d) => s + (d.totalOOODeductedMins || 0),
    0
  );
  const totalDiff = workDays.reduce((s, d) => s + (d.diffMins ?? 0), 0);
  const pos = workDays.reduce((s, d) => s + Math.max(0, d.diffMins ?? 0), 0);
  const neg = workDays.reduce((s, d) => s + Math.min(0, d.diffMins ?? 0), 0);
  const diffColor = totalDiff >= 0 ? "#04ff58" : "#ff4d4f";

  return (
    <tfoot>
      <tr
        style={{
          background: "rgba(102,126,234,0.1)",
          borderTop: "2px solid rgba(102,126,234,0.3)",
        }}
      >
        <td style={f.td} colSpan={4}>
          <strong style={{ color: "var(--text-white)" }}>Totals</strong>
        </td>
        <td style={f.td}></td>
        <td style={{ ...f.td, color: "#faad14" }}>
          {totalOOO > 0 ? `−${toHHMM(totalOOO)}` : "—"}
        </td>
        <td style={{ ...f.td, color: "var(--text-white)", fontWeight: 800 }}>
          {toHHMM(totalEff)}
        </td>
        <td style={f.td}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ color: "#04ff58", fontSize: 11 }}>
              +{toHHMM(pos)}
            </span>
            <span style={{ color: "#ff4d4f", fontSize: 11 }}>
              {toHHMM(neg)}
            </span>
            <span style={{ color: diffColor, fontWeight: 800, fontSize: 13 }}>
              Net: {totalDiff >= 0 ? "+" : ""}
              {toHHMM(totalDiff)}
            </span>
          </div>
        </td>
        <td style={f.td} colSpan={2}></td>
      </tr>
    </tfoot>
  );
}

// ── Breakdown panel ───────────────────────────────────────────────────────────

function Breakdown({ day }) {
  const typeColor = {
    good: "#04ff58",
    bad: "#ff4d4f",
    warn: "#faad14",
    highlight: "#667eea",
    neutral: "var(--text-highlight)",
    info: "#a78bfa",
  };

  return (
    <div style={bd.panel}>
      <div style={bd.header}>🔍 Calculation Breakdown</div>

      {/* Raw punches */}
      {day.punches?.length > 0 && (
        <div style={bd.punchRow}>
          <span style={bd.punchLabel}>Raw Punches:</span>
          {day.punches.map((p, i) => (
            <span key={i} style={bd.punch}>
              {p.time}
              <span style={bd.punchNote}>
                {i === 0
                  ? " (IN)"
                  : i === day.punches.length - 1
                    ? " (OUT)"
                    : " (OOO)"}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Steps */}
      <div style={bd.steps}>
        {day.breakdown?.map((step, i) => (
          <div key={i} style={bd.step}>
            <span style={bd.stepLabel}>{step.label}</span>
            <span style={bd.stepDetail}>{step.detail}</span>
            {step.value && (
              <span
                style={{
                  ...bd.stepVal,
                  color: typeColor[step.type] || "var(--text-highlight)",
                }}
              >
                {step.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const COLS = [
  { key: "date", label: "Date", style: { minWidth: 110 } },
  { key: "in", label: "In", style: {} },
  { key: "out", label: "Out", style: {} },
  { key: "ooo", label: "OOO (Mid-day)", style: { minWidth: 110 } },
  { key: "gross", label: "Gross", style: {} },
  { key: "ded", label: "OOO Deducted", style: {} },
  { key: "eff", label: "Effective", style: {} },
  { key: "diff", label: "+/− vs Target", style: { minWidth: 110 } },
  { key: "status", label: "Status", style: { minWidth: 110 } },
  { key: "expand", label: "", style: { width: 28 } },
];

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function renderOOO(pairs) {
  if (!pairs?.length)
    return <span style={{ color: "var(--text-muted)" }}>—</span>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {pairs.map((p, i) => (
        <span key={i} style={{ fontSize: 11, color: "#faad14" }}>
          {p.out} → {p.in}
        </span>
      ))}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 12 },
  titleRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 14,
    flexWrap: "wrap",
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--text-white)",
    margin: 0,
  },
  hint: { fontSize: 12, color: "var(--text-muted)" },
  scroll: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "10px 13px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: ".4px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
    whiteSpace: "nowrap",
  },
  tr: { transition: "background .15s" },
  td: {
    padding: "11px 13px",
    color: "var(--text-highlight)",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  },
  badge: {
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
  },
};

const f = {
  td: {
    padding: "12px 13px",
    color: "var(--text-highlight)",
    verticalAlign: "middle",
  },
};

const bd = {
  panel: {
    padding: "16px 24px 20px",
    background: "rgba(8,8,25,0.7)",
    borderLeft: "3px solid #667eea",
  },
  header: {
    fontSize: 12,
    fontWeight: 800,
    color: "#667eea",
    textTransform: "uppercase",
    letterSpacing: ".6px",
    marginBottom: 14,
  },
  punchRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
    padding: "8px 12px",
    background: "rgba(102,126,234,0.07)",
    border: "1px solid rgba(102,126,234,0.15)",
    borderRadius: 8,
  },
  punchLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--text-muted)",
    marginRight: 4,
  },
  punch: { fontSize: 13, fontWeight: 600, color: "var(--text-white)" },
  punchNote: { fontSize: 10, color: "var(--text-muted)", fontWeight: 400 },
  steps: { display: "flex", flexDirection: "column", gap: 7 },
  step: {
    display: "flex",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: 10,
    padding: "8px 12px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
    borderRadius: 7,
  },
  stepLabel: {
    minWidth: 140,
    fontSize: 11,
    fontWeight: 800,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: ".4px",
    flexShrink: 0,
  },
  stepDetail: {
    flex: 1,
    fontSize: 12,
    color: "var(--text-highlight)",
    lineHeight: 1.5,
  },
  stepVal: { fontSize: 13, fontWeight: 800, minWidth: 70, textAlign: "right" },
};
