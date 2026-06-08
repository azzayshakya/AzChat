import React from "react";

export default function AboutDeveloper({ onContactClick }) {
  return (
    <section
      style={{
        padding: "0 24px 80px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          height: 1,
          background: "var(--divider-gradient)",
          marginBottom: 56,
        }}
      />

      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20,
          padding: "40px",
          display: "flex",
          alignItems: "center",
          gap: 36,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "var(--brand-gradient)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
            boxShadow: "0 0 0 4px rgba(102,126,234,0.2)",
            overflow: "hidden",
          }}
        >
          <img src="/developer_profile.jpg" width={85} height={85}></img>
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(102,126,234,0.1)",
              border: "1px solid rgba(102,126,234,0.2)",
              borderRadius: 100,
              padding: "3px 12px",
              fontSize: 11,
              color: "#a78bfa",
              fontWeight: 600,
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Developer
          </div>
          <h3
            style={{
              color: "var(--text-white)",
              fontWeight: 700,
              fontSize: 22,
              marginBottom: 6,
            }}
          >
            A*** *****a
          </h3>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: 14,
              lineHeight: 1.7,
              marginBottom: 4,
              maxWidth: 520,
            }}
          >
            AzChat was built to solve a real problem — enabling smooth team
            communication in environments where personal phones aren't permitted
            and internet access may be restricted.
          </p>
        </div>

        <div style={{ flexShrink: 0 }}>
          <button
            onClick={onContactClick}
            style={{
              background: "var(--brand-gradient)",
              border: "none",
              borderRadius: 12,
              padding: "14px 28px",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "opacity 0.2s, transform 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.88";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            💬 Contact Developer
          </button>
        </div>
      </div>
    </section>
  );
}
