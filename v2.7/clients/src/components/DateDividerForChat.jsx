import React from "react";

export default function DateDividerForChat({ msg }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        margin: "14px 0 10px",
      }}
    >
      <div
        style={{
          background: "#1a1a2e",
          color: "var(--text-muted)",
          fontSize: 11,
          padding: "6px 14px",
          borderRadius: 999,
          border: "1px solid #2a2a4a",
          boxShadow: "0 2px 8px #0003",
          fontWeight: 500,
          letterSpacing: 0.2,
        }}
      >
        {new Date(msg.createdAt).toLocaleDateString([], {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </div>
    </div>
  );
}
