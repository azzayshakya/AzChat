import React, { useState } from "react";
import Navbar from "../../components/Navbar";

/* ─── Feature Data ─────────────────────────────────────────────────────── */
const FEATURES = [
  {
    id: "online-status",
    icon: "🟢",
    badge: "Live",
    badgeColor: "#52c41a",
    badgeBg: "rgba(82,196,26,0.13)",
    accent: "#52c41a",
    accentBg: "rgba(82,196,26,0.10)",
    title: "Online Presence",
    short: "Real-time user activity detection.",
    tag: "Presence System",
    tagline: "Tab-aware, WebSocket-powered status",
    body: "AzChat tracks user sessions at browser-tab level. As long as the app tab is open — even in the background — the user shows as online.",
    bullets: [
      {
        icon: "📡",
        text: "Online as long as the tab is open, even if in the background.",
      },
      {
        icon: "🔄",
        text: "Refresh the tab for the most accurate real-time status.",
      },
      {
        icon: "🟢",
        text: "Green dot on avatar = active session. No dot = tab closed or logged out.",
      },
      {
        icon: "⚡",
        text: "Powered by WebSocket — updates without page reloads.",
      },
    ],
    note: "Tip: Refresh the page for the most accurate status check of any user.",
  },
  {
    id: "direct-chat",
    icon: "💬",
    badge: "Core",
    badgeColor: "#667eea",
    badgeBg: "rgba(102,126,234,0.13)",
    accent: "#a78bfa",
    accentBg: "rgba(167,139,250,0.10)",
    title: "Direct Chat",
    short: "1-on-1 messaging with any registered user.",
    tag: "Messaging",
    tagline: "Real-time private conversations",
    body: "Sign in with email or username and start chatting instantly with anyone registered on the platform.",
    bullets: [
      {
        icon: "🔐",
        text: "Login with either email or username — both are supported.",
      },
      { icon: "🔍", text: "Search registered users by name or username." },
      {
        icon: "✅",
        text: "Sent and seen ticks show delivery and read receipts.",
      },
      {
        icon: "⚡",
        text: "Real-time delivery via WebSocket — no refresh needed.",
      },
    ],
    note: null,
  },
  {
    id: "group-chat",
    icon: "👥",
    badge: "Groups",
    badgeColor: "#60a0ff",
    badgeBg: "rgba(96,160,255,0.13)",
    accent: "#60a0ff",
    accentBg: "rgba(96,160,255,0.10)",
    title: "Group Chat",
    short: "Create groups with role-based control.",
    tag: "Collaboration",
    tagline: "Three-tier role system for teams",
    body: "Create group rooms, invite members, and manage permissions with a clear Creator → Admin → Member hierarchy.",
    bullets: [
      {
        icon: "👑",
        text: "Creator — Full control: delete group, manage all roles and members.",
      },
      { icon: "🛡️", text: "Admin — Can add new members to the group." },
      { icon: "👤", text: "Member — Can chat and view group content." },
      {
        icon: "🔀",
        text: "Creator can promote Members to Admin; Admins can onboard new members.",
      },
    ],
    note: "Only the Creator can delete the group or demote Admins.",
  },
  {
    id: "work-status",
    icon: "📌",
    badge: "Professional",
    badgeColor: "#14e1c8",
    badgeBg: "rgba(20,225,200,0.13)",
    accent: "#14e1c8",
    accentBg: "rgba(20,225,200,0.10)",
    title: "Work Status",
    short: "Broadcast what you're working on.",
    tag: "Status Updates",
    tagline: "Professional project & feature broadcasts",
    body: "Update your status to tell teammates what project or feature you're focused on — designed purely for professional context.",
    bullets: [
      {
        icon: "💼",
        text: "Set a status like 'Working on Auth Module — Sprint 3'.",
      },
      { icon: "🔒", text: "Private — visible only to your contacts." },
      { icon: "🌐", text: "Public — visible to all users on the platform." },
      { icon: "🗑️", text: "Delete your status anytime — removed instantly." },
    ],
    note: "Professional use only — keep updates focused on work context.",
  },
  {
    id: "attendance",
    icon: "📊",
    badge: "Utility",
    badgeColor: "#faad14",
    badgeBg: "rgba(250,173,20,0.13)",
    accent: "#faad14",
    accentBg: "rgba(250,173,20,0.10)",
    title: "Attendance Calculator",
    short: "Calculate attendance in a readable format.",
    tag: "Built-in Tools",
    tagline: "Human-readable attendance tracking",
    body: "Stop using spreadsheets. The built-in calculator gives a clear, visual breakdown of attendance — right inside the app.",
    bullets: [
      {
        icon: "🔢",
        text: "Input total classes and attended classes for instant percentage.",
      },
      { icon: "📈", text: "Visual output — see your standing at a glance." },
      {
        icon: "🎯",
        text: "Know how many more classes you can miss to stay above your target.",
      },
      { icon: "📱", text: "Accessible inline — no external tool needed." },
    ],
    note: null,
  },
  {
    id: "auto-delete",
    icon: "🗑️",
    badge: "Auto",
    badgeColor: "#ff5a5a",
    badgeBg: "rgba(255,90,90,0.13)",
    accent: "#ff5a5a",
    accentBg: "rgba(255,90,90,0.10)",
    title: "Auto Message Deletion",
    short: "Messages older than 10 days auto-delete.",
    tag: "Privacy & Storage",
    tagline: "Automatic server-side cleanup",
    body: "All messages — direct and group — older than 10 days are permanently and automatically deleted from the server. No action needed.",
    bullets: [
      { icon: "⏱️", text: "10-day retention window for all messages." },
      {
        icon: "🔐",
        text: "Permanent deletion — messages cannot be recovered.",
      },
      {
        icon: "🤖",
        text: "Runs automatically in the background, no configuration needed.",
      },
      {
        icon: "♻️",
        text: "Keeps server storage lean and conversations private.",
      },
    ],
    note: "Sensitive work conversations do not persist indefinitely on the server.",
  },
];

