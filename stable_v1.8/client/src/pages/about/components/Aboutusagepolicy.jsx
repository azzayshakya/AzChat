import React from "react";

const DOS = [
  "Use AzChat for professional team communication only",
  "Keep conversations respectful and work-related",
  "Report issues or bugs to the developer promptly",
  "Log out when you're done to protect your account",
];

const DONTS = [
  "Do not share sensitive credentials over chat",
  "Do not use abusive, offensive, or inappropriate language",
  "Do not misuse the platform for personal or non-work matters",
  "Do not attempt to access other users' accounts or data",
];

export default function AboutUsagePolicy() {
  return (
    <section
      style={{
        padding: "0 24px 80px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "var(--divider-gradient)",
          marginBottom: 56,
        }}
      />

      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "var(--text-white)",
            marginBottom: 12,
          }}
        >
          Usage Guidelines
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: 15,
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          AzChat is a professional tool. Please use it responsibly.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
          gap: 20,
        }}
      >
        {/* Do's */}
        <PolicyCard
          emoji="✅"
          title="Please Do"
          items={DOS}
          accentColor="#04ff58"
          bgColor="rgba(4,255,88,0.04)"
          borderColor="rgba(4,255,88,0.15)"
          dotColor="#04ff58"
        />

        {/* Don'ts */}
        <PolicyCard
          emoji="🚫"
          title="Please Don't"
          items={DONTS}
          accentColor="#ff4d4f"
          bgColor="rgba(255,77,79,0.04)"
          borderColor="rgba(255,77,79,0.15)"
          dotColor="#ff4d4f"
        />
      </div>

      {/* Warning banner */}
      <div
        style={{
          marginTop: 24,
          background: "rgba(102,126,234,0.08)",
          border: "1px solid rgba(102,126,234,0.25)",
          borderRadius: 12,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: 13,
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: "var(--text-white)", fontWeight: 600 }}>
            Please do not misuse this application.
          </span>{" "}
          AzChat is developed for team productivity. Any misuse may result in
          account removal by the administrator.
        </p>
      </div>
    </section>
  );
}

function PolicyCard({
  emoji,
  title,
  items,
  accentColor,
  bgColor,
  borderColor,
  dotColor,
}) {
  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        padding: "28px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <span
          style={{
            color: accentColor,
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          {title}
        </span>
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {items.map((item, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              color: "var(--text-highlight)",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: dotColor,
                flexShrink: 0,
                marginTop: 6,
              }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
