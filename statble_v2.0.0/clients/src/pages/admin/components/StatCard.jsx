import React from "react";
import { theme } from "../../../theme";

export default function StatCard({ icon, label, value, sub, color }) {
  return (
    <div
      style={{
        background: theme.bgCard,
        border: `1px solid ${theme.border}`,
        borderRadius: theme.radiusLg,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: theme.shadow,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = theme.shadowLg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = theme.shadow;
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: color || theme.gradientPrimary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ color: theme.textMuted, fontSize: 12, marginBottom: 4 }}>
          {label}
        </div>
        <div
          style={{ color: theme.textPrimary, fontSize: 26, fontWeight: 700 }}
        >
          {value ?? "—"}
        </div>
        {sub && (
          <div style={{ color: theme.textDim, fontSize: 11, marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
