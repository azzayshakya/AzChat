import React from "react";

/**
 * UnreadDivider
 * A decorative horizontal divider with a "New messages" label,
 * inserted above the first unread message in a conversation.
 *
 * No props required — purely presentational.
 */
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
      {/* Left gradient line */}
      <div
        style={{
          flex: 1,
          height: 1,
          background: "linear-gradient(to right, transparent, #667eea)",
        }}
      />

      {/* Label pill */}
      <div
        style={{
          background: "#667eea22",
          border: "1px solid #667eea66",
          borderRadius: 12,
          padding: "3px 12px",
          color: "#a78bfa",
          fontSize: 11,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        New messages
      </div>

      {/* Right gradient line */}
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
