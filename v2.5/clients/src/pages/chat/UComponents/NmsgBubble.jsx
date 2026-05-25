import React, { useState } from "react";
import { Dropdown, Modal, message as antMsg } from "antd";
import {
  DeleteOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  FilePdfOutlined,
  FileZipOutlined,
  FileTextOutlined,
  FileOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { features } from "../../../utils/features.js";
import { api } from "../../../api.js";

/* ─── helpers ────────────────────────────────────────────────────── */

const isOnlyEmoji = (text) => {
  if (!text) return false;
  const emojiRe =
    /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}|\uFE0F|\u200D|\s)+$/u;
  return emojiRe.test(text.trim()) && text.trim().length <= 12;
};

const isGif = (url = "") =>
  /\.gif(\?.*)?$/i.test(url) ||
  url.includes("tenor.com") ||
  url.includes("giphy.com");

const fileIcon = (name = "") => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["pdf"].includes(ext)) return <FilePdfOutlined />;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext))
    return <FileZipOutlined />;
  if (["txt", "md", "doc", "docx"].includes(ext)) return <FileTextOutlined />;
  return <FileOutlined />;
};

const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ─── inline markdown ────────────────────────────────────────────── */

const formatInline = (text) => {
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
            background: "rgba(0,0,0,0.35)",
            borderRadius: 4,
            padding: "1px 5px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: 0,
          }}
        >
          {m[4]}
        </code>
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
};