/* ─── Styles ────────────────────────────────────────────────────────────── */
const S = {
  page: {
    // minHeight: "100vh",
    // background: "var(--main-bg-gradient)",
    // color: "var(--text-white)",
    // fontFamily:
    //   "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  /* Header */
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(15,12,41,0.92)",
    borderBottom: "1px solid rgba(102,126,234,0.18)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    padding: "0 28px",
  },
  headerInner: {
    maxWidth: 1080,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 62,
  },
  logoWrap: { display: "flex", alignItems: "center", gap: 10 },
  logoDot: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "var(--brand-gradient)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 16,
    color: "#fff",
  },
  logoName: {
    fontSize: 20,
    fontWeight: 800,
    background: "var(--brand-gradient)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  headerSub: { fontSize: 12, color: "var(--text-muted)", marginTop: 1 },
  headerBadge: {
    background: "rgba(102,126,234,0.13)",
    border: "1px solid rgba(102,126,234,0.28)",
    borderRadius: 20,
    padding: "5px 14px",
    fontSize: 12,
    color: "#a78bfa",
    fontWeight: 600,
  },

  /* Hero */
  hero: {
    textAlign: "center",
    padding: "56px 24px 36px",
    maxWidth: 640,
    margin: "0 auto",
  },
  heroTag: {
    display: "inline-block",
    background: "rgba(102,126,234,0.12)",
    border: "1px solid rgba(102,126,234,0.28)",
    borderRadius: 20,
    padding: "4px 16px",
    fontSize: 11,
    fontWeight: 700,
    color: "#a78bfa",
    letterSpacing: "0.09em",
    textTransform: "uppercase",
    marginBottom: 20,
  },
  heroH1: {
    fontSize: "clamp(1.7rem, 4vw, 2.4rem)",
    fontWeight: 800,
    lineHeight: 1.18,
    marginBottom: 14,
    background: "linear-gradient(135deg, #fff 55%, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroP: {
    fontSize: 15,
    color: "var(--text-muted)",
    lineHeight: 1.7,
    margin: "0 auto",
  },

  /* Grid */
  section: { maxWidth: 1080, margin: "0 auto", padding: "0 24px 72px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: 14,
  },

  /* Modal overlay */
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.72)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "linear-gradient(160deg,#1a1540 0%,#120f30 100%)",
    border: "1px solid rgba(102,126,234,0.32)",
    borderRadius: 20,
    width: "100%",
    maxWidth: 520,
    maxHeight: "82vh",
    overflowY: "auto",
    padding: "28px",
    position: "relative",
    animation: "azModalIn 0.2s ease",
  },
  modalClose: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: 17,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalIcon: {
    fontSize: 28,
    width: 52,
    height: 52,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  modalTitle: { fontSize: "1.2rem", fontWeight: 700, marginBottom: 4 },
  modalSub: { fontSize: 12, color: "var(--text-muted)", marginBottom: 18 },
  divider: {
    height: 1,
    background: "rgba(102,126,234,0.18)",
    marginBottom: 18,
  },
  modalBody: {
    fontSize: 14,
    color: "var(--text-highlight)",
    lineHeight: 1.75,
    marginBottom: 14,
  },
  bullet: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    fontSize: 13,
    color: "#ccc",
    marginBottom: 10,
  },
  bulletIcon: { fontSize: 15, flexShrink: 0, marginTop: 1 },
  note: {
    background: "rgba(102,126,234,0.09)",
    border: "1px solid rgba(102,126,234,0.22)",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 12,
    color: "#a78bfa",
    lineHeight: 1.6,
    marginTop: 14,
  },
};

