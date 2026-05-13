import React from "react";
import { Avatar, Badge } from "antd";


export default function ChatHeader({ contact, isOnline }) {
  return (
    <div
      style={{
        padding: "14px 20px",
        borderBottom: "1px solid #1e1e3a",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#10101e",
      }}
    >
      <Badge dot color={isOnline ? "#52c41a" : "#555"} offset={[-2, 30]}>
        <Avatar style={{ background: "#667eea" }}>
          {contact.username[0].toUpperCase()}
        </Avatar>
      </Badge>

      <div>
        <div style={{ color: "#fff", fontWeight: 600 }}>{contact.username}</div>
        <div style={{ color: isOnline ? "#52c41a" : "#666", fontSize: 11 }}>
          {isOnline ? "Online" : "Offline"}
        </div>
      </div>
    </div>
  );
}
