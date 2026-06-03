import React, { useState } from "react";
import { minutesToHumanTime } from "../utils/attendanceCalculator.js";

export default function AttendanceTable({ dayResults }) {
  const [expandedRow, setExpandedRow] = useState(null);

  if (!dayResults?.length) return null;

  const toggleRow = (idx) =>
    setExpandedRow((prev) => (prev === idx ? null : idx));

  return (
    <div style={styles.wrapper}>
      <div style={styles.tableHeader}>
        <h3 style={styles.title}>Day-wise Attendance</h3>
        <span style={styles.hint}>
          Click any row to see calculation breakdown
        </span>
      </div>

      <div style={styles.tableScroll}>
        <table style={styles.table}>
          <thead>
            <tr>
              {COLS.map((c) => (
                <th key={c.key} style={{ ...styles.th, ...c.thStyle }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dayResults.map((day, idx) => (
              <React.Fragment key={`${day.date}-${idx}`}>
                <tr
                  style={{
                    ...styles.tr,
                    background:
                      expandedRow === idx
                        ? "rgba(102,126,234,0.1)"
                        : idx % 2 === 0
                          ? "rgba(255,255,255,0.015)"
                          : "transparent",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleRow(idx)}
                >
                  <td style={styles.td}>{fmtDate(day.date)}</td>
                  <td style={styles.td}>{day.inTime || "—"}</td>
                  <td style={styles.td}>{day.outTime || "—"}</td>
                  <td style={styles.td}>{renderOOO(day)}</td>
                  <td style={styles.td}>
                    {minutesToHumanTime(day.totalMinutes)}
                  </td>
                  <td style={styles.td}>
                    {day.oooDeductedMinutes > 0 ? (
                      <span style={{ color: "#ff4d4f" }}>
                        −{minutesToHumanTime(day.oooDeductedMinutes)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ ...styles.td, fontWeight: 700 }}>
                    {minutesToHumanTime(day.effectiveMinutes)}
                  </td>
                  <td style={styles.td}>
                    {day.overtimeMinutes > 0 ? (
                      <span style={{ color: "#00e5ff" }}>
                        +{minutesToHumanTime(day.overtimeMinutes)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
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
                      ...styles.td,
                      color: "var(--text-muted)",
                      fontSize: 16,
                    }}
                  >
                    {expandedRow === idx ? "▲" : "▼"}
                  </td>
                </tr>

                {/* Expandable breakdown row */}
                {expandedRow === idx && (
                  <tr>
                    <td colSpan={COLS.length} style={styles.breakdownCell}>
                      <BreakdownPanel day={day} />
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

function renderOOO(day) {
  if (!day.oooEntries?.length) return "—";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {day.oooEntries.map((e, i) => (
        <span key={i} style={{ fontSize: 12, color: "#faad14" }}>
          {e.out || "?"} → {e.in || "?"}
        </span>
      ))}
    </div>
  );
}

function BreakdownPanel({ day }) {
  return (
    <div style={bd.panel}>
      <div style={bd.header}>
        <span style={bd.icon}>🔍</span>
        How this day was calculated
      </div>
      <div style={bd.steps}>
        {day.breakdown?.map((step, i) => (
          <div
            key={i}
            style={{
              ...bd.step,
              ...(step.highlight ? bd.stepHL : {}),
              ...(step.status ? bd.stepStatus : {}),
            }}
          >
            <div style={bd.stepLabel}>{step.label}</div>
            <div style={bd.stepDetail}>{step.detail}</div>
            {step.value && (
              <div
                style={{
                  ...bd.stepValue,
                  color: step.good
                    ? "#04ff58"
                    : step.deduct
                      ? "#ff4d4f"
                      : step.warn
                        ? "#faad14"
                        : step.status
                          ? day.statusColor
                          : step.highlight
                            ? "#667eea"
                            : "var(--text-highlight)",
                }}
              >
                {step.value}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const COLS = [
  { key: "date", label: "Date", thStyle: { minWidth: 110 } },
  { key: "in", label: "In Time", thStyle: {} },
  { key: "out", label: "Out Time", thStyle: {} },
  { key: "ooo", label: "OOO (Mid-day)", thStyle: { minWidth: 120 } },
  { key: "gross", label: "Gross Hrs", thStyle: {} },
  { key: "deduct", label: "OOO Deduction", thStyle: {} },
  { key: "effective", label: "Effective Hrs", thStyle: {} },
  { key: "ot", label: "Overtime", thStyle: {} },
  { key: "status", label: "Status", thStyle: { minWidth: 100 } },
  { key: "expand", label: "", thStyle: { width: 30 } },
];

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

const styles = {
  wrapper: { display: "flex", flexDirection: "column", gap: 0 },

  tableHeader: {
    display: "flex",
    alignItems: "baseline",
    gap: 16,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--text-white)",
    margin: 0,
  },
  hint: { fontSize: 12, color: "var(--text-muted)" },

  tableScroll: { overflowX: "auto" },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },

  th: {
    padding: "10px 14px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: 11,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
    whiteSpace: "nowrap",
  },

  tr: { transition: "background 0.15s ease" },

  td: {
    padding: "12px 14px",
    color: "var(--text-highlight)",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    whiteSpace: "nowrap",
  },

  statusBadge: {
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.3px",
  },

  breakdownCell: {
    padding: 0,
    borderBottom: "1px solid rgba(102,126,234,0.2)",
  },
};

const bd = {
  panel: {
    padding: "16px 24px 20px",
    background: "rgba(10,10,30,0.6)",
    borderLeft: "3px solid #667eea",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 700,
    color: "#667eea",
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  icon: { fontSize: 16 },
  steps: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  step: {
    display: "flex",
    alignItems: "baseline",
    gap: 12,
    flexWrap: "wrap",
    padding: "8px 12px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
  },
  stepHL: {
    background: "rgba(102,126,234,0.08)",
    border: "1px solid rgba(102,126,234,0.2)",
  },
  stepStatus: {
    background: "rgba(4,255,88,0.05)",
    border: "1px solid rgba(4,255,88,0.15)",
  },
  stepLabel: {
    minWidth: 130,
    fontSize: 12,
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  stepDetail: {
    flex: 1,
    fontSize: 13,
    color: "var(--text-highlight)",
  },
  stepValue: {
    fontWeight: 700,
    fontSize: 14,
    minWidth: 80,
    textAlign: "right",
  },
};
