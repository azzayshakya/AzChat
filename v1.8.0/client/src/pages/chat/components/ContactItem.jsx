import React from "react";
import { Avatar, Badge } from "antd";

/**
 * ContactItem
 * Renders a single row in the contacts/search-results list.
 *
 * Props:
 *  - contact      {object}  User object with { id, username, role, lastMessage, lastAt, unreadCount }
 *  - isSelected   {boolean} Whether this contact is the active chat
 *  - isOnline     {boolean} Green dot when true
 *  - onClick      {fn}      Called when the row is clicked
 */
export default function ContactItem({
  contact,
  isSelected,
  isOnline,
  onClick,
}) {
  const hasUnread = contact.unreadCount > 0;

  return (
    <div
      className={contact.role === "admin" ? "animated-admin-border" : ""}
      onClick={onClick}
      style={{
        padding: "12px 16px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: isSelected ? "#1e1e3a" : "transparent",
        borderLeft: isSelected ? "3px solid #667eea" : "3px solid transparent",
        transition: "all 0.15s",
      }}
    >
      {/* Online status dot */}
      <Badge dot color={isOnline ? "#52c41a" : "#555"} offset={[-2, 30]}>
        <Avatar style={{ background: "#667eea", flexShrink: 0 }}>
          {contact.username[0].toUpperCase()}
        </Avatar>
      </Badge>

      {/* Name + last message preview */}
      <div style={{ overflow: "hidden", flex: 1 }}>
        <div
          style={{
            color: hasUnread ? "#c4b5fd" : "#fff",
            fontWeight: hasUnread ? 700 : 500,
            fontSize: 13,
          }}
        >
          {contact.username}
        </div>

        {contact.lastMessage && (
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
            {contact.lastMessage}
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
