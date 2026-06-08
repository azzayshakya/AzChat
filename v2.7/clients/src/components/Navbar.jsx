import React from "react";
import { Button, Popover } from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "../AuthContext";
import UserProfile from "./UserProfile";

export default function Navbar() {
  const nav = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "var(--secondary-color)",
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
          <img
            src="/AzChatLogo.png"
            alt=""
            height={36}
            width={36}
            style={{ borderRadius: 10 }}
          />
          {/* <MessageOutlined style={{ color: '#fff' }} /> */}
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
          <li
            onClick={() => nav("/about")}
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
            About
          </li>
          <li
            onClick={() => nav("/features")}
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
            Features
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
          <li
            onClick={() => nav("/about")}
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
            About
          </li>{" "}
          <li
            onClick={() => nav("/feature")}
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
            Features
          </li>
          <li
            onClick={() => nav("/chat")}
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
            Chat
          </li>
          <li
            onClick={() => nav("/attendence")}
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
            Attendence
          </li>
          <li style={{ listStyle: "none" }}>
            <Popover
              content={<UserProfile user={user} logout={logout} />}
              trigger="click"
              placement="bottomRight"
              overlayInnerStyle={{
                padding: 0,
                background: "transparent",
              }}
            >
              <div
                style={{
                  cursor: "pointer",

                  display: "flex",

                  alignItems: "center",

                  gap: "10px",

                  padding: "10px 18px",

                  borderRadius: "14px",

                  background:
                    "linear-gradient(135deg, rgba(102,126,234,0.18), rgba(118,75,162,0.18))",

                  border: "1px solid rgba(167,139,250,0.25)",

                  color: "var(--text-white)",

                  fontSize: "14px",

                  fontWeight: "600",

                  backdropFilter: "blur(12px)",

                  boxShadow: "0 4px 20px rgba(102,126,234,0.15)",

                  transition: "all 0.25s ease",

                  position: "relative",

                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  // e.currentTarget.style.transform =
                  //   "translateY(-2px) scale(1.02)";

                  e.currentTarget.style.boxShadow =
                    "0 8px 28px rgba(102,126,234,0.35)";

                  e.currentTarget.style.border =
                    "1px solid rgba(167,139,250,0.45)";
                }}
                onMouseLeave={(e) => {
                  // e.currentTarget.style.transform = "translateY(0) scale(1)";

                  e.currentTarget.style.boxShadow =
                    "0 4px 20px rgba(102,126,234,0.15)";

                  e.currentTarget.style.border =
                    "1px solid rgba(167,139,250,0.25)";
                }}
              >
                {/* Glow Effect */}
                <div
                  style={{
                    position: "absolute",

                    inset: 0,

                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",

                    transform: "translateX(-100%)",

                    animation: "profileShine 3s infinite",
                    overflow: "hidden",
                  }}
                />
                {user.role === "admin" ? (
                  <img
                    src="/developer_profile.jpg"
                    height={"20px"}
                    width={"20px"}
                    style={{ borderRadius: "50%" }}
                  />
                ) : (
                  <UserOutlined
                    style={{
                      fontSize: "18px",

                      color: "var(--accent-light)",

                      zIndex: 1,
                    }}
                  />
                )}

                <span style={{ zIndex: 1 }}>Profile</span>
              </div>
            </Popover>
          </li>
        </div>
      )}
    </nav>
  );
}
