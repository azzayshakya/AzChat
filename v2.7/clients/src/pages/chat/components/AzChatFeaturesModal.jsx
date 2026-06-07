import React, { useState } from "react";
import { Modal } from "antd";
import {
  WifiOutlined,
  MessageOutlined,
  TeamOutlined,
  PushpinOutlined,
  BarChartOutlined,
  DeleteOutlined,
  LayoutOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const FEATURES = [
  {
    icon: <WifiOutlined />,
    accent: "#52c41a",
    accentBg: "rgba(82,196,26,0.12)",
    badge: "Live",
    badgeColor: "#52c41a",
    title: "Online Presence",
    tag: "Presence System — Tab-aware, WebSocket-powered",
    desc: "AzChat tracks user sessions at browser-tab level. As long as the app tab is open — even in the background — the user shows as online.",
    bullets: [
      {
        icon: <WifiOutlined />,
        text: "Online as long as the tab is open, even if in the background.",
      },
      {
        icon: <CheckOutlined />,
        text: "Refresh the tab for the most accurate real-time status.",
      },
      {
        icon: <CheckOutlined />,
        text: "Green dot on avatar = active session. No dot = tab closed or logged out.",
      },
      {
        icon: <CheckOutlined />,
        text: "Powered by WebSocket — updates without page reloads.",
      },
    ],
    note: "Tip: Refresh the page for the most accurate status check of any user.",
  },
  {
    icon: <MessageOutlined />,
    accent: "#667eea",
    accentBg: "rgba(102,126,234,0.12)",
    badge: "Core",
    badgeColor: "#667eea",
    title: "Direct Chat",
    tag: "Messaging — Real-time private conversations",
    desc: "Sign in with email or username and start chatting instantly with anyone registered on the platform.",
    bullets: [
      {
        icon: <CheckOutlined />,
        text: "Login with either email or username — both are supported.",
      },
      {
        icon: <CheckOutlined />,
        text: "Search registered users by name or username.",
      },
      {
        icon: <CheckOutlined />,
        text: "Sent and seen ticks show delivery and read receipts.",
      },
      {
        icon: <CheckOutlined />,
        text: "Real-time delivery via WebSocket — no refresh needed.",
      },
    ],
    note: null,
  },
  {
    icon: <TeamOutlined />,
    accent: "#60a0ff",
    accentBg: "rgba(96,160,255,0.12)",
    badge: "Groups",
    badgeColor: "#60a0ff",
    title: "Group Chat",
    tag: "Collaboration — Three-tier role system",
    desc: "Create group rooms, invite members, and manage permissions with a clear Creator → Admin → Member hierarchy.",
    bullets: [
      {
        icon: <CheckOutlined />,
        text: "Creator — Full control: delete group, manage all roles and members.",
      },
      {
        icon: <CheckOutlined />,
        text: "Admin — Can add new members to the group.",
      },
      {
        icon: <CheckOutlined />,
        text: "Member — Can chat and view group content.",
      },
      {
        icon: <CheckOutlined />,
        text: "Creator can promote Members to Admin; Admins can onboard new members.",
      },
    ],
    note: "Only the Creator can delete the group or demote Admins.",
  },
  {
    icon: <PushpinOutlined />,
    accent: "#14e1c8",
    accentBg: "rgba(20,225,200,0.12)",
    badge: "Professional",
    badgeColor: "#14e1c8",
    title: "Work Status",
    tag: "Status Updates — Professional project broadcasts",
    desc: "Update your status to tell teammates what project or feature you're focused on — designed purely for professional context.",
    bullets: [
      {
        icon: <CheckOutlined />,
        text: "Set a status like 'Working on Auth Module — Sprint 3'.",
      },
      {
        icon: <CheckOutlined />,
        text: "Private — visible only to your contacts.",
      },
      {
        icon: <CheckOutlined />,
        text: "Public — visible to all users on the platform.",
      },
      {
        icon: <CheckOutlined />,
        text: "Delete your status anytime — removed instantly.",
      },
    ],
    note: "Professional use only — keep updates focused on work context.",
  },
  {
    icon: <BarChartOutlined />,
    accent: "#faad14",
    accentBg: "rgba(250,173,20,0.12)",
    badge: "Utility",
    badgeColor: "#faad14",
    title: "Attendance Calculator",
    tag: "Built-in Tools — Human-readable tracking",
    desc: "Stop using spreadsheets. The built-in calculator gives a clear, visual breakdown of attendance — right inside the app.",
    bullets: [
      {
        icon: <CheckOutlined />,
        text: "Input total classes and attended classes for instant percentage.",
      },
      {
        icon: <CheckOutlined />,
        text: "Visual output — see your standing at a glance.",
      },
      {
        icon: <CheckOutlined />,
        text: "Know how many more classes you can miss to stay above your target.",
      },
      {
        icon: <CheckOutlined />,
        text: "Accessible inline — no external tool needed.",
      },
    ],
    note: null,
  },
  {
    icon: <DeleteOutlined />,
    accent: "#ff5a5a",
    accentBg: "rgba(255,90,90,0.12)",
    badge: "Auto",
    badgeColor: "#ff5a5a",
    title: "Auto Message Deletion",
    tag: "Privacy & Storage — Automatic server-side cleanup",
    desc: "All messages — direct and group — older than 10 days are permanently and automatically deleted from the server.",
    bullets: [
      {
        icon: <CheckOutlined />,
        text: "10-day retention window for all messages.",
      },
      {
        icon: <CheckOutlined />,
        text: "Permanent deletion — messages cannot be recovered.",
      },
      {
        icon: <CheckOutlined />,
        text: "Runs automatically in the background, no configuration needed.",
      },
      {
        icon: <CheckOutlined />,
        text: "Keeps server storage lean and conversations private.",
      },
    ],
    note: "Sensitive work conversations do not persist indefinitely on the server.",
  },
];

const s = {
  introBox: (accent, accentBg) => ({
    background: accentBg,
    border: `0.5px solid ${accent}44`,
    borderRadius: 12,
    padding: "13px 16px",
    marginBottom: 18,
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  }),
  introIcon: (accent) => ({
    fontSize: 18,
    color: accent,
    flexShrink: 0,
    marginTop: 2,
  }),
  introText: { fontSize: 12.5, color: "#9b9bc0", lineHeight: 1.7 },
  secLabel: {
    fontSize: 10,
    color: "#667eea",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontWeight: 500,
    marginBottom: 10,
  },
  featGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    marginBottom: 18,
  },
  fc: (active) => ({
    borderRadius: 12,
    padding: "12px 13px",
    border: `0.5px solid ${active ? "rgba(102,126,234,0.35)" : "rgba(255,255,255,0.07)"}`,
    background: active ? "rgba(102,126,234,0.1)" : "rgba(255,255,255,0.03)",
    cursor: "pointer",
    transition: "all 0.15s",
    position: "relative",
    overflow: "hidden",
  }),
  fcAccent: (accent, active) => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    background: accent,
    borderRadius: "2px 2px 0 0",
    opacity: active ? 1 : 0,
    transition: "opacity 0.15s",
  }),
  fcBadge: (accentBg, badgeColor) => ({
    display: "inline-block",
    fontSize: 10,
    fontWeight: 500,
    borderRadius: 4,
    padding: "1px 6px",
    marginBottom: 6,
    background: accentBg,
    color: badgeColor,
  }),
  fcTitle: { fontSize: 12, fontWeight: 500, color: "#e0e0f0", marginTop: 6 },
  detailBox: {
    borderRadius: 14,
    border: "0.5px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
    overflow: "hidden",
  },
  dbHead: {
    padding: "14px 18px",
    borderBottom: "0.5px solid rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  dbIconWrap: (accentBg) => ({
    width: 42,
    height: 42,
    borderRadius: 11,
    background: accentBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
  dbTitle: { fontSize: 15, fontWeight: 500, color: "#e8e9f4" },
  dbTag: { fontSize: 11, color: "#666", marginTop: 2 },
  dbBadge: (accentBg, badgeColor, accent) => ({
    marginLeft: "auto",
    fontSize: 10,
    padding: "2px 8px",
    borderRadius: 4,
    fontWeight: 500,
    background: accentBg,
    color: badgeColor,
    border: `0.5px solid ${accent}44`,
  }),
  dbBody: { padding: "14px 18px 16px" },
  bullets: { display: "flex", flexDirection: "column", gap: 8 },
  bulletRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "9px 12px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 9,
    border: "0.5px solid rgba(255,255,255,0.05)",
  },
  bulletIcon: { fontSize: 14, color: "#667eea", flexShrink: 0, marginTop: 2 },
  bulletText: { fontSize: 12, color: "#7a7a9a", lineHeight: 1.6 },
  noteBox: {
    marginTop: 12,
    padding: "10px 14px",
    borderRadius: 9,
    background: "rgba(167,139,250,0.08)",
    border: "0.5px solid rgba(167,139,250,0.2)",
    fontSize: 12,
    color: "#a78bfa",
    lineHeight: 1.6,
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 22px",
    borderTop: "0.5px solid rgba(255,255,255,0.07)",
  },
  dot: (active) => ({
    width: active ? 18 : 6,
    height: 6,
    borderRadius: active ? 3 : "50%",
    background: active ? "#667eea" : "rgba(255,255,255,0.12)",
    cursor: "pointer",
    transition: "all 0.15s",
  }),
  navBtn: (primary) => ({
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    transition: "all 0.15s",
    background: primary ? "rgba(102,126,234,0.18)" : "rgba(255,255,255,0.05)",
    border: `0.5px solid ${primary ? "rgba(102,126,234,0.35)" : "rgba(255,255,255,0.09)"}`,
    color: primary ? "#c5bfff" : "#888",
  }),
};

