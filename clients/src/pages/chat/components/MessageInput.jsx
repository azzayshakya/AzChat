import React, { useRef, useState, useCallback } from "react";
import { Button, Upload, message as antMsg } from "antd";
import {
  SendOutlined,
  PaperClipOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { features } from "../../../utils/features";
import { api } from "../../../api";
import FormattingToolbar from "./FormattingToolbar";
import GifPicker from "./GifPicker";
import EmojiPicker from "./EmojiPicker";
import { QUICK_EMOJIS } from "../../../data/emojiData";

export default function MessageInput({
  value,
  onChange,
  onSend,
  sending,
  placeholder = "Type a message...",
  selectedId,
  isGroup,
  onFileSent,
}) {
  const [uploading, setUploading] = useState(false);
  const [activeFormats, setActiveFormats] = useState([]);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  // Track cursor position so we insert emoji at the right spot
  const cursorPosRef = useRef(null);

  // ── Cursor tracking ────────────────────────────────────────────────────────
  const saveCursor = useCallback(() => {
    const el = textareaRef.current;
    if (el) cursorPosRef.current = el.selectionStart;
  }, []);

  // ── Emoji insert ───────────────────────────────────────────────────────────
  const insertEmoji = useCallback(
    (emoji) => {
      const el = textareaRef.current;
      // Use saved cursor or fall back to end of string
      const pos =
        cursorPosRef.current !== null ? cursorPosRef.current : value.length;
      const newText = value.slice(0, pos) + emoji + value.slice(pos);
      onChange(newText);
      // Move cursor after inserted emoji
      const newPos = pos + emoji.length;
      cursorPosRef.current = newPos;
      // Restore focus + cursor after state flush
      setTimeout(() => {
        if (el) {
          el.focus();
          el.setSelectionRange(newPos, newPos);
        }
      }, 0);
    },
    [value, onChange]
  );

  // Close one picker when the other opens
  const toggleEmoji = () => {
    setShowEmojiPicker((v) => !v);
    setShowGifPicker(false);
  };

  const toggleGif = () => {
    setShowGifPicker((v) => !v);
    setShowEmojiPicker(false);
  };

  // ── Formatting ─────────────────────────────────────────────────────────────
  const applyFormat = useCallback(
    (fmt) => {
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const selected = value.slice(start, end);
      let newText, newStart, newEnd;

      if (fmt.wrap) {
        const [open, close] = fmt.wrap;
        const isWrapped =
          value.slice(start - open.length, start) === open &&
          value.slice(end, end + close.length) === close;
        if (isWrapped) {
          newText =
            value.slice(0, start - open.length) +
            selected +
            value.slice(end + close.length);
          newStart = start - open.length;
          newEnd = end - open.length;
          setActiveFormats((prev) => prev.filter((k) => k !== fmt.key));
        } else {
          newText =
            value.slice(0, start) + open + selected + close + value.slice(end);
          newStart = start + open.length;
          newEnd = end + open.length;
          setActiveFormats((prev) =>
            prev.includes(fmt.key) ? prev : [...prev, fmt.key]
          );
        }
      } else if (fmt.prefix) {
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        newText =
          value.slice(0, lineStart) + fmt.prefix + value.slice(lineStart);
        newStart = start + fmt.prefix.length;
        newEnd = end + fmt.prefix.length;
      }

      onChange(newText);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(newStart, newEnd);
      }, 0);
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        setShowEmojiPicker(false);
        setShowGifPicker(false);
        return;
      }
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        const el = textareaRef.current;
        const pos = el.selectionStart;
        onChange(value.slice(0, pos) + "\n" + value.slice(pos));
        setTimeout(() => el.setSelectionRange(pos + 1, pos + 1), 0);
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSend();
        setActiveFormats([]);
        setShowEmojiPicker(false);
        return;
      }
      if (e.key === "b" && e.ctrlKey) {
        e.preventDefault();
        applyFormat({ key: "bold", wrap: ["**", "**"] });
      }
      if (e.key === "i" && e.ctrlKey) {
        e.preventDefault();
        applyFormat({ key: "italic", wrap: ["_", "_"] });
      }
      if (e.key === "e" && e.ctrlKey) {
        e.preventDefault();
        applyFormat({ key: "code", wrap: ["`", "`"] });
      }
    },
    [value, onChange, onSend, applyFormat]
  );

  const handleSend = () => {
    onSend();
    setActiveFormats([]);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
  };

  // ── File upload ────────────────────────────────────────────────────────────
  const handleFileUpload = async (file) => {
    if (!selectedId) return false;
    if (file.size > 10 * 1024 * 1024) {
      antMsg.error("File too large. Max 10MB.");
      return false;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      if (isGroup) form.append("groupId", selectedId);
      else form.append("receiverId", selectedId);
      const { data } = await api.post("/messages/file", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onFileSent?.(data.data);
      antMsg.success("File sent");
    } catch (err) {
      antMsg.error(err?.response?.data?.error || "Failed to send file");
    } finally {
      setUploading(false);
    }
    return false;
  };

  // ── GIF send ───────────────────────────────────────────────────────────────
  const handleGifSelect = async (gif) => {
    setShowGifPicker(false);
    if (!selectedId) return;
    setUploading(true);
    try {
      const res = await fetch(gif.url);
      const blob = await res.blob();
      const file = new File([blob], gif.name, { type: "image/gif" });
      const form = new FormData();
      form.append("file", file);
      if (isGroup) form.append("groupId", selectedId);
      else form.append("receiverId", selectedId);
      const { data } = await api.post("/messages/file", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onFileSent?.(data.data);
    } catch (err) {
      antMsg.error(err?.response?.data?.error || "Failed to send GIF");
    } finally {
      setUploading(false);
    }
  };

  const anyPickerOpen = showEmojiPicker || showGifPicker;

  return (
    <div style={{ borderTop: "1px solid #1e1e3a", background: "#10101e" }}>
      {/* ── GIF Picker ────────────────────────────────────────────────────── */}
      {showGifPicker && (
        <GifPicker
          onSelect={handleGifSelect}
          onClose={() => setShowGifPicker(false)}
        />
      )}

      {/* ── Emoji Picker ──────────────────────────────────────────────────── */}
      {showEmojiPicker && (
        <EmojiPicker
          onSelect={insertEmoji}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* ── Quick emoji row — always visible ──────────────────────────────── */}
      <div style={styles.quickRow}>
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => insertEmoji(emoji)}
            style={styles.quickEmoji}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
        {/* Emoji "more" button at end of quick row */}
        <button
          onClick={toggleEmoji}
          style={{
            ...styles.quickEmoji,
            fontSize: 14,
            color: showEmojiPicker ? "#a78bfa" : "#555",
            fontWeight: 700,
            letterSpacing: -1,
          }}
          title="All emojis"
        >
          {showEmojiPicker ? "▼" : "▲"}
        </button>
      </div>

      <FormattingToolbar activeFormats={activeFormats} onFormat={applyFormat} />

      {/* ── Input row ─────────────────────────────────────────────────────── */}
      <div style={styles.inputRow}>
        {/* File upload */}
        {features.fileUpload && (
          <Upload
            showUploadList={false}
            beforeUpload={handleFileUpload}
            disabled={uploading}
          >
            <Button
              icon={uploading ? <LoadingOutlined /> : <PaperClipOutlined />}
              disabled={uploading}
              style={iconBtnStyle}
            />
          </Upload>
        )}

        {/* GIF button */}
        <Button
          onClick={toggleGif}
          disabled={uploading}
          style={{
            ...iconBtnStyle,
            color: showGifPicker ? "#a78bfa" : "#667eea",
            borderColor: showGifPicker ? "#a78bfa" : "#2a2a4a",
            background: showGifPicker ? "#1e1040" : "#1a1a2e",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: 0.5,
            padding: "0 10px",
            width: "auto",
          }}
        >
          GIF
        </Button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onSelect={saveCursor}
          onBlur={saveCursor}
          onClick={saveCursor}
          placeholder={`${placeholder}  ·  Ctrl+Enter to send`}
          rows={1}
          style={styles.textarea}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
          }}
        />

        {/* Send */}
        <Button
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={sending}
          disabled={!value.trim() || sending}
          style={styles.sendBtn}
        />
      </div>

      {/* <div style={styles.hint}>
        Ctrl+B bold · Ctrl+I italic · Ctrl+E code · Enter new line · Ctrl+Enter
        send
      </div> */}
    </div>
  );
}

const iconBtnStyle = {
  background: "#1a1a2e",
  border: "1px solid #2a2a4a",
  color: "#667eea",
  borderRadius: 10,
  height: 44,
  width: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const styles = {
  quickRow: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    padding: "5px 12px 0",
    overflowX: "auto",
    scrollbarWidth: "none",
  },
  quickEmoji: {
    background: "none",
    border: "1px solid transparent",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 18,
    lineHeight: 1,
    padding: "3px 4px",
    transition: "background 0.1s, transform 0.1s",
    flexShrink: 0,
  },
  inputRow: {
    padding: "8px 16px 6px",
    display: "flex",
    gap: 10,
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    background: "#1a1a2e",
    border: "1px solid #2a2a4a",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    lineHeight: 1.5,
    resize: "none",
    outline: "none",
    fontFamily: "system-ui",
    minHeight: 44,
    maxHeight: 160,
    overflowY: "auto",
  },
  sendBtn: {
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    border: "none",
    height: 44,
    width: 44,
    borderRadius: 10,
    color: "#fff",
    flexShrink: 0,
  },
  hint: {
    padding: "0 16px 8px",
    fontSize: 10,
    color: "#333",
  },
};
