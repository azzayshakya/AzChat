import React from "react";

export default function AboutHero() {
  return (
    <section style={{ padding: "80px 24px 64px", textAlign: "center" }}>
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(102,126,234,0.12)",
            border: "1px solid rgba(102,126,234,0.3)",
            borderRadius: 100,
            padding: "6px 16px",
            fontSize: 12,
            fontWeight: 600,
            color: "#a78bfa",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#04ff58",
            }}
            className="pulse"
          />
          Built for Local Networks
        </span>
      </div>

      <h1
        className="fade-up-2"
        style={{
          fontSize: "clamp(36px, 6vw, 64px)",
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: 20,
          background: "var(--brand-gradient)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-0.02em",
        }}
      >
        AzChat
      </h1>

      <p
        className="fade-up-3"
        style={{
          fontSize: 18,
          color: "var(--text-muted)",
          maxWidth: 560,
          margin: "0 auto 16px",
          lineHeight: 1.7,
        }}
      >
        A secure, real-time messaging platform designed exclusively for teams on
        local and wide-area networks — no internet required.
      </p>
    </section>
  );
}
