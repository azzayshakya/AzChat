import React from "react";

export default function EmployeeSelector({
  employees,
  selected,
  onSelect,
  dateRange,
}) {
  return (
    <div style={s.wrap}>
      {/* Date range badge */}
      {dateRange?.from && (
        <div style={s.dateRange}>
          <span>📅</span>
          <span>
            {fmt(dateRange.from)} → {fmt(dateRange.to)}
          </span>
        </div>
      )}

      <p style={s.label}>Employees</p>

      <div style={s.list}>
        {employees.map((emp) => {
          const active = emp.empCode === selected;
          return (
            <button
              key={emp.empCode}
              style={{ ...s.card, ...(active ? s.cardActive : {}) }}
              onClick={() => onSelect(emp.empCode)}
            >
              <span style={s.avatar}>{initials(emp.empCode)}</span>
              <span style={s.info}>
                <span style={s.code}>{emp.empCode}</span>
                <span style={s.type}>{shortName(emp.clockName)}</span>
              </span>
              {active && <span style={s.tick}>✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const initials = (code) => code?.slice(-3) || "?";
const shortName = (n = "") => n.replace(/CRL GAD/gi, "").trim() || "Employee";
const fmt = (d) =>
  d
    ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 10 },
  dateRange: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 13px",
    background: "rgba(102,126,234,0.1)",
    border: "1px solid rgba(102,126,234,0.22)",
    borderRadius: 9,
    fontSize: 12,
    color: "var(--text-highlight)",
    fontWeight: 500,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: 0,
  },
  list: { display: "flex", flexDirection: "column", gap: 7 },
  card: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 13px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    color: "var(--text-white)",
    transition: "all .15s",
  },
  cardActive: {
    background: "rgba(102,126,234,0.15)",
    border: "1px solid rgba(102,126,234,0.38)",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 800,
    color: "#fff",
    flexShrink: 0,
  },
  info: { display: "flex", flexDirection: "column", gap: 2, flex: 1 },
  code: { fontSize: 13, fontWeight: 700, color: "var(--text-white)" },
  type: { fontSize: 11, color: "var(--text-muted)" },
  tick: { color: "#667eea", fontWeight: 800, fontSize: 15, flexShrink: 0 },
};
