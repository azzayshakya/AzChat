import React from "react";
import { Avatar, Badge } from "antd";
import UserAvatar from "../UComponents/UserAvatar";

export default function ChatHeader({ contact, isOnline }) {
  return (
    <div
      style={{
        padding: "14px 20px",
        borderBottom: "1px solid #1e1e3a",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--dark-bg-light)",
      }}
    >
      <UserAvatar
        isOnline={isOnline}
        showOnlineStatus={true}
        name={contact.username}
        image={
          contact.id === "13e78680-65ca-4ed3-ab02-495ad60132a3"
            ? "/default_female_profile_pic.jpg"
            : contact.role === "admin"
              ? "/developer_profile.jpg"
              : "/default_male_profile_pic.jpg"
        }
      />

      <div>
        <div style={{ color: "#fff", fontWeight: 600 }}>{contact.username}</div>
        <div
          style={{
            color: isOnline ? "var(--online-status)" : "var(--offline-status)",
            fontSize: 11,
          }}
        >
          {isOnline ? "Online" : "Offline"}
        </div>
      </div>
    </div>
  );
}
