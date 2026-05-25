import React from "react";
import { theme } from "../../../theme";

export default function ConfirmModal({ user, onConfirm, onCancel }) {
  if (!user) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.15s ease",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: theme.bgPanel,
          border: `1px solid ${theme.border}`,
          borderRadius: theme.radiusLg,
          padding: 32,
          width: 360,
          boxShadow: theme.shadowLg,
          animation: "slideUp 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 36, textAlign: "center", marginBottom: 16 }}>
          🗑️
        </div>
        <div
          style={{
            color: theme.textPrimary,
            fontSize: 17,
            fontWeight: 700,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Delete Account
        </div>
        <div
          style={{
            color: theme.textMuted,
            fontSize: 13,
            textAlign: "center",
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          Are you sure you want to delete{" "}
          <span style={{ color: theme.primaryLighter, fontWeight: 600 }}>
            {user.username}
          </span>
          ? This will remove their account and all messages permanently.
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "transparent",
              border: `1px solid ${theme.borderLight}`,
              borderRadius: theme.radius,
              color: theme.textSecondary,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(user.id)}
            style={{
              flex: 1,
              padding: "10px 0",
              background: theme.danger,
              border: "none",
              borderRadius: theme.radius,
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}
