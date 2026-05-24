/**
 * StatusViewer.jsx
 * Full-screen modal overlay for viewing a status entry.
 * Features:
 *  – User info header (avatar, name, time, privacy badge, views)
 *  – Status content (text / image / both)
 *  – Left/Right navigation across multiple status items
 *  – Progress bar per item
 *  – Reply input
 *  – Delete button (owner only) with confirmation popup
 *  – Auto-advances after 5 seconds
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input, Spin, Modal, message as antMsg } from "antd";
import {
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
  DeleteOutlined,
  SendOutlined,
  EyeOutlined,
  LockOutlined,
  GlobalOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { timeAgo, timeLeft, STATUS_CONFIG } from "../statusComponents/statusApi";

const AUTO_ADVANCE_MS = 5000;

const AVATAR_COLORS = [
  "#2e2860",
  "#163a30",
  "#3a1c1c",
  "#162040",
  "#38192c",
  "#1a3020",
  "#382610",
];
const colorFor = (id) =>
  AVATAR_COLORS[
    (id?.split("").reduce((a, c) => a + c.charCodeAt(0), 0) ?? 0) %
      AVATAR_COLORS.length
  ];
const initials = (name) =>
  name
    ?.split(/[\s_]/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";

export default function StatusViewer({
  entry,
  startIndex = 0,
  currentUser,
  onClose,
  onDelete,
  onReply,
  onView,
  deleting,
  replying,
}) {
  const [idx, setIdx] = useState(startIndex);
  const [replyText, setReplyText] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // statusId to delete
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const inputRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const items = entry?.items ?? [];
  const item = items[idx];
  const isMine = entry?.userId === currentUser?.id || entry?.isMine;
  const isAdmin = entry?.isAdmin;

  // Mark viewed
  useEffect(() => {
    if (item?.id) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 350);
      onView?.(item.id, entry.userId);
      return () => clearTimeout(t);
    }
  }, [item?.id]);

  // Auto-advance + progress bar
  useEffect(() => {
    if (paused || loading) return;
    setProgress(0);
    const tick = 50;
    const steps = AUTO_ADVANCE_MS / tick;
    let step = 0;

    progressRef.current = setInterval(() => {
      step++;
      setProgress((step / steps) * 100);
    }, tick);

    timerRef.current = setTimeout(() => {
      if (idx < items.length - 1) setIdx((i) => i + 1);
      else onClose();
    }, AUTO_ADVANCE_MS);

    return () => {
      clearInterval(progressRef.current);
      clearTimeout(timerRef.current);
    };
  }, [idx, paused, loading, items.length]);

  const goNext = useCallback(() => {
    if (idx < items.length - 1) setIdx((i) => i + 1);
    else onClose();
  }, [idx, items.length, onClose]);

  const goPrev = useCallback(() => {
    if (idx > 0) setIdx((i) => i - 1);
  }, [idx]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    },
    [onClose, goNext, goPrev]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleReply = async () => {
    if (!replyText.trim() || replying) return;
    const txt = replyText.trim();
    setReplyText("");
    await onReply?.(item.id, txt);
    antMsg.success("Reply sent!");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    await onDelete?.(deleteConfirm);
    setDeleteConfirm(null);
    if (items.length <= 1) onClose();
    else if (idx >= items.length - 1) setIdx(Math.max(0, idx - 1));
  };

  if (!item) return null;

  const privacyIcon =
    item.privacy === "public" ? (
      <GlobalOutlined style={{ fontSize: 10 }} />
    ) : (
      <UserOutlined style={{ fontSize: 10 }} />
    );
  const privacyLabel = item.privacy === "public" ? "Public" : "Friends";

  return (
    <div
      style={overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={modal}>
        {/* ── Progress bars ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 4, padding: "12px 14px 0" }}>
          {items.map((it, i) => (
            <div
              key={it.id}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: "rgba(255,255,255,0.12)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: i < idx ? "100%" : i === idx ? `${progress}%` : "0%",
                  background: isAdmin
                    ? "var(--accent-light)"
                    : "var(--primary-color)",
                  transition: i === idx ? "none" : "none",
                  borderRadius: 2,
                }}
              />
            </div>
          ))}
        </div>

        {/* ── Top bar: user info + close ──────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px 8px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: colorFor(entry.userId),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              overflow: "hidden",
              flexShrink: 0,
              border: isAdmin ? "2px solid var(--accent-light)" : "none",
            }}
          >
            {entry.avatar ? (
              <img
                src={entry.avatar}
                alt={entry.username}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              initials(isAdmin ? "AZ Chat" : entry.username)
            )}
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: isAdmin ? "var(--accent-light)" : "var(--text-white)",
                }}
              >
                {isAdmin ? "AZChat (Admin)" : entry.username}
                {isMine && !isAdmin && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 10,
                      color: "var(--primary-color)",
                      fontWeight: 400,
                    }}
                  >
                    (you)
                  </span>
                )}
              </span>
              {/* Privacy badge */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 10,
                  background:
                    item.privacy === "public"
                      ? "rgba(102,126,234,0.18)"
                      : "rgba(167,139,250,0.18)",
                  color:
                    item.privacy === "public"
                      ? "var(--primary-color)"
                      : "var(--accent-light)",
                  padding: "2px 6px",
                  borderRadius: 10,
                  border: `1px solid ${item.privacy === "public" ? "rgba(102,126,234,0.3)" : "rgba(167,139,250,0.3)"}`,
                }}
              >
                {privacyIcon} {privacyLabel}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 2,
              }}
            >
              <span style={{ fontSize: 10, color: "var(--text-dim)" }}>
                {timeAgo(item.createdAt)}
              </span>
              <span style={{ fontSize: 10, color: "var(--text-dim)" }}>·</span>
              <span style={{ fontSize: 10, color: "var(--text-dim)" }}>
                {timeLeft(item.expiresAt)}
              </span>
              <span style={{ fontSize: 10, color: "var(--text-dim)" }}>·</span>
              <EyeOutlined style={{ fontSize: 10, color: "var(--text-dim)" }} />
              <span style={{ fontSize: 10, color: "var(--text-dim)" }}>
                {item.views ?? 0}
              </span>
            </div>
          </div>

          {/* Delete btn (owner only) */}
          {isMine && !isAdmin && (
            <button
              onClick={() => setDeleteConfirm(item.id)}
              disabled={deleting === item.id}
              style={iconBtn}
              title="Delete this status"
            >
              {deleting === item.id ? (
                <Spin size="small" />
              ) : (
                <DeleteOutlined style={{ fontSize: 14, color: "#e07070" }} />
              )}
            </button>
          )}

          {/* Close */}
          <button onClick={onClose} style={iconBtn} title="Close">
            <CloseOutlined style={{ fontSize: 14, color: "var(--text-dim)" }} />
          </button>
        </div>

        {/* ── Status content ─────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            minHeight: 240,
            background: item.backgroundColor ?? "#1a1540",
            margin: "0 14px",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <Spin size="large" />
          ) : (
            <>
              {/* Image */}
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt="status"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: 8,
                    opacity: loading ? 0 : 1,
                    transition: "opacity 0.3s",
                  }}
                />
              )}
              {/* Text overlay */}
              {item.text && (
                <div
                  style={{
                    position: item.imageUrl ? "absolute" : "relative",
                    bottom: item.imageUrl ? 16 : "auto",
                    left: item.imageUrl ? 16 : "auto",
                    right: item.imageUrl ? 16 : "auto",
                    background: item.imageUrl
                      ? "rgba(0,0,0,0.55)"
                      : "transparent",
                    color: item.textColor ?? "#e8e9f4",
                    fontSize: item.imageUrl ? 13 : 20,
                    fontWeight: item.imageUrl ? 400 : 500,
                    lineHeight: 1.5,
                    padding: item.imageUrl ? "8px 12px" : "24px",
                    borderRadius: 8,
                    textAlign: "center",
                    backdropFilter: item.imageUrl ? "blur(4px)" : "none",
                    maxWidth: "90%",
                    wordBreak: "break-word",
                  }}
                >
                  {item.text}
                </div>
              )}
            </>
          )}

          {/* Nav zones */}
          {idx > 0 && (
            <button
              onClick={goPrev}
              style={{ ...navBtn, left: 8 }}
              aria-label="Previous"
            >
              <LeftOutlined />
            </button>
          )}
          {idx < items.length - 1 && (
            <button
              onClick={goNext}
              style={{ ...navBtn, right: 8 }}
              aria-label="Next"
            >
              <RightOutlined />
            </button>
          )}
        </div>

        {/* ── Replies section ────────────────────────────────────────── */}
        {item.replies?.length > 0 && (
          <div
            style={{
              maxHeight: 110,
              overflowY: "auto",
              margin: "8px 14px 0",
              padding: "8px 10px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "var(--text-dim)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Replies
            </div>
            {item.replies.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 6,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: colorFor(r.userId),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    flexShrink: 0,
                    color: "#fff",
                  }}
                >
                  {initials(r.username)}
                </div>
                <div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-highlight)",
                    }}
                  >
                    {r.username}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginLeft: 6,
                    }}
                  >
                    {r.text}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      color: "var(--text-dim)",
                      marginLeft: 6,
                    }}
                  >
                    {timeAgo(r.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Reply input (hide for own statuses unless admin welcome) ── */}
        {(!isMine || isAdmin) && (
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              padding: "10px 14px 14px",
            }}
          >
            <input
              ref={inputRef}
              value={replyText}
              onChange={(e) =>
                setReplyText(e.target.value.slice(0, STATUS_CONFIG.replyMaxLen))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleReply();
                e.stopPropagation(); // don't trigger nav
              }}
              placeholder="Reply to this status…"
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "8px 12px",
                color: "var(--text-white)",
                fontSize: 12,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={handleReply}
              disabled={!replyText.trim() || replying}
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: replyText.trim()
                  ? "var(--primary-color)"
                  : "rgba(255,255,255,0.05)",
                border: "none",
                cursor: replyText.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
                flexShrink: 0,
              }}
            >
              {replying ? (
                <Spin size="small" />
              ) : (
                <SendOutlined style={{ color: "#fff", fontSize: 14 }} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Delete confirmation modal ─────────────────────────────── */}
      <Modal
        open={!!deleteConfirm}
        title={
          <span style={{ color: "var(--text-white)" }}>Delete Status?</span>
        }
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        okText="Delete"
        okButtonProps={{
          danger: true,
          loading: !!deleting,
          style: { borderRadius: 8 },
        }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        styles={{
          content: {
            background: "var(--dark-bg-light)",
            border: "1px solid rgba(255,255,255,0.08)",
          },
          header: { background: "transparent" },
          mask: { backdropFilter: "blur(4px)" },
        }}
      >
        <p style={{ color: "var(--text-muted)", marginTop: 8 }}>
          This status will be permanently removed. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 2000,
  background: "rgba(0,0,0,0.82)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(6px)",
};

const modal = {
  width: 380,
  maxWidth: "95vw",
  background: "var(--dark-bg-light)",
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  flexDirection: "column",
  gap: 0,
  overflow: "hidden",
  boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
  maxHeight: "90vh",
};

const iconBtn = {
  width: 30,
  height: 30,
  borderRadius: 8,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const navBtn = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: 32,
  height: 32,
  borderRadius: "50%",
  background: "rgba(0,0,0,0.45)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  zIndex: 10,
  fontSize: 13,
};
