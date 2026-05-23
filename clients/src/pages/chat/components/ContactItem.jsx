import React from "react";
import { Avatar, Badge } from "antd";
import UserAvatar from "../UComponents/UserAvatar";
import { formatMessageTime, truncateText } from "../../../utils/TimeFormater";

export default function ContactItem({
  contact,
  isSelected,
  isOnline,
  onClick,
}) {
  const hasUnread = contact.unreadCount > 0;
  console.log("hxxx", contact.lastMessage);
  //   lastSeen
  //
  // "2026-05-22T12:05:46.189Z"
  return (
    <div
      className={contact.role === "admin" ? "" : ""}
      onClick={onClick}
      style={{
        padding: "12px 16px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: isSelected ? "#1e1e3a" : "transparent",
        // borderLeft: isSelected ? "3px solid #667eea" : "3px solid transparent",
        transition: "all 0.15s",
        // border: "2px red solid",
        borderRadius: "15px",

        // margin: "0px 12px",
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

      {/* Name + last message preview */}
      <div style={{ overflow: "hidden", flex: 1 }}>
        <div
          className={contact.role === "admin" ? "admin_text_color_main" : ""}
          style={{
            color: hasUnread ? "#c4b5fd" : "#fff",
            fontWeight: hasUnread ? 700 : 500,
            fontSize: 13,
          }}
        >
          {contact.role === "admin"
            ? `${contact.username} ( admin )`
            : `${contact.username}`}
        </div>

        {contact.lastMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div
              style={{
                color: hasUnread ? "#a78bfa" : "#666",
                fontWeight: hasUnread ? 500 : 400,
                fontSize: 11,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {truncateText(
                contact.lastMessage.text || "File / Deleted message",
                20
              )}
            </div>

            {!isOnline && (
              <div
                style={{
                  fontSize: 10,
                  color: "#777",
                  flexShrink: 0,
                }}
              >
                {formatMessageTime(contact.lastMessage.createdAt)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Unread count pill */}
      {hasUnread && (
        <div
          style={{
            background: "#667eea",
            color: "#fff",
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            padding: "0 6px",
            flexShrink: 0,
          }}
        >
          {contact.unreadCount > 99 ? "99+" : contact.unreadCount}
        </div>
      )}
    </div>
  );
}
