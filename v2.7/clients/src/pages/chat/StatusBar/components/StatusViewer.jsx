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
  UsergroupAddOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { STATUS_CONFIG } from "../apiService/statusApi";
import UserAvatar from "../../../../components/UserAvatar";
import { getProfileImage } from "../../../../utils/getProfileImage";
import { formatMessageTime, timeLeft } from "../../../../utils/TimeFormater";

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
  setViewing,
}) {
  const [idx, setIdx] = useState(startIndex);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [viewerTab, setViewerTab] = useState("viewed");
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const inputRef = useRef(null);

  const items = entry?.items ?? [];
  const item = items[idx];
  const viewers = item?.viewers ?? [];
  const allowedUsers = item?.visibleTo ?? [];
  const isMine = entry?.isMine || entry?.userId === currentUser?.id;
  const isAdmin = entry?.isAdmin;
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

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    await onDelete?.(deleteConfirm);
    setDeleteConfirm(null);
    onClose();
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
                {formatMessageTime(item.createdAt)}
              </span>
              <span style={{ fontSize: 10, color: "var(--text-dim)" }}>·</span>
              <span style={{ fontSize: 10, color: "var(--text-dim)" }}>
                {timeLeft(item.expiresAt)}
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

        {isMine && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px 12px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              cursor: item.viewers?.length > 0 ? "pointer" : "default",
            }}
            onClick={() => item.viewers?.length >= 0 && setShowViewers(true)}
          >
            <EyeOutlined style={{ fontSize: 13, color: "var(--text-dim)" }} />
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
              {item.viewers?.length ?? 0} view
              {item.viewers?.length !== 1 ? "s" : ""}
            </span>
            {item.viewers?.length > 0 && (
              <span
                style={{
                  fontSize: 11,
                  color: "var(--primary-color)",
                  marginLeft: "auto",
                }}
              >
                See all ›
              </span>
            )}
          </div>
        )}
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
      {/* ── Viewers list modal ───────────────────────────────────── */}
      <Modal
        open={showViewers}
        onCancel={() => setShowViewers(false)}
        footer={null}
        zIndex={3100}
        width={420}
        title={
          <span
            style={{
              color: "#e8e9f4",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 15,
            }}
          >
            <UsergroupAddOutlined style={{ color: "#9b93f7" }} />
            Status audience
          </span>
        }
        styles={{
          content: {
            background: "#1a1730",
            border: "0.5px solid rgba(255,255,255,0.1)",
            borderRadius: 18,
            padding: 0,
          },
          header: {
            background: "transparent",
            padding: "18px 20px 0",
            borderBottom: "none",
          },
          body: { padding: 0 },
          mask: { backdropFilter: "blur(6px)" },
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            margin: "16px 20px 0",
            padding: 4,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 10,
          }}
        >
          {["viewed", "allowed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setViewerTab(tab)}
              style={{
                flex: 1,
                padding: "8px",
                border:
                  viewerTab === tab
                    ? "0.5px solid rgba(155,147,247,0.25)"
                    : "none",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.18s",
                background:
                  viewerTab === tab ? "rgba(155,147,247,0.18)" : "transparent",
                color: viewerTab === tab ? "#c5bfff" : "#888",
              }}
            >
              {tab === "viewed"
                ? `Viewed (${viewers.length})`
                : `Allowed (${allowedUsers.length})`}
            </button>
          ))}
        </div>

        <div
          style={{
            height: "0.5px",
            background: "rgba(255,255,255,0.07)",
            margin: "14px 0 0",
          }}
        />

        <div
          style={{
            maxHeight: 300,
            overflowY: "auto",
            padding: "8px 12px 14px",
          }}
        >
          {viewerTab === "viewed" ? (
            viewers.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 36,
                  color: "#555",
                  fontSize: 13,
                }}
              >
                No views yet
              </div>
            ) : (
              viewers.map((v) => (
                <div
                  key={v.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "9px 8px",
                    borderRadius: 10,
                  }}
                >
                  <UserAvatar
                    image={v.profileImage}
                    name={v.username}
                    size={38}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#e0e1f0",
                        fontWeight: 500,
                      }}
                    >
                      {v.username}
                    </div>
                    {v.viewedAt && (
                      <div
                        style={{ fontSize: 11, color: "#666", marginTop: 2 }}
                      >
                        {formatMessageTime(v.viewedAt)}
                      </div>
                    )}
                  </div>
                  <EyeOutlined style={{ fontSize: 13, color: "#444" }} />
                </div>
              ))
            )
          ) : allowedUsers.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 36,
                color: "#555",
                fontSize: 13,
              }}
            >
              Public status
            </div>
          ) : (
            allowedUsers.map((u) => (
              <div
                key={u.userId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "9px 8px",
                  borderRadius: 10,
                }}
              >
                <UserAvatar
                  image={u.profileImage}
                  name={u.username}
                  size={38}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: 13, color: "#e0e1f0", fontWeight: 500 }}
                  >
                    {u.name || u.username}
                  </div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                    Allowed to view
                  </div>
                </div>
                <CheckOutlined style={{ fontSize: 13, color: "#4ecba8" }} />
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* ── Viewers list modal ───────────────────────────────────── */}
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
