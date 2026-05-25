import React from "react";
import { Button, Typography, Row, Col, Card, Tag, Badge, Popover } from "antd";
import { useNavigate } from "react-router-dom";
import {
  MessageOutlined,
  WifiOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  UserOutlined,
  TeamOutlined,
  GlobalOutlined,
  BulbOutlined,
  GithubOutlined,
  BugOutlined,
} from "@ant-design/icons";
import { useAuth } from "../AuthContext";
import UserProfile from "./UserProfile";

const { Title, Text } = Typography;
export default function Navbar() {
  const nav = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "var(--bg-darkest)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid #1e1e3a",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          <MessageOutlined style={{ color: "#fff" }} />
        </div>
        <span
          style={{
            fontWeight: 800,
            fontSize: 18,
            color: "#fff",
            letterSpacing: 0.5,
          }}
        >
          AZ<span style={{ color: "#667eea" }}>Chat</span>
        </span>
      </div>

      {/* Nav links */}
      {!user ? (
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <li
            onClick={() => nav("/home")}
            style={{
              listStyle: "none",
              cursor: "pointer",
              color: "#FFF",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "#667eea";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#FFF";
            }}
          >
            Home
          </li>
        </div>
      ) : (
        ""
      )}

      {/* Auth buttons */}
      {!user ? (
        <div style={{ display: "flex", gap: 10 }}>
          <Button
            onClick={() => nav("/login")}
            style={{
              height: 36,
              borderRadius: 10,
              border: "1.5px solid #667eea",
              color: "#667eea",
              background: "transparent",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Login
          </Button>
          <Button
            type="primary"
            onClick={() => nav("/register")}
            style={{
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              border: "none",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Register
          </Button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <li
            onClick={() => nav("/home")}
            style={{
              listStyle: "none",
              cursor: "pointer",
              color: "#FFF",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "#667eea";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#FFF";
            }}
          >
            Home
          </li>
          <li style={{ listStyle: "none" }}>
            <Popover
              content={<UserProfile user={user} logout={logout} />}
              trigger="click"
              placement="bottomRight"
              overlayInnerStyle={{ padding: 0, background: "transparent" }} // Makes it look cleaner
            >
              <div
                style={{
                  cursor: "pointer",
                  color: "var(--text-white)", // Using your variable
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--primary-color)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-white)";
                }}
              >
                <UserOutlined style={{ fontSize: "18px" }} />
                <span>Profile</span>
              </div>
            </Popover>
          </li>
        </div>
      )}
    </nav>
  );
}
