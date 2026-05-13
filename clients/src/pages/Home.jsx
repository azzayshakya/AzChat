import React from "react";
import { Button, Typography, Row, Col, Card, Tag, Badge } from "antd";
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
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

const { Title, Text } = Typography;

const ENV = {
  PORT: "7000",
  VERSION: "1.1.0",
  UNDER_DEVELOPMENT: true,
  DEVELOPER: "AZZAYSHAKYA",
};

export default function Home() {
  const nav = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--page-gradient)",
        color: "var(--text-white)",
      }}
    >
      {/* ── Navbar ── */}
      <Navbar />

      {/* ── HERO ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px 60px",
          textAlign: "center",
        }}
      >
        <div
          className="fade-up"
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "var(--brand-gradient)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: 40,
            boxShadow: "0 0 40px #667eea44", // Not replaced as it contains alpha transparency
          }}
        >
          <MessageOutlined />
        </div>

        <Title
          className="fade-up"
          style={{
            color: "var(--text-white)",
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: -1,
            marginBottom: 16,
          }}
        >
          AZ{" "}
          <span
            style={{
              background: "var(--title-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Chat
          </span>
        </Title>

        <Text
          className="fade-up-2"
          style={{
            color: "var(--text-muted)",
            fontSize: 17,
            maxWidth: 480,
            lineHeight: 1.7,
            display: "block",
            marginBottom: 10,
          }}
        >
          Real-time messaging built for{" "}
          <span style={{ color: "var(--text-highlight)", fontWeight: 600 }}>
            local networks .
          </span>
        </Text>

        {import.meta.env.VITE_UNDER_DEVELOPMENT === "true" && (
          <div className="fade-up" style={{ marginBottom: 24 }}>
            <Tag
              color="green"
              className="pulse"
              style={{
                fontSize: 12,
                padding: "5px 16px",
                borderRadius: 20,
                fontWeight: 600,
              }}
            >
              🚧 Under Development
            </Tag>
          </div>
        )}
      </div>

      <div
        style={{
          height: 1,
          background: "var(--divider-gradient)",
        }}
      />

      <Footer />
    </div>
  );
}
