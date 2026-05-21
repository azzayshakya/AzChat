import React, { useState } from "react";
import { Dropdown, Modal, message as antMsg } from "antd";
import {
  DeleteOutlined,
  CheckOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { features } from "../../../utils/features.js";
import { api } from "../../../api.js";

export default function MessageBubble({
  message,
  isMine,
  onDeleted,
  isGroup,
  groupMembers,
}) {
  const [deleting, setDeleting] = useState(false);

  // Deleted for everyone stub
  if (message.deletedFor === "everyone") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: isMine ? "flex-end" : "flex-start",
        }}
      >
        <div
          style={{
            padding: "8px 14px",
            borderRadius: 12,
            background: "#1a1a2e",
            color: "#555",
            fontSize: 12,
            fontStyle: "italic",
          }}
        >
          🚫 This message was deleted
        </div>
      </div>
    );
  }

  const handleDelete = (deleteFor) => {
    Modal.confirm({
      title:
        deleteFor === "everyone" ? "Delete for everyone?" : "Delete for me?",
      content:
        deleteFor === "everyone"
          ? "This cannot be undone."
          : "Only you will stop seeing this.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeleting(true);
        try {
          await api.delete(`/messages/${message.id}`, { data: { deleteFor } });
          onDeleted?.(message.id, deleteFor);
        } catch {
          antMsg.error("Failed to delete message");
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const menuItems = [];
  if (isMine && features.deleteOwnMessage)
    menuItems.push({
      key: "me",
      label: "Delete for me",
      icon: <DeleteOutlined />,
      onClick: () => handleDelete("me"),
    });
  if (isMine && features.deleteForEveryone)
    menuItems.push({
      key: "everyone",
      label: "Delete for everyone",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete("everyone"),
    });

  const seenIcon = () => {
    if (!features.messageSeenStatus || !isMine || isGroup) return null;
    if (message.status === "seen")
      return <CheckCircleOutlined style={{ color: "#a78bfa", fontSize: 10 }} />;
    return (
      <CheckOutlined
        style={{
          color: message.status === "delivered" ? "#888" : "#555",
          fontSize: 10,
        }}
      />
    );
  };

  // Sender name in group — shown above bubble for others' messages
  const senderName =
    isGroup && !isMine
      ? groupMembers?.find((m) => m.id === message.senderId)?.username ||
        "Unknown"
      : null;
  // Add this helper inside MessageBubble (above renderContent)
  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, li) => {
      // Task: [ ] or [x]
      if (/^\[( |x)\] /.test(line)) {
        const done = line[1] === "x";
        return (
          <div
            key={li}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <input
              type="checkbox"
              defaultChecked={done}
              readOnly
              style={{ accentColor: "#a78bfa" }}
            />
            <span
              style={{
                textDecoration: done ? "line-through" : "none",
                opacity: done ? 0.6 : 1,
              }}
            >
              {formatInline(line.slice(4))}
            </span>
          </div>
        );
      }
      // Bullet
      if (line.startsWith("• ")) {
        return (
          <div key={li} style={{ paddingLeft: 4 }}>
            • {formatInline(line.slice(2))}
          </div>
        );
      }
      return <div key={li}>{formatInline(line) || <br />}</div>;
    });
  };

  const formatInline = (text) => {
    // Bold **text**, italic _text_, code `text`
    const parts = [];
    const re = /(\*\*(.+?)\*\*|_(.+?)_|`(.+?)`)/g;
    let last = 0,
      m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      if (m[0].startsWith("**"))
        parts.push(<strong key={m.index}>{m[2]}</strong>);
      else if (m[0].startsWith("_")) parts.push(<em key={m.index}>{m[3]}</em>);
      else
        parts.push(
          <code
            key={m.index}
            style={{
              background: "#0006",
              borderRadius: 3,
              padding: "1px 4px",
              fontFamily: "monospace",
              fontSize: 12,
            }}
          >
            {m[4]}
          </code>
        );
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  // Then in renderContent(), replace:
  // return <div>{message.text}</div>;
  // with:
  // return <div>{renderMarkdown(message.text)}</div>;
  const renderContent = () => {
    if (message.file) {
      const { category, url, name } = message.file;
      const fullUrl = `${import.meta.env.VITE_API_URL}${url}`;
      if (category === "image") {
        return (
          <div>
            <img
              src={fullUrl}
              alt={name}
              style={{ maxWidth: 220, borderRadius: 8, display: "block" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            {message.text && <div style={{ marginTop: 4 }}>{message.text}</div>}
          </div>
        );
      }
      return (
        <div>
          <a
            href={fullUrl}
            download={name}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#a78bfa",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
            }}
          >
            📎 {name}
          </a>
          {message.text && <div style={{ marginTop: 4 }}>{message.text}</div>}
        </div>
      );
    }
    return <div>{renderMarkdown(message.text)}</div>;
  };

  const bubble = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isMine ? "flex-end" : "flex-start",
        maxWidth: "65%",
      }}
    >
      {senderName && (
        <div
          style={{
            color: "#a78bfa",
            fontSize: 11,
            fontWeight: 600,
            marginBottom: 2,
            paddingLeft: 4,
          }}
        >
          {senderName}
        </div>
      )}
      <div
        style={{
          padding: "9px 14px",
          borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isMine
            ? "linear-gradient(135deg, #667eea, #764ba2)"
            : "#1e1e3a",
          color: "#fff",
          fontSize: 13,
          lineHeight: 1.5,
          boxShadow: "0 2px 8px #0004",
          opacity: deleting ? 0.5 : 1,
          cursor: menuItems.length ? "context-menu" : "default",
        }}
      >
        {renderContent()}
        <div
          style={{
            fontSize: 10,
            color: isMine ? "#ccc" : "#666",
            marginTop: 4,
            textAlign: "right",
            display: "flex",
            justifyContent: "flex-end",
            gap: 4,
            alignItems: "center",
          }}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {seenIcon()}
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
      }}
    >
      {menuItems.length > 0 ? (
        <Dropdown menu={{ items: menuItems }} trigger={["contextMenu"]}>
          {bubble}
        </Dropdown>
      ) : (
        bubble
      )}
    </div>
  );
}