const renderMarkdown = (text) => {
  if (!text) return null;
  return text.split("\n").map((line, li) => {
    if (/^\[( |x)\] /i.test(line)) {
      const done = line[1].toLowerCase() === "x";
      return (
        <div
          key={li}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            margin: "2px 0",
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 4,
              border: `1.5px solid ${done ? "var(--accent-light)" : "rgba(255,255,255,0.25)"}`,
              background: done ? "var(--accent-light)" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {done && (
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path
                  d="M1 4l2 2 4-4"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </span>
          <span
            style={{
              textDecoration: done ? "line-through" : "none",
              opacity: done ? 0.55 : 1,
            }}
          >
            {formatInline(line.slice(4))}
          </span>
        </div>
      );
    }
    if (line.startsWith("• ") || line.startsWith("- ")) {
      return (
        <div
          key={li}
          style={{
            display: "flex",
            gap: 7,
            alignItems: "flex-start",
            margin: "1px 0",
          }}
        >
          <span style={{ opacity: 0.5, marginTop: 1, flexShrink: 0 }}>•</span>
          <span>{formatInline(line.slice(2))}</span>
        </div>
      );
    }
    const empty = line.trim() === "";
    return (
      <div key={li} style={{ minHeight: empty ? "0.6em" : undefined }}>
        {empty ? null : formatInline(line)}
      </div>
    );
  });
};

/* ─── sub-components ─────────────────────────────────────────────── */

const ImageBubble = ({ url, name, text }) => {
  const [loaded, setLoaded] = useState(false);
  const gif = isGif(url);
  return (
    <div>
      <div
        style={{
          position: "relative",
          borderRadius: 10,
          overflow: "hidden",
          background: "rgba(0,0,0,0.25)",
          maxWidth: 240,
          minHeight: loaded ? 0 : 120,
        }}
      >
        <img
          src={url}
          alt={name}
          onLoad={() => setLoaded(true)}
          style={{
            display: "block",
            maxWidth: 240,
            maxHeight: 300,
            width: "100%",
            objectFit: "cover",
            borderRadius: 10,
            transition: "opacity 0.3s",
            opacity: loaded ? 1 : 0,
          }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        {gif && loaded && (
          <span
            style={{
              position: "absolute",
              bottom: 6,
              left: 6,
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              fontSize: 9,
              fontWeight: 700,
              padding: "2px 5px",
              borderRadius: 4,
              letterSpacing: 0.5,
            }}
          >
            GIF
          </span>
        )}
      </div>
      {text && (
        <div style={{ marginTop: 5, fontSize: 13 }}>{renderMarkdown(text)}</div>
      )}
    </div>
  );
};

const FileBubble = ({ url, name, size, text, isMine }) => (
  <div>
    <a
      href={url}
      download={name}
      target="_blank"
      rel="noreferrer"
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: isMine
            ? "rgba(255,255,255,0.12)"
            : "rgba(255,255,255,0.06)",
          borderRadius: 10,
          padding: "10px 13px",
          cursor: "pointer",
          transition: "background 0.2s",
          minWidth: 180,
          maxWidth: 260,
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = isMine
            ? "rgba(255,255,255,0.18)"
            : "rgba(255,255,255,0.1)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = isMine
            ? "rgba(255,255,255,0.12)"
            : "rgba(255,255,255,0.06)")
        }
      >
        <span style={{ fontSize: 22, opacity: 0.85 }}>{fileIcon(name)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#fff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </div>
          {size && (
            <div style={{ fontSize: 10, opacity: 0.5, marginTop: 1 }}>
              {formatSize(size)}
            </div>
          )}
        </div>
        <DownloadOutlined style={{ opacity: 0.5, fontSize: 13 }} />
      </div>
    </a>
    {text && (
      <div style={{ marginTop: 5, fontSize: 13 }}>{renderMarkdown(text)}</div>
    )}
  </div>
);

/* ─── seen tick ──────────────────────────────────────────────────── */

const SeenIcon = ({ status }) => {
  if (status === "seen")
    return (
      <CheckCircleOutlined
        style={{ color: "var(--accent-light)", fontSize: 10, flexShrink: 0 }}
      />
    );
  return (
    <CheckOutlined
      style={{
        color:
          status === "delivered"
            ? "rgba(255,255,255,0.45)"
            : "rgba(255,255,255,0.25)",
        fontSize: 10,
        flexShrink: 0,
      }}
    />
  );
};

/* ─── main component ─────────────────────────────────────────────── */

export default function MessageBubble({
  message,
  isMine,
  onDeleted,
  isGroup,
  groupMembers,
}) {
  const [deleting, setDeleting] = useState(false);

  /* deleted state */
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
            padding: "7px 14px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.3)",
            fontSize: 12,
            fontStyle: "italic",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 14 }}>🚫</span> This message was deleted
        </div>
      </div>
    );
  }

  /* delete handler */
  const handleDelete = (deleteFor) => {
    Modal.confirm({
      title:
        deleteFor === "everyone" ? "Delete for everyone?" : "Delete for me?",
      content:
        deleteFor === "everyone"
          ? "This action cannot be undone."
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

  /* sender label in groups */
  const senderName =
    isGroup && !isMine
      ? groupMembers?.find((m) => m.id === message.senderId)?.username ||
        "Unknown"
      : null;

  /* ── content renderer ── */
  const renderContent = () => {
    const { file, text } = message;

    if (file) {
      const { category, url, name, size } = file;
      const fullUrl = `${import.meta.env.VITE_API_URL}${url}`;

      if (category === "image" || category === "gif") {
        return <ImageBubble url={fullUrl} name={name} text={text} />;
      }
      return (
        <FileBubble
          url={fullUrl}
          name={name}
          size={size}
          text={text}
          isMine={isMine}
        />
      );
    }

    /* pure emoji */
    if (isOnlyEmoji(text)) {
      return (
        <div
          style={{
            fontSize: 36,
            lineHeight: 1.2,
            background: "none",
            padding: 0,
            textAlign: isMine ? "right" : "left",
          }}
        >
          {text}
        </div>
      );
    }

    return <div style={{ lineHeight: 1.55 }}>{renderMarkdown(text)}</div>;
  };

  const emojiOnly = !message.file && isOnlyEmoji(message.text);

  /* ── avatar for others in group ── */
  const avatarChar = senderName?.[0]?.toUpperCase();

  /* ── bubble ── */
  const bubble = (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        maxWidth: "72%",
        flexDirection: isMine ? "row-reverse" : "row",
      }}
    >
      {/* avatar placeholder for non-mine group messages */}
      {isGroup && !isMine && (
        <>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "var(--brand-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(102,126,234,0.35)",
              marginBottom: 2,
            }}
          >
            {avatarChar}
          </div>
        </>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isMine ? "flex-end" : "flex-start",
          gap: 3,
        }}
      >
        {senderName && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--accent-light)",
              paddingLeft: isMine ? 0 : 4,
              letterSpacing: 0.3,
              textTransform: "uppercase",
            }}
          >
            {senderName}
          </div>
        )}

        {/* the bubble itself */}
        <div
          style={{
            padding: emojiOnly ? "0" : "10px 14px",
            borderRadius: isMine ? "18px 18px 5px 18px" : "18px 18px 18px 5px",
            background: emojiOnly
              ? "transparent"
              : isMine
                ? "var(--brand-gradient)"
                : "rgba(255,255,255,0.07)",
            backdropFilter: emojiOnly ? "none" : "blur(8px)",
            border: emojiOnly
              ? "none"
              : isMine
                ? "1px solid rgba(255,255,255,0.12)"
                : "1px solid rgba(255,255,255,0.07)",
            color: "var(--text-white)",
            fontSize: 13,
            boxShadow: emojiOnly
              ? "none"
              : isMine
                ? "0 4px 20px rgba(102,126,234,0.3)"
                : "0 2px 12px rgba(0,0,0,0.3)",
            opacity: deleting ? 0.4 : 1,
            transition: "opacity 0.2s",
            cursor: menuItems.length ? "context-menu" : "default",
            position: "relative",
          }}
        >
          {renderContent()}

          {/* timestamp + seen */}
          {!emojiOnly && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 4,
                marginTop: 5,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: isMine
                    ? "rgba(255,255,255,0.55)"
                    : "rgba(255,255,255,0.3)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {features.messageSeenStatus && isMine && !isGroup && (
                <SeenIcon status={message.status} />
              )}
            </div>
          )}
        </div>

        {/* timestamp outside for emoji bubbles */}
        {emojiOnly && (
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
              paddingLeft: isMine ? 0 : 4,
              paddingRight: isMine ? 4 : 0,
            }}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
        paddingLeft: isMine ? "20%" : 0,
        paddingRight: isMine ? 0 : "20%",
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
