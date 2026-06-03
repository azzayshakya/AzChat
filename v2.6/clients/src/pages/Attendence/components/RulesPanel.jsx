import React, { useState } from "react";
import { RULE_DESCRIPTIONS, ATTENDANCE_RULES } from "../attendanceRules.js";

export default function RulesPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div style={styles.wrapper}>
      <button style={styles.toggleBtn} onClick={() => setOpen((p) => !p)}>
        <span>📋</span>
        <span>How Attendance is Calculated</span>
        <span style={{ marginLeft: "auto" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>Attendance Rules</span>
            <span style={styles.panelSub}>
              All rules are defined in{" "}
              <code style={styles.code}>attendanceRules.js</code> and can be
              changed by editing that file.
            </span>
          </div>

          <div style={styles.grid}>
            {RULE_DESCRIPTIONS.map((rule) => (
              <div key={rule.id} style={styles.ruleCard}>
                <div style={styles.ruleTop}>
                  <span style={styles.ruleLabel}>{rule.label}</span>
                  <span style={styles.ruleValue}>{rule.value}</span>
                </div>
                <p style={styles.ruleDesc}>{rule.description}</p>
              </div>
            ))}
          </div>

          {/* Status colour legend */}
          <div style={styles.legend}>
            <div style={styles.legendTitle}>Status Legend</div>
            <div style={styles.legendItems}>
              {Object.entries(ATTENDANCE_RULES.STATUS_LABELS).map(
                ([key, label]) => (
                  <div key={key} style={styles.legendItem}>
                    <span
                      style={{
                        ...styles.dot,
                        background: ATTENDANCE_RULES.STATUS_COLORS[key],
                      }}
                    />
                    {label}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { width: "100%" },

  toggleBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 18px",
    background: "rgba(102,126,234,0.08)",
    border: "1px solid rgba(102,126,234,0.2)",
    borderRadius: 12,
    color: "var(--text-white)",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.15s ease",
    textAlign: "left",
  },

  panel: {
    marginTop: 8,
    background: "rgba(10,10,30,0.5)",
    border: "1px solid rgba(102,126,234,0.15)",
    borderRadius: 12,
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  panelHeader: { display: "flex", flexDirection: "column", gap: 4 },
  panelTitle: { fontSize: 16, fontWeight: 700, color: "var(--text-white)" },
  panelSub: { fontSize: 13, color: "var(--text-muted)" },
  code: {
    background: "rgba(102,126,234,0.15)",
    padding: "1px 6px",
    borderRadius: 4,
    fontFamily: "monospace",
    fontSize: 12,
    color: "#a78bfa",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 12,
  },

  ruleCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  ruleTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  ruleLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  ruleValue: { fontSize: 14, fontWeight: 700, color: "#667eea" },
  ruleDesc: {
    fontSize: 12,
    color: "var(--text-muted)",
    lineHeight: 1.5,
    margin: 0,
  },

  legend: { display: "flex", flexDirection: "column", gap: 10 },
  legendTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  legendItems: { display: "flex", flexWrap: "wrap", gap: 10 },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "var(--text-highlight)",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },
};
