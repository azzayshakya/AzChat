import React from "react";

export default function NoMessage() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "48px 40px",
          borderRadius: 24,
          background: "var(--dark-bg-light)",
          border: "1px solid rgba(102,126,234,0.12)",
          maxWidth: 340,
          width: "100%",
          position: "relative",
        }}
      >
        {/* Glow halo */}
        <div
          style={{
            position: "absolute",
            top: -60,
            left: "50%",
            transform: "translateX(-50%)",
            width: 180,
            height: 180,
            borderRadius: "50%",
            pointerEvents: "none",
            background:
              "radial-gradient(circle, rgba(102,126,234,0.18) 0%, transparent 70%)",
          }}
        />

        {/* Icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            marginBottom: 24,
            background:
              "linear-gradient(135deg,rgba(102,126,234,0.15),rgba(118,75,162,0.15))",
            border: "1px solid rgba(102,126,234,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <svg
            width={36}
            height={36}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#667eea"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {/* Online dot */}
          <div
            style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "var(--online-status)",
              border: "2px solid var(--dark-bg)",
            }}
          />
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "var(--text-highlight)",
            marginBottom: 8,
          }}
        >
          Your messages live here
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            lineHeight: 1.6,
            marginBottom: 28,
          }}
        >
          Pick a contact or group from the sidebar
          <br />
          to start a conversation.
        </div>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: 1,
            marginBottom: 20,
            background:
              "linear-gradient(90deg, transparent, rgba(102,126,234,0.2), transparent)",
          }}
        />

        {/* Tips */}
        {[
          { label: "Search contacts", sub: "Find anyone by username or name" },
          { label: "Group chats", sub: "Create or join a group conversation" },
          { label: "Share files", sub: "Send images, docs, and more" },
        ].map((tip) => (
          <div
            key={tip.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 12,
              width: "100%",
              marginBottom: 10,
              textAlign: "left",
              background: "rgba(102,126,234,0.06)",
              border: "1px solid rgba(102,126,234,0.10)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                flexShrink: 0,
                background: "rgba(102,126,234,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-light)"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-highlight)",
                  marginBottom: 1,
                }}
              >
                {tip.label}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  lineHeight: 1.4,
                }}
              >
                {tip.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
