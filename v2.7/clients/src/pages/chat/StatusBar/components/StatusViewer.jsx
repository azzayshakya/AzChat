import React, { useState, useEffect, useRef, useCallback } from "react";
import { Spin, Modal, message as antMsg } from "antd";
import {
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
  DeleteOutlined,
  SendOutlined,
  EyeOutlined,
  GlobalOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { timeAgo, timeLeft, STATUS_CONFIG } from "../apiService/statusApi";
import UserAvatar from "../../../../components/UserAvatar";
import { getProfileImage } from "../../../../utils/getProfileImage";

const AUTO_ADVANCE_MS = 5000;

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
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const inputRef = useRef(null);

  const items = entry?.items ?? [];
  const item = items[idx];
  const isMine = entry?.isMine || entry?.userId === currentUser?.id;
  const isAdmin = entry?.isAdmin;
  console.log("azx", entry);
  // Mark viewed on each slide change
  useEffect(() => {
    if (!item?.id) return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 350);
    onView?.(item.id, entry.userId);
    return () => clearTimeout(t);
  }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [idx, paused, loading, items.length]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // privacy is a frontend-only field (backend doesn't persist it yet)
  const privacy = item.privacy ?? "public";
  const privacyIcon =
    privacy === "public" ? (
      <GlobalOutlined style={{ fontSize: 10 }} />
    ) : (
      <UserOutlined style={{ fontSize: 10 }} />
    );
  const privacyLabel = privacy === "public" ? "Public" : "Friends";

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
        {/* ── Progress bars ─────────────────────────────────────────── */}
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
                  borderRadius: 2,
                }}
              />
            </div>
          ))}
        </div>

        {/* ── Header ───────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px 8px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <UserAvatar
            image={getProfileImage(entry)}
            name={entry.username}
            size={44}
            avatarStyle={{ border: "2px solid var(--dark-bg-light)" }}
          />

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
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 10,
                  background:
                    privacy === "public"
                      ? "rgba(102,126,234,0.18)"
                      : "rgba(167,139,250,0.18)",
                  color:
                    privacy === "public"
                      ? "var(--primary-color)"
                      : "var(--accent-light)",
                  padding: "2px 6px",
                  borderRadius: 10,
                  border: `1px solid ${privacy === "public" ? "rgba(102,126,234,0.3)" : "rgba(167,139,250,0.3)"}`,
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
              {/* views is pre-computed in transformItem from viewers.length */}
              <span style={{ fontSize: 10, color: "var(--text-dim)" }}>
                {item.views ?? 0}
              </span>
            </div>
          </div>

          {isMine && (
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

          <button onClick={onClose} style={iconBtn} title="Close">
            <CloseOutlined style={{ fontSize: 14, color: "var(--text-dim)" }} />
          </button>
        </div>

        {/* ── Status content ───────────────────────────────────────── */}
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
              {/* imageUrl is set by transformItem from file.url */}
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

        {/* ── Replies ──────────────────────────────────────────────── */}
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
                <UserAvatar
                  image={getProfileImage(entry)}
                  name={entry.username}
                  size={44}
                  avatarStyle={{ border: "2px solid var(--dark-bg-light)" }}
                />
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

        {/* ── Reply input (hidden for own statuses) ─────────────────── */}
        {/* {!isMine && (
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
                e.stopPropagation();
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
        )} */}
      </div>

      {/* ── Delete confirmation ───────────────────────────────────── */}
      <Modal
        open={!!deleteConfirm}
        zIndex={3000}
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
