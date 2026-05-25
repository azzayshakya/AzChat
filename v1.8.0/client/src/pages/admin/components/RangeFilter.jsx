import React from "react";
import { theme } from "../../../theme";

const OPTIONS = [
  { key: "1d", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "all", label: "All Time" },
];

export default function RangeFilter({ value, onChange }) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: theme.bgCard,
        border: `1px solid ${theme.border}`,
        borderRadius: theme.radius,
        overflow: "hidden",
      }}
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            style={{
              background: active ? theme.gradientPrimary : "transparent",
              border: "none",
              cursor: "pointer",
              padding: "7px 16px",
              color: active ? "#fff" : theme.textMuted,
              fontWeight: active ? 600 : 400,
              fontSize: 12,
              transition: "all 0.2s ease",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
