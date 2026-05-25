/**
 * StatusUploader.jsx
 * Modal for creating a new status.
 * Supports: text only, image only, text + image.
 * Privacy: public | friends
 * Background color + text color pickers.
 * Respects VITE_STATUS_MAX_PER_USER, VITE_STATUS_MAX_TEXT_LEN, VITE_STATUS_MAX_IMAGE_MB
 */

import React, { useState, useRef } from "react";
import { Spin, message as antMsg } from "antd";
import {
  CloseOutlined,
  PictureOutlined,
  GlobalOutlined,
  UserOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { STATUS_CONFIG } from "../statusComponents/statusApi";

const BG_PRESETS = [
  { bg: "#1a1540", text: "#a78bfa" },
  { bg: "#0d1f3c", text: "#7aaee0" },
  { bg: "#0a2a1a", text: "#4caf89" },
  { bg: "#3a1c1c", text: "#e07070" },
  { bg: "#38192c", text: "#d07099" },
  { bg: "#1a1010", text: "#d4a045" },
  { bg: "#0f0f0f", text: "#ffffff" },
  { bg: "#1a0a3d", text: "#c4b5fd" },
];

export default function StatusUploader({ onClose, onPost, posting, myCount }) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [privacy, setPrivacy] = useState("public");
  const [bgColor, setBgColor] = useState(BG_PRESETS[0].bg);
  const [textColor, setTextColor] = useState(BG_PRESETS[0].text);
  const fileRef = useRef(null);

  const maxReached = myCount >= STATUS_CONFIG.maxPerUser;

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxBytes = STATUS_CONFIG.maxImageMb * 1024 * 1024;
    if (file.size > maxBytes) {
      antMsg.error(`Image must be under ${STATUS_CONFIG.maxImageMb}MB`);
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const selectPreset = (preset) => {
    setBgColor(preset.bg);
    setTextColor(preset.text);
  };

  const handleSubmit = async () => {
    if (!text.trim() && !imageFile) {
      antMsg.warning("Add some text or an image to post a status.");
      return;
    }
    if (maxReached) {
      antMsg.error(
        `You can only have ${STATUS_CONFIG.maxPerUser} statuses at a time. Delete one first.`
      );
      return;
    }
    const fd = new FormData();
    if (text.trim()) fd.append("text", text.trim());
    if (imageFile) fd.append("imageFile", imageFile);
    fd.append("privacy", privacy);
    fd.append("backgroundColor", bgColor);
    fd.append("textColor", textColor);
    try {
      await onPost(fd);
      antMsg.success("Status posted!");
    } catch (err) {
      antMsg.error(err.message || "Failed to post status");
    }
  };

  return (
    <div
      style={overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={modal}>
        {/* Header */}
        <div style={header}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-white)",
            }}
          >
            New Status
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
              {myCount}/{STATUS_CONFIG.maxPerUser} used
            </span>
            <button onClick={onClose} style={iconBtn}>
              <CloseOutlined
                style={{ fontSize: 13, color: "var(--text-dim)" }}
              />
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div
          style={{
            margin: "0 14px",
            borderRadius: 14,
            background: bgColor,
            minHeight: 180,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {imagePreview && (
            <>
              <img
                src={imagePreview}
                alt="preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: 180,
                  objectFit: "cover",
                  borderRadius: 12,
                  width: "100%",
                }}
              />
              <button
                onClick={removeImage}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(0,0,0,0.6)",
                  border: "none",
                  borderRadius: "50%",
                  width: 26,
                  height: 26,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DeleteOutlined style={{ color: "#fff", fontSize: 12 }} />
              </button>
            </>
          )}
          {text && (
            <div
              style={{
                position: imagePreview ? "absolute" : "relative",
                bottom: imagePreview ? 10 : "auto",
                left: imagePreview ? 10 : "auto",
                right: imagePreview ? 10 : "auto",
                background: imagePreview ? "rgba(0,0,0,0.55)" : "transparent",
                color: textColor,
                fontSize: imagePreview ? 12 : 17,
                fontWeight: 500,
                padding: imagePreview ? "6px 10px" : "20px 16px",
                borderRadius: 8,
                textAlign: "center",
                backdropFilter: imagePreview ? "blur(3px)" : "none",
                wordBreak: "break-word",
                maxWidth: "90%",
              }}
            >
              {text}
            </div>
          )}
          {!text && !imagePreview && (
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
              Preview
            </span>
          )}
        </div>

        {/* Text input */}
        <div style={{ padding: "12px 14px 0" }}>
          <textarea
            value={text}
            onChange={(e) =>
              setText(e.target.value.slice(0, STATUS_CONFIG.maxTextLen))
            }
            placeholder="What's on your mind?"
            rows={2}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: "9px 12px",
              color: "var(--text-white)",
              fontSize: 13,
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
              lineHeight: 1.5,
            }}
          />
          <div
            style={{
              textAlign: "right",
              fontSize: 10,
              color: "var(--text-dim)",
              marginTop: 3,
            }}
          >
            {text.length}/{STATUS_CONFIG.maxTextLen}
          </div>
        </div>

        {/* Color presets */}
        <div style={{ padding: "6px 14px 0" }}>
          <div
            style={{
              fontSize: 10,
              color: "var(--text-dim)",
              marginBottom: 7,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Background
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {BG_PRESETS.map((p) => (
              <button
                key={p.bg}
                onClick={() => selectPreset(p)}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: p.bg,
                  border:
                    bgColor === p.bg
                      ? "2px solid var(--primary-color)"
                      : "2px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "border-color 0.15s",
                }}
                title={p.bg}
              />
            ))}
            {/* Custom bg */}
            <label
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                border: "2px dashed rgba(255,255,255,0.2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                color: "var(--text-dim)",
                position: "relative",
              }}
              title="Custom color"
            >
              +
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{
                  position: "absolute",
                  opacity: 0,
                  width: 0,
                  height: 0,
                }}
              />
            </label>
          </div>
        </div>

        {/* Privacy + image upload row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px 0",
          }}
        >
          {/* Privacy toggle */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.07)",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {[
              { val: "public", icon: <GlobalOutlined />, label: "Public" },
              { val: "friends", icon: <UserOutlined />, label: "Friends" },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => setPrivacy(opt.val)}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  background:
                    privacy === opt.val
                      ? "rgba(102,126,234,0.2)"
                      : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color:
                    privacy === opt.val
                      ? "var(--primary-color)"
                      : "var(--text-dim)",
                  fontSize: 11,
                  fontWeight: privacy === opt.val ? 600 : 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>

          {/* Image upload */}
          <label
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: imageFile
                ? "rgba(102,126,234,0.2)"
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${imageFile ? "var(--primary-color)" : "rgba(255,255,255,0.08)"}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
            title="Add image"
          >
            <PictureOutlined
              style={{
                fontSize: 16,
                color: imageFile ? "var(--primary-color)" : "var(--text-dim)",
              }}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImagePick}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {/* Post button */}
        <div style={{ padding: "12px 14px 16px" }}>
          <button
            onClick={handleSubmit}
            disabled={posting || maxReached || (!text.trim() && !imageFile)}
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: 12,
              background:
                posting || maxReached || (!text.trim() && !imageFile)
                  ? "rgba(255,255,255,0.05)"
                  : "var(--brand-gradient)",
              border: "none",
              color:
                posting || maxReached || (!text.trim() && !imageFile)
                  ? "var(--text-dim)"
                  : "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor:
                posting || maxReached || (!text.trim() && !imageFile)
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "opacity 0.15s",
              fontFamily: "inherit",
            }}
          >
            {posting ? <Spin size="small" /> : null}
            {maxReached
              ? `Max ${STATUS_CONFIG.maxPerUser} statuses reached`
              : posting
                ? "Posting…"
                : "Post Status"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 2000,
  background: "rgba(0,0,0,0.75)",
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
  maxHeight: "92vh",
  overflowY: "auto",
};

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 14px 12px",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
};

const iconBtn = {
  width: 28,
  height: 28,
  borderRadius: 8,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
