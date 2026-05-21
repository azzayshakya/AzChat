import React from "react";

export default function UnreadDivider() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "8px 0",
      }}
    >
      <div
        style={{
          flex: 1,
          height: 1,
          background: "linear-gradient(to right, transparent, #667eea)",
        }}
      />

      <div
        style={{
          background: "#667eea22",
          border: "1px solid #667eea66",
          borderRadius: 12,
          padding: "3px 12px",
          color: "var(--accent-light)",
          fontSize: 11,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        New messages
      </div>

      <div
        style={{
          flex: 1,
          height: 1,
          background: "linear-gradient(to left, transparent, #667eea)",
        }}
      />
    </div>
  );
}
