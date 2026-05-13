import React from "react";
import {
  UserOutlined,
  MailOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Divider, Space } from "antd";

const UserProfile = ({ user, logout }) => {
  return (
    <div
      style={{
        padding: "20px",
        background: "var(--bg-medium)",
        borderRadius: "16px",
        border: "1px solid var(--card-hover-border)",
        minWidth: "240px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "var(--brand-gradient)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            color: "var(--text-white)",
            boxShadow: "0 0 15px var(--primary-color)",
          }}
        >
          <UserOutlined />
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div
          style={{
            color: "var(--text-white)",
            fontWeight: 600,
            fontSize: "18px",
          }}
        >
          {user?.username || "User Name"}
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
          {user?.email || "user@example.com"}
        </div>
      </div>

      <Divider style={{ borderColor: "var(--divider-gradient)" }} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          alignItems: "center",
        }}
        onClick={() => logout()}
      >
        <div
          style={{ ...actionItemStyle, color: "#ff4d4f", alignItems: "center" }}
        >
          <LogoutOutlined />
          <span style={{ fontSize: "14px" }}>Logout</span>
        </div>
      </div>
    </div>
  );
};

const actionItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  cursor: "pointer",
  padding: "4px 0",
  transition: "all 0.2s",
};

export default UserProfile;
