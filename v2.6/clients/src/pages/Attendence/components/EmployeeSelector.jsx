import React from "react";

export default function EmployeeSelector({
  employees,
  selectedEmpId,
  onSelect,
  dateRange,
}) {
  return (
    <div style={styles.wrapper}>
      {/* Date range badge */}
      {dateRange?.from && (
        <div style={styles.dateRange}>
          <span style={styles.drIcon}>📅</span>
          <span>
            {fmt(dateRange.from)} &nbsp;→&nbsp; {fmt(dateRange.to)}
          </span>
        </div>
      )}

      <p style={styles.label}>Select Employee</p>

      <div style={styles.list}>
        {employees.map((emp) => {
          const active = emp.empId === selectedEmpId;
          return (
            <button
              key={emp.empId}
              style={{ ...styles.card, ...(active ? styles.cardActive : {}) }}
              onClick={() => onSelect(emp.empId)}
            >
              <span style={styles.avatar}>{getInitials(emp.empName)}</span>
              <span style={styles.info}>
                <span style={styles.name}>{emp.empName}</span>
                <span style={styles.meta}>
                  ID: {emp.empId}
                  {emp.fileType ? ` · ${emp.fileType}` : ""}
                </span>
              </span>
              {active && <span style={styles.tick}>✓</span>}
            </button>
          );
        })}
      </div>
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

function fmt(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const styles = {
  wrapper: { display: "flex", flexDirection: "column", gap: 12 },

  dateRange: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    background: "rgba(102,126,234,0.1)",
    border: "1px solid rgba(102,126,234,0.25)",
    borderRadius: 10,
    fontSize: 13,
    color: "var(--text-highlight)",
    fontWeight: 500,
  },
  drIcon: { fontSize: 16 },

  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: 0,
  },

  list: { display: "flex", flexDirection: "column", gap: 8 },

  card: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s ease",
    color: "var(--text-white)",
    width: "100%",
  },
  cardActive: {
    background: "rgba(102,126,234,0.15)",
    border: "1px solid rgba(102,126,234,0.4)",
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },

  info: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--text-white)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  meta: { fontSize: 12, color: "var(--text-muted)" },

  tick: { color: "#667eea", fontWeight: 700, fontSize: 16, flexShrink: 0 },
};
