import React from "react";
import UserAvatar from "../UComponents/UserAvatar";
import { formatMessageTime, truncateText } from "../../../utils/TimeFormater";

function previewText(msg) {
  if (!msg) return null;
  if (msg.deletedFor === "everyone") return "🚫 Message deleted";
  if (msg.file) {
    const cat = msg.file.category;
    if (cat === "image") return "📷 Photo";
    if (cat === "video") return "🎥 Video";
    if (cat === "audio") return "🎵 Audio";
    return `📎 ${msg.file.name || "File"}`;
  }
  const truncMsg = truncateText(msg.text || "File / Deleted message", 20);
  return truncMsg || null;
}

export default function ContactItem({
  contact,
  isSelected,
  isOnline,
  onClick,
}) {
  const hasUnread = contact.unreadCount > 0;
  const preview = previewText(contact.lastMessage);

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        margin: "1px 6px",
        borderRadius: 11,
        cursor: "pointer",
        transition: "background 0.12s",
        background: isSelected ? "rgba(102,126,234,0.14)" : "transparent",
        outline: isSelected ? "1px solid rgba(102,126,234,0.2)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!isSelected)
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.background = "transparent";
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <UserAvatar
          name={contact.username}
          size={36}
          isOnline={isOnline}
          showOnlineStatus={true}
          image={
            contact.id === "653c1ea1-acb8-46b3-918e-8416c8936584"
              ? "/default_female_profile_pic.jpg"
              : contact.id === "b3c5ec70-ec6b-4895-8c1a-d137a60ecc9d"
                ? "/default_female_profile_pic.jpg"
                : contact.role === "admin"
                  ? "/developer_profile.jpg"
                  : "/default_male_profile_pic.jpg"
          }
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: name + time */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 6,
          }}
        >
          <span
            className={contact.role === "admin" ? "admin_text_color_main" : ""}
            style={{
              fontSize: 13,
              fontWeight: hasUnread ? 600 : 500,
              color: hasUnread ? "var(--text-white)" : "var(--text-highlight)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "65%",
            }}
          >
            {contact.role === "admin"
              ? `${contact.username} (admin)`
              : contact.username}
          </span>

          {contact.lastMessage && (
            <span
              style={{
                fontSize: 10.5,
                color: hasUnread ? "var(--accent-light)" : "var(--text-dim)",
                flexShrink: 0,
                fontWeight: hasUnread ? 600 : 400,
              }}
            >
              {formatMessageTime(contact.lastMessage.createdAt)}
            </span>
          )}
        </div>

        {/* Row 2: preview + unread badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 6,
            marginTop: 2,
          }}
        >
          <span
            style={{
              fontSize: 11.5,
              color: hasUnread ? "var(--text-muted)" : "var(--text-dim)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: 1,
              fontWeight: hasUnread ? 500 : 400,
            }}
          >
            {preview ?? (
              <span style={{ fontStyle: "italic", opacity: 0.4 }}>
                Click to contact the user .
              </span>
            )}
          </span>

          {hasUnread && (
            <span
              style={{
                background: "var(--primary-color)",
                color: "#fff",
                borderRadius: 10,
                minWidth: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                padding: "0 5px",
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              {contact.unreadCount > 99 ? "99+" : contact.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
