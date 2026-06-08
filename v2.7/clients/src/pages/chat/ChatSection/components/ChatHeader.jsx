import React from "react";
import { Avatar, Badge } from "antd";
import UserAvatar from "../../../../components/UserAvatar";
import { getProfileImage } from "../../../../utils/getProfileImage";
import { USER_ROLES } from "../../../../utils/Enum";

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
        background: "var(--theme-bg-light)",
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
          className={
            contact.role === USER_ROLES.ADMIN
              ? "admin_text_color_main"
              : contact.role === USER_ROLES.DEVELOPER
                ? "developer_text_color_main"
                : ""
          }
        >
          {contact.role === "admin"
            ? `${contact.username} (admin)`
            : contact.role === "developer"
              ? `${contact.username} (developer)`
              : `${contact.username} `}
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