/* ─── Feature Card ──────────────────────────────────────────────────────── */
function FeatureCard({ f, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onClick(f)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(30,25,75,0.88)" : "rgba(26,21,64,0.65)",
        border: `1px solid ${hovered ? "rgba(102,126,234,0.38)" : "rgba(102,126,234,0.16)"}`,
        borderRadius: 16,
        padding: "20px 18px 18px",
        cursor: "pointer",
        transition: "all 0.22s ease",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "var(--brand-gradient)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.22s",
        }}
      />

      {/* badge */}
      <span
        style={{
          display: "inline-block",
          background: f.badgeBg,
          color: f.badgeColor,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          borderRadius: 6,
          padding: "2px 8px",
          marginBottom: 12,
        }}
      >
        {f.badge}
      </span>

      {/* icon */}
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: f.accentBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          marginBottom: 12,
        }}
      >
        {f.icon}
      </div>

      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          marginBottom: 6,
          color: "#fff",
        }}
      >
        {f.title}
      </div>
      <div
        style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}
      >
        {f.short}
      </div>

      {/* arrow */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "rgba(102,126,234,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          color: "#667eea",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
        }}
      >
        →
      </div>
    </div>
  );
}

/* ─── Modal ─────────────────────────────────────────────────────────────── */
function FeatureModal({ f, onClose }) {
  if (!f) return null;

  return (
    <div
      style={S.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <style>{`
        @keyframes azModalIn {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
      <div style={S.modal}>
        <button style={S.modalClose} onClick={onClose}>
          ×
        </button>

        <div style={{ ...S.modalIcon, background: f.accentBg }}>{f.icon}</div>

        <div style={S.modalTitle}>{f.title}</div>
        <div style={S.modalSub}>
          {f.tag} — {f.tagline}
        </div>
        <div style={S.divider} />

        <div style={S.modalBody}>{f.body}</div>

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {f.bullets.map((b, i) => (
            <li key={i} style={S.bullet}>
              <span style={S.bulletIcon}>{b.icon}</span>
              <span dangerouslySetInnerHTML={{ __html: b.text }} />
            </li>
          ))}
        </ul>

        {f.note && (
          <div style={S.note}>
            <strong style={{ color: "#fff" }}>Note: </strong>
            {f.note}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function FeaturesPage() {
  const [active, setActive] = useState(null);

  // close on Escape
  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div style={S.page}>
      <Navbar />
      {/* ── Header ── */}
      {/* ── Hero ── */}
      <div style={S.hero}>
        <div style={S.heroTag}>What's inside</div>
        <h1 style={S.heroH1}>Everything you need to connect & collaborate</h1>
        <p style={S.heroP}>
          AzChat is a professional-grade, real-time chat platform — built for
          teams on local networks with smart messaging, presence, group rooms,
          and privacy-first status.
        </p>
      </div>

      {/* ── Grid ── */}
      <section style={S.section}>
        <div style={S.grid}>
          {FEATURES.map((f) => (
            <FeatureCard key={f.id} f={f} onClick={setActive} />
          ))}
        </div>
      </section>

      {/* ── Modal ── */}
      {active && <FeatureModal f={active} onClose={() => setActive(null)} />}
    </div>
  );
}
