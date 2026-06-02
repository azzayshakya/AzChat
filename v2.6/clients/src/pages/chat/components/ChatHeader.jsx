import React from "react";
import { Avatar, Badge } from "antd";
import UserAvatar from "../commonComponents/UserAvatar";
import { getProfileImage } from "../../../utils/getProfileImage";

export default function ChatHeader({ contact, isOnline }) {
  return (
    <div
      style={{
        padding: "14px 20px",
        borderBottom: "1px solid #1e1e3a",
        display: "flex",
        alignItems: "center",
        gap: 12,
        // background: "var(--dark-bg-light)",
        // border: "2px red solid",
        background: "rgba(102,126,234,0.14)",
        margin: "12px 15px 3px",
        borderRadius: "11px",
      }}
    >
      <UserAvatar
        isOnline={isOnline}
        showOnlineStatus={true}
        name={contact.username}
        size={40}
        image={getProfileImage(contact)}
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
