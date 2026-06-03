import React from "react";
import { minutesToHumanTime } from "../utils/attendanceCalculator.js";

export default function SummaryCard({ summary, employee }) {
  if (!summary || !employee) return null;

  const tiles = [
    {
      label: "Work Days",
      value: summary.totalWorkDays,
      icon: "🗓️",
      color: "#667eea",
    },
    {
      label: "Full Days",
      value: summary.fullDays + summary.overtimeDays,
      icon: "✅",
      color: "#04ff58",
    },
    {
      label: "Half Days",
      value: summary.halfDays,
      icon: "🌗",
      color: "#faad14",
    },
    {
      label: "Absents",
      value: summary.absentDays,
      icon: "❌",
      color: "#ff4d4f",
    },
    {
      label: "Week Offs",
      value: summary.weekOffs,
      icon: "😴",
      color: "#a78bfa",
    },
    {
      label: "Overtime Days",
      value: summary.overtimeDays,
      icon: "⏰",
      color: "#00e5ff",
    },
  ];

  const attPct = summary.attendancePercent;
  const attColor =
    attPct >= 85 ? "#04ff58" : attPct >= 70 ? "#faad14" : "#ff4d4f";

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.avatar}>{getInitials(employee.empName)}</div>
        <div>
          <div style={styles.empName}>{employee.empName}</div>
          <div style={styles.empMeta}>
            ID: {employee.empId}
            {employee.fileType ? (
              <span style={styles.badge}>{employee.fileType}</span>
            ) : null}
          </div>
        </div>
        <div style={{ ...styles.attPct, color: attColor }}>
          {attPct}%<span style={styles.attLabel}>Attendance</span>
        </div>
      </div>

      {/* Tiles */}
      <div style={styles.tiles}>
        {tiles.map((t) => (
          <div key={t.label} style={styles.tile}>
            <span style={styles.tileIcon}>{t.icon}</span>
            <span style={{ ...styles.tileValue, color: t.color }}>
              {t.value}
            </span>
            <span style={styles.tileLabel}>{t.label}</span>
          </div>
        ))}
      </div>

      {/* Hours summary */}
      <div style={styles.hoursRow}>
        <HoursBadge
          label="Effective Hours"
          value={minutesToHumanTime(summary.totalEffectiveMins)}
          color="#667eea"
        />
        <HoursBadge
          label="Required Hours"
          value={minutesToHumanTime(summary.requiredMins)}
          color="#a78bfa"
        />
        <HoursBadge
          label="Overtime Total"
          value={minutesToHumanTime(summary.totalOvertimeMins)}
          color="#00e5ff"
        />
        <HoursBadge
          label="Deficit"
          value={minutesToHumanTime(summary.deficitMins)}
          color="#ff4d4f"
        />
        <HoursBadge
          label="Total OOO"
          value={minutesToHumanTime(summary.totalOOOMins)}
          color="#faad14"
        />
      </div>
    </div>
  );
}

function HoursBadge({ label, value, color }) {
  return (
    <div style={styles.hoursBadge}>
      <span style={{ ...styles.hoursValue, color }}>{value}</span>
      <span style={styles.hoursLabel}>{label}</span>
    </div>
  );
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

const styles = {
  wrapper: {
    background: "rgba(102,126,234,0.06)",
    border: "1px solid rgba(102,126,234,0.2)",
    borderRadius: 16,
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  empName: { fontSize: 18, fontWeight: 700, color: "var(--text-white)" },
  empMeta: {
    fontSize: 13,
    color: "var(--text-muted)",
    marginTop: 2,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    background: "rgba(167,139,250,0.15)",
    border: "1px solid rgba(167,139,250,0.3)",
    padding: "2px 8px",
    borderRadius: 20,
    fontSize: 11,
    color: "#a78bfa",
  },

  attPct: {
    marginLeft: "auto",
    textAlign: "right",
    fontSize: 28,
    fontWeight: 800,
    lineHeight: 1,
  },
  attLabel: {
    display: "block",
    fontSize: 11,
    color: "var(--text-muted)",
    fontWeight: 400,
    marginTop: 2,
  },

  tiles: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
    gap: 12,
  },
  tile: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  tileIcon: { fontSize: 20 },
  tileValue: { fontSize: 22, fontWeight: 800, lineHeight: 1 },
  tileLabel: { fontSize: 11, color: "var(--text-muted)", textAlign: "center" },

  hoursRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
  },
  hoursBadge: {
    flex: "1 1 100px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  hoursValue: { fontSize: 18, fontWeight: 700 },
  hoursLabel: { fontSize: 11, color: "var(--text-muted)" },
};