export default function FeaturesModal({ open, onClose }) {
  const [current, setCurrent] = useState(0);
  const f = FEATURES[current];
  const isLast = current === FEATURES.length - 1;

  const navigate = (dir) => {
    const next = current + dir;
    if (next >= 0 && next < FEATURES.length) setCurrent(next);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={660}
      closeIcon={null}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: "rgba(102,126,234,0.15)",
                border: "0.5px solid rgba(102,126,234,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#667eea",
                fontSize: 17,
              }}
            >
              <LayoutOutlined />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#e8e9f4" }}>
                AZChat Features
              </div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
                Everything you need to know before you start
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "rgba(255,255,255,0.05)",
              border: "0.5px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
              fontSize: 14,
            }}
          >
            ✕
          </button>
        </div>
      }
      styles={{
        content: {
          background: "#10101e",
          border: "0.5px solid rgba(102,126,234,0.28)",
          borderRadius: 20,
          padding: 0,
        },
        header: {
          background: "transparent",
          padding: "16px 22px 14px",
          borderBottom: "0.5px solid rgba(255,255,255,0.07)",
          marginBottom: 0,
        },
        body: {
          padding: "18px 22px 0",
          overflowY: "auto",
          maxHeight: "calc(80vh - 130px)",
        },
        mask: { backdropFilter: "blur(6px)" },
      }}
    >
      {/* Intro highlight box */}
      <div style={s.introBox(f.accent, f.accentBg)}>
        <span style={s.introIcon(f.accent)}>{f.icon}</span>
        <p style={s.introText}>{f.desc}</p>
      </div>

      {/* All features mini grid */}
      <p style={s.secLabel}>All features at a glance</p>
      <div style={s.featGrid}>
        {FEATURES.map((ft, i) => (
          <div
            key={ft.title}
            style={s.fc(i === current)}
            onClick={() => setCurrent(i)}
          >
            <div style={s.fcAccent(ft.accent, i === current)} />
            <span style={s.fcBadge(ft.accentBg, ft.badgeColor)}>
              {ft.badge}
            </span>
            <div style={{ fontSize: 18, color: ft.accent }}>{ft.icon}</div>
            <div style={s.fcTitle}>{ft.title}</div>
          </div>
        ))}
      </div>

      {/* Detail box for current feature */}
      <p style={s.secLabel}>{f.title}</p>
      <div style={s.detailBox}>
        <div style={s.dbHead}>
          <div style={s.dbIconWrap(f.accentBg)}>
            <span style={{ fontSize: 22, color: f.accent }}>{f.icon}</span>
          </div>
          <div>
            <div style={s.dbTitle}>{f.title}</div>
            <div style={s.dbTag}>{f.tag}</div>
          </div>
          <span style={s.dbBadge(f.accentBg, f.badgeColor, f.accent)}>
            {f.badge}
          </span>
        </div>
        <div style={s.dbBody}>
          <div style={s.bullets}>
            {f.bullets.map((b, i) => (
              <div key={i} style={s.bulletRow}>
                <span style={s.bulletIcon}>{b.icon}</span>
                <span style={s.bulletText}>{b.text}</span>
              </div>
            ))}
          </div>
          {f.note && (
            <div style={s.noteBox}>
              <InfoCircleOutlined
                style={{ flexShrink: 0, fontSize: 15, marginTop: 1 }}
              />
              <span>{f.note}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer nav */}
      <div
        style={{
          ...s.footer,
          marginTop: 16,
          marginLeft: -22,
          marginRight: -22,
          paddingLeft: 22,
          paddingRight: 22,
        }}
      >
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {FEATURES.map((_, i) => (
            <div
              key={i}
              style={s.dot(i === current)}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#444" }}>
            {current + 1} of {FEATURES.length}
          </span>
          <button
            style={{
              ...s.navBtn(false),
              opacity: current === 0 ? 0.3 : 1,
              pointerEvents: current === 0 ? "none" : "auto",
            }}
            onClick={() => navigate(-1)}
          >
            <ArrowLeftOutlined style={{ fontSize: 12 }} /> Prev
          </button>
          <button
            style={s.navBtn(true)}
            onClick={() => (isLast ? onClose() : navigate(1))}
          >
            {isLast ? (
              <>
                <CheckOutlined style={{ fontSize: 12 }} /> Got it
              </>
            ) : (
              <>
                Next <ArrowRightOutlined style={{ fontSize: 12 }} />
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
