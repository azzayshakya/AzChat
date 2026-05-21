import React from "react";

const FEATURES = [
  {
    icon: "🌐",
    title: "LAN & WAN Ready",
    desc: "Works seamlessly on local networks and wide-area networks. No external internet connection needed to communicate with your team.",
  },
  {
    icon: "🔒",
    title: "Private by Design",
    desc: "Your conversations stay within your network. No third-party servers, no data harvesting — your messages belong to you.",
  },
  {
    icon: "🗑️",
    title: "Auto-Delete in 6–7 Days",
    desc: "Messages are automatically purged after 6–7 days, keeping the system clean and your communication history minimal.",
  },
  {
    icon: "⚡",
    title: "Real-Time Delivery",
    desc: "Powered by WebSockets for instant message delivery. See who's online and get messages the moment they're sent.",
  },
  {
    icon: "👥",
    title: "Team-First",
    desc: "Built specifically for workplace teams where personal devices or external apps aren't permitted. Professional and reliable.",
  },
  {
    icon: "📵",
    title: "No Phone Needed",
    desc: "If personal phones aren't allowed at your workplace, AzChat gives your team a compliant way to stay connected.",
  },
];

export default function AboutFeatures() {
  return (
    <section
      style={{ padding: "0 24px 80px", maxWidth: 1100, margin: "0 auto" }}
    >
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
          Why AzChat?
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: 15,
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          Every feature is built around one goal — seamless team communication
          within your network environment.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
        }}
      >
        {FEATURES.map((f, i) => (
          <FeatureCard key={i} {...f} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? "rgba(102,126,234,0.07)"
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "var(--card-hover-border)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 16,
        padding: "28px 24px",
        transition: "all 0.25s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        cursor: "default",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>
      <div
        style={{
          color: "var(--text-white)",
          fontWeight: 700,
          fontSize: 15,
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: "var(--text-muted)",
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        {desc}
      </div>
    </div>
  );
}
