import React, { useState } from "react";
import { toHHMM, toHuman } from "../utils/attendanceCalculator.js";
import { RULES } from "../attendanceRules.js";

export default function AttendanceTable({ dayResults }) {
  const [expanded, setExpanded] = useState(null);
  if (!dayResults?.length) return null;

  const toggle = (i) => setExpanded((p) => (p === i ? null : i));

  return (
    <div style={s.wrap}>
      <div style={s.titleRow}>
        <h3 style={s.title}>Day-wise Attendance</h3>
        <span style={s.hint}>
          Click any row to see how hours were calculated
        </span>
      </div>

      <div style={s.scroll}>
        <table style={s.table}>
          <thead>
            <tr>
              {COLS.map((c) => (
                <th key={c} style={s.th}>
                  {c}
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
                      "—"
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
                  <td style={{ ...s.td, color: "var(--text-muted)" }}>
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
        </table>
      </div>
    </div>
  );
}

// ── Breakdown panel ───────────────────────────────────────────────────────────

function Breakdown({ day }) {
  const typeStyle = {
    good: { color: "#04ff58" },
    bad: { color: "#ff4d4f" },
    warn: { color: "#faad14" },
    highlight: { color: "#667eea" },
    neutral: { color: "var(--text-highlight)" },
    info: { color: "#a78bfa" },
  };

  return (
    <div style={bd.panel}>
      <div style={bd.header}>🔍 Calculation Breakdown</div>

      {/* All punches for this day */}
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

      {/* Step-by-step breakdown */}
      <div style={bd.steps}>
        {day.breakdown?.map((step, i) => (
          <div key={i} style={bd.step}>
            <span style={bd.stepLabel}>{step.label}</span>
            <span style={bd.stepDetail}>{step.detail}</span>
            {step.value && (
              <span style={{ ...bd.stepVal, ...(typeStyle[step.type] || {}) }}>
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
  "Date",
  "In",
  "Out",
  "OOO (Mid-day)",
  "Gross",
  "OOO Deducted",
  "Effective",
  "Status",
  "",
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
  },
  badge: {
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
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
