import React from "react";
import { Modal } from "antd";
import {
  CloseOutlined,
  FileImageOutlined,
  GlobalOutlined,
  TeamOutlined,
  EyeOutlined,
  LockOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  WarningOutlined,
  BranchesOutlined,
  CheckOutlined,
  RocketOutlined,
  BugOutlined,
  ExperimentOutlined,
  NotificationOutlined,
} from "@ant-design/icons";

const sectionLabel = {
  fontSize: 10,
  fontWeight: 500,
  color: "#667eea",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  margin: "0 0 10px",
};

const divider = {
  height: "0.5px",
  background: "rgba(255,255,255,0.06)",
  margin: "20px 0",
};

const prose = {
  fontSize: 13,
  color: "#7a7a9a",
  lineHeight: 1.7,
  margin: "0 0 12px",
};

export default function AboutStatusModal({ open, onClose }) {
  const chips = [
    { icon: <BranchesOutlined />, label: "Project progress" },
    { icon: <CheckOutlined />, label: "Task updates" },
    { icon: <RocketOutlined />, label: "Deployments" },
    { icon: <BugOutlined />, label: "Bug fixes" },
    { icon: <ExperimentOutlined />, label: "Testing status" },
    { icon: <NotificationOutlined />, label: "Announcements" },
    { icon: <ClockCircleOutlined />, label: "Availability" },
  ];

  const infoRows = [
    {
      icon: (
        <EyeOutlined
          style={{
            fontSize: 16,
            color: "#667eea",
            marginTop: 1,
            flexShrink: 0,
          }}
        />
      ),
      title: "See who viewed",
      desc: 'Tap "See all" at the bottom of your status — view count, viewer names, and the time each person viewed.',
    },
    {
      icon: (
        <LockOutlined
          style={{
            fontSize: 16,
            color: "#667eea",
            marginTop: 1,
            flexShrink: 0,
          }}
        />
      ),
      title: "Audience is snapshot-based",
      desc: "For friends-only statuses, the audience is locked at posting time — only people you had chatted with before then can see it.",
    },
  ];

  const expiryRows = [
    {
      icon: <ClockCircleOutlined />,
      text: "Statuses expire automatically after 24 hours.",
    },
    {
      icon: <DeleteOutlined />,
      text: "You can delete your status at any time.",
    },
    {
      icon: <WarningOutlined />,
      text: "Deleted statuses cannot be recovered.",
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={620}
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
              }}
            >
              <FileImageOutlined style={{ color: "#667eea", fontSize: 16 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#e8e9f4" }}>
                About Status
              </div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>
                How AZ Chat status works
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
            <CloseOutlined />
          </button>
        </div>
      }
      styles={{
        content: {
          background: "#10101e",
          border: "0.5px solid rgba(255,255,255,0.09)",
          borderRadius: 18,
          padding: 0,
        },
        header: {
          background: "transparent",
          padding: "16px 20px",
          borderBottom: "0.5px solid rgba(255,255,255,0.07)",
          marginBottom: 0,
        },
        body: {
          padding: "20px 22px 24px",
          overflowY: "auto",
          maxHeight: "calc(80vh - 72px)",
        },
        mask: { backdropFilter: "blur(6px)" },
      }}
    >
      {/* What to share */}
      <p style={sectionLabel}>What to share</p>
      <p style={prose}>
        Status is designed for professional updates and team communication
        inside AZ Chat.
      </p>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 4 }}
      >
        {chips.map(({ icon, label }) => (
          <span
            key={label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#9b93c8",
              background: "rgba(102,126,234,0.08)",
              border: "0.5px solid rgba(102,126,234,0.18)",
              borderRadius: 20,
              padding: "4px 11px",
            }}
          >
            <span style={{ fontSize: 13, color: "#667eea" }}>{icon}</span>
            {label}
          </span>
        ))}
      </div>

      <div style={divider} />

      {/* Privacy */}
      <p style={sectionLabel}>Privacy</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            borderRadius: 12,
            padding: "14px 16px",
            background: "rgba(102,126,234,0.08)",
            border: "0.5px solid rgba(102,126,234,0.22)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(102,126,234,0.18)",
              }}
            >
              <GlobalOutlined style={{ fontSize: 15, color: "#667eea" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#8fa8f5" }}>
              Public
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "#6a6a8a",
              lineHeight: 1.6,
            }}
          >
            Visible to all AZ Chat users.
          </p>
        </div>

        <div
          style={{
            borderRadius: 12,
            padding: "14px 16px",
            background: "rgba(167,139,250,0.08)",
            border: "0.5px solid rgba(167,139,250,0.22)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(167,139,250,0.18)",
              }}
            >
              <TeamOutlined style={{ fontSize: 15, color: "#a78bfa" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#c5b8ff" }}>
              Friends
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "#6a6a8a",
              lineHeight: 1.6,
            }}
          >
            Visible only to users in your chat history at time of posting.
          </p>
        </div>
      </div>

      <div style={divider} />

      {/* Viewers & audience */}
      <p style={sectionLabel}>Viewers & audience</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {infoRows.map(({ icon, title, desc }) => (
          <div
            key={title}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "10px 12px",
              background: "rgba(255,255,255,0.03)",
              border: "0.5px solid rgba(255,255,255,0.05)",
              borderRadius: 10,
            }}
          >
            {icon}
            <div style={{ fontSize: 12, color: "#7a7a9a", lineHeight: 1.6 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#c5c5e0",
                  marginBottom: 2,
                }}
              >
                {title}
              </div>
              {desc}
            </div>
          </div>
        ))}
      </div>

      <div style={divider} />

      {/* Expiry & deletion */}
      <p style={sectionLabel}>Expiry & deletion</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {expiryRows.map(({ icon, text }) => (
          <div
            key={text}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "#6a6a8a",
              padding: "3px 0",
            }}
          >
            <span style={{ fontSize: 14, color: "#9b93c8" }}>{icon}</span>
            {text}
          </div>
        ))}
      </div>
    </Modal>
  );
}
