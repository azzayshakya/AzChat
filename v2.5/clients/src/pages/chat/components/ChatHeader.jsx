import React from "react";
import { Avatar, Badge } from "antd";
import UserAvatar from "../commonComponents/UserAvatar";

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
        size={40}
        image={
          contact.id === "13e78680-65ca-4ed3-ab02-495ad60132a3"
            ? "/default_female_profile_pic.jpg"
            : contact.id === "b3c5ec70-ec6b-4895-8c1a-d137a60ecc9d"
              ? "/default_female_profile_pic.jpg"
              : contact.role === "admin"
                ? "/developer_profile.jpg"
                : "/default_male_profile_pic.jpg"
        }
      />

      <div>
        <div
          style={{ color: "#fff", fontWeight: 600, fontSize: "1rem" }}
          className={contact.role === "admin" ? "admin_text_color_main" : ""}
        >
          {contact.username}
        </div>
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
