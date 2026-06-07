import React from "react";
import { toHHMM, toHuman, toHumanAbs } from "../utils/attendanceCalculator.js";
import { RULES } from "../attendanceRules.js";

export default function SummaryCard({ summary, empCode, dateRange }) {
  if (!summary) return null;

  const pctColor =
    summary.pct >= 85 ? "#04ff58" : summary.pct >= 70 ? "#faad14" : "#ff4d4f";
  const netColor = summary.totalDiff >= 0 ? "#04ff58" : "#ff4d4f";
  const netPrefix = summary.totalDiff >= 0 ? "+" : "";

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
      label: "Incomplete",
      value: summary.missing,
      icon: "⚠️",
      color: RULES.STATUS_COLOR.MISSING_PUNCH,
    },
  ];

  return (
    <div style={s.wrap}>
      {/* ── Top header row ─────────────────────────────────────────────── */}
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

      {/* ── Overall Balance bar (most prominent) ────────────────────────── */}
      <div style={s.balanceBar}>
        <BalanceTile
          label="Total Positive"
          val={`+${toHHMM(summary.positive)}`}
          sub="Extra hours worked"
          color="#04ff58"
          bg="rgba(4,255,88,0.08)"
          border="rgba(4,255,88,0.2)"
        />
        <BalanceTile
          label="Total Negative"
          val={toHHMM(summary.negative)}
          sub="Hours short"
          color="#ff4d4f"
          bg="rgba(255,77,79,0.08)"
          border="rgba(255,77,79,0.2)"
        />
        <BalanceTile
          label="Net Balance"
          val={`${netPrefix}${toHHMM(Math.abs(summary.totalDiff))}${summary.totalDiff < 0 ? " (deficit)" : ""}`}
          sub={
            summary.totalDiff >= 0
              ? "You are ahead ✓"
              : "⚠ Must clear by quarter end"
          }
          color={netColor}
          bg={
            summary.totalDiff >= 0
              ? "rgba(4,255,88,0.05)"
              : "rgba(255,77,79,0.05)"
          }
          border={
            summary.totalDiff >= 0
              ? "rgba(4,255,88,0.25)"
              : "rgba(255,77,79,0.25)"
          }
          big
        />
      </div>

      {/* ── Day count tiles ──────────────────────────────────────────────── */}
      <div style={s.tiles}>
        {tiles.map((t) => (
          <div key={t.label} style={s.tile}>
            <span style={s.tileIcon}>{t.icon}</span>
            <span style={{ ...s.tileVal, color: t.color }}>{t.value}</span>
            <span style={s.tileLabel}>{t.label}</span>
          </div>
        ))}
      </div>

      {/* ── Hours row ───────────────────────────────────────────────────── */}
      <div style={s.hours}>
        <HBadge
          label="Total Effective Hours"
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

// ── Sub-components ────────────────────────────────────────────────────────────

function BalanceTile({ label, val, sub, color, bg, border, big }) {
  return (
    <div
      style={{
        ...s.balanceTile,
        background: bg,
        border: `1px solid ${border}`,
        flex: big ? "2 1 200px" : "1 1 140px",
      }}
    >
      <span style={s.balanceLabel}>{label}</span>
      <span style={{ ...s.balanceVal, fontSize: big ? 26 : 20, color }}>
        {val}
      </span>
      <span
        style={{
          ...s.balanceSub,
          color: sub.includes("⚠") ? "#faad14" : "var(--text-muted)",
        }}
      >
        {sub}
      </span>
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

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  wrap: {
    background: "rgba(102,126,234,0.06)",
    border: "1px solid rgba(102,126,234,0.2)",
    borderRadius: 16,
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
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

  // Balance bar
  balanceBar: { display: "flex", flexWrap: "wrap", gap: 12 },
  balanceTile: {
    borderRadius: 12,
    padding: "14px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: ".5px",
  },
  balanceVal: { fontWeight: 900, lineHeight: 1.1 },
  balanceSub: { fontSize: 11, marginTop: 2 },

  // Quarterly
  section: { display: "flex", flexDirection: "column", gap: 10 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--text-white)",
    margin: 0,
  },
  sectionSub: { fontSize: 11, color: "var(--text-muted)", fontWeight: 400 },
  quarterGrid: { display: "flex", flexWrap: "wrap", gap: 10 },
  quarterCard: {
    flex: "1 1 140px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  quarterLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--text-highlight)",
  },
  quarterRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quarterNet: {
    fontSize: 16,
    fontWeight: 900,
    marginTop: 4,
    display: "flex",
    alignItems: "baseline",
    gap: 5,
  },
  quarterNetLabel: {
    fontSize: 10,
    color: "var(--text-muted)",
    fontWeight: 400,
  },

  // Day count tiles
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

  // Hours badges
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
