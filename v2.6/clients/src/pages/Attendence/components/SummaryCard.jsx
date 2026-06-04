import React from "react";
import { toHuman, toHHMM } from "../utils/attendanceCalculator.js";
import { RULES } from "../attendanceRules.js";

export default function SummaryCard({ summary, empCode, dateRange }) {
  if (!summary) return null;

  const pctColor =
    summary.pct >= 85 ? "#04ff58" : summary.pct >= 70 ? "#faad14" : "#ff4d4f";

  const tiles = [
    {
      label: "Working Days",
      value: summary.totalWorkingDays,
      icon: "🗓️",
      color: "#667eea",
    },
    {
      label: "Full Days",
      value: summary.full,
      icon: "✅",
      color: RULES.STATUS_COLOR.FULL_DAY,
    },
    {
      label: "Half Days",
      value: summary.half,
      icon: "🌗",
      color: RULES.STATUS_COLOR.HALF_DAY,
    },
    {
      label: "Absents",
      value: summary.absent,
      icon: "❌",
      color: RULES.STATUS_COLOR.ABSENT,
    },
    {
      label: "Week Offs",
      value: summary.weekOff,
      icon: "😴",
      color: RULES.STATUS_COLOR.WEEK_OFF,
    },
    {
      label: "Incomplete",
      value: summary.missing,
      icon: "⚠️",
      color: RULES.STATUS_COLOR.MISSING_PUNCH,
    },
  ];

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.avatar}>{empCode?.slice(-3) || "EMP"}</div>
        <div>
          <div style={s.empCode}>Employee {empCode}</div>
          {dateRange?.from && (
            <div style={s.range}>
              {fmt(dateRange.from)} → {fmt(dateRange.to)}
            </div>
          )}
        </div>
        <div style={{ ...s.pct, color: pctColor }}>
          {summary.pct}%<span style={s.pctLabel}>Attendance</span>
        </div>
      </div>

      {/* Count tiles */}
      <div style={s.tiles}>
        {tiles.map((t) => (
          <div key={t.label} style={s.tile}>
            <span style={s.tileIcon}>{t.icon}</span>
            <span style={{ ...s.tileVal, color: t.color }}>{t.value}</span>
            <span style={s.tileLabel}>{t.label}</span>
          </div>
        ))}
      </div>

      {/* Hours row */}
      <div style={s.hours}>
        <HBadge
          label="Total Effective"
          val={toHHMM(summary.totalEffective)}
          color="#667eea"
        />
        <HBadge
          label="Total OOO Deducted"
          val={toHHMM(summary.totalOOO)}
          color="#faad14"
        />
      </div>
    </div>
  );
}

function HBadge({ label, val, color }) {
  return (
    <div style={s.hbadge}>
      <span style={{ ...s.hval, color }}>{val}</span>
      <span style={s.hlabel}>{label}</span>
    </div>
  );
}

const fmt = (d) =>
  d
    ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const s = {
  wrap: {
    background: "rgba(102,126,234,0.06)",
    border: "1px solid rgba(102,126,234,0.2)",
    borderRadius: 16,
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  header: { display: "flex", alignItems: "center", gap: 16 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 800,
    color: "#fff",
    flexShrink: 0,
  },
  empCode: { fontSize: 17, fontWeight: 800, color: "var(--text-white)" },
  range: { fontSize: 12, color: "var(--text-muted)", marginTop: 3 },
  pct: {
    marginLeft: "auto",
    fontSize: 28,
    fontWeight: 900,
    lineHeight: 1,
    textAlign: "right",
  },
  pctLabel: {
    display: "block",
    fontSize: 11,
    color: "var(--text-muted)",
    fontWeight: 400,
    marginTop: 2,
  },

  tiles: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
    gap: 10,
  },
  tile: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: "14px 8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  tileIcon: { fontSize: 20 },
  tileVal: { fontSize: 22, fontWeight: 900, lineHeight: 1 },
  tileLabel: { fontSize: 10, color: "var(--text-muted)", textAlign: "center" },

  hours: { display: "flex", flexWrap: "wrap", gap: 10 },
  hbadge: {
    flex: "1 1 140px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  hval: { fontSize: 18, fontWeight: 800 },
  hlabel: { fontSize: 11, color: "var(--text-muted)" },
};
