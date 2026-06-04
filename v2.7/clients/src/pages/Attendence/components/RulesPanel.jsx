import React, { useState } from "react";
import { RULE_DESCRIPTIONS, RULES } from "../attendanceRules.js";

export default function RulesPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div style={s.wrap}>
      <button style={s.toggle} onClick={() => setOpen((p) => !p)}>
        <span>📋</span>
        <span>How Is Attendance Calculated? (View All Rules)</span>
        <span style={{ marginLeft: "auto" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={s.panel}>
          <div style={s.panelHead}>
            <p style={s.panelTitle}>Attendance Rules</p>
            <p style={s.panelSub}>
              All rules are defined in{" "}
              <code style={s.code}>Attendence/attendanceRules.js</code>. Change
              any value there to update calculations instantly.
            </p>
          </div>

          {/* Rule cards */}
          <div style={s.grid}>
            {RULE_DESCRIPTIONS.map((r) => (
              <div key={r.no} style={s.card}>
                {r.no && <span style={s.ruleNo}>Rule {r.no}</span>}
                <p style={s.ruleLabel}>{r.label}</p>
                <div style={s.seasons}>
                  {Object.entries(r.seasons).map(([season, val]) => (
                    <span key={season} style={s.seasonBadge}>
                      <span style={s.seasonKey}>{season}</span>
                      <span style={s.seasonVal}>{val}</span>
                    </span>
                  ))}
                </div>
                <p style={s.ruleDetail}>{r.detail}</p>
              </div>
            ))}
          </div>

          {/* Status legend */}
          <div style={s.legend}>
            <p style={s.legendTitle}>Status Legend</p>
            <div style={s.legendItems}>
              {Object.entries(RULES.STATUS).map(([key, label]) => (
                <div key={key} style={s.legendItem}>
                  <span
                    style={{ ...s.dot, background: RULES.STATUS_COLOR[key] }}
                  />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: { width: "100%" },
  toggle: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 18px",
    background: "rgba(102,126,234,0.08)",
    border: "1px solid rgba(102,126,234,0.22)",
    borderRadius: 12,
    color: "var(--text-white)",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    textAlign: "left",
    transition: "all .15s",
  },
  panel: {
    marginTop: 8,
    background: "rgba(10,10,28,0.6)",
    border: "1px solid rgba(102,126,234,0.15)",
    borderRadius: 12,
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  panelHead: { display: "flex", flexDirection: "column", gap: 4 },
  panelTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "var(--text-white)",
    margin: 0,
  },
  panelSub: { fontSize: 12, color: "var(--text-muted)", margin: 0 },
  code: {
    background: "rgba(102,126,234,0.15)",
    padding: "1px 6px",
    borderRadius: 4,
    fontFamily: "monospace",
    fontSize: 11,
    color: "#a78bfa",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: 12,
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  ruleNo: {
    fontSize: 10,
    fontWeight: 800,
    color: "#667eea",
    textTransform: "uppercase",
    letterSpacing: ".5px",
  },
  ruleLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--text-white)",
    margin: 0,
  },
  seasons: { display: "flex", flexWrap: "wrap", gap: 6 },
  seasonBadge: {
    display: "flex",
    gap: 5,
    alignItems: "center",
    background: "rgba(102,126,234,0.1)",
    border: "1px solid rgba(102,126,234,0.2)",
    borderRadius: 6,
    padding: "3px 8px",
  },
  seasonKey: { fontSize: 10, color: "var(--text-muted)", fontWeight: 600 },
  seasonVal: { fontSize: 12, color: "#667eea", fontWeight: 800 },
  ruleDetail: {
    fontSize: 11,
    color: "var(--text-muted)",
    margin: 0,
    lineHeight: 1.5,
  },

  legend: { display: "flex", flexDirection: "column", gap: 8 },
  legendTitle: {
    fontSize: 11,
    fontWeight: 800,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: ".5px",
    margin: 0,
  },
  legendItems: { display: "flex", flexWrap: "wrap", gap: 10 },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "var(--text-highlight)",
  },
  dot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
};
