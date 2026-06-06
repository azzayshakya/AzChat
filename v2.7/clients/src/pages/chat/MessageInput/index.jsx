import React from "react";
import { Button, Upload } from "antd";
import {
  SendOutlined,
  PaperClipOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
// import FormattingToolbar from "../inputComponents/FormattingToolbar";
// import { features } from "../../../utils/features";
import { features } from "../../../utils/features";
import { QUICK_EMOJIS } from "../../../data/emojiData";
import FormattingToolbar from "./components/FormattingToolbar";
import GifPicker from "./components/GifPicker";
import EmojiPicker from "./components/EmojiPicker";
import { useMessageInput } from "./hooks/useMessageInput";
function QuickBar({
  activeFormats,
  onFormat,
  onInsertEmoji,
  showEmojiPicker,
  onToggleEmoji,
}) {
  return (
    <div style={styles.quickRow}>
      <FormattingToolbar activeFormats={activeFormats} onFormat={onFormat} />

      {QUICK_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onInsertEmoji(emoji)}
          style={styles.quickEmoji}
          title={emoji}
        >
          {emoji}
        </button>
      ))}

      <button
        onClick={onToggleEmoji}
        style={styles.emojiToggleBtn}
        title="All emojis"
      >
        {showEmojiPicker ? "▼" : "▲"}
      </button>
    </div>
  );
}

function GifButton({ active, disabled, onClick }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.iconBtn,
        color: active ? "#a78bfa" : "#667eea",
        borderColor: active ? "#a78bfa" : "#2a2a4a",
        background: active ? "#1e1040" : "var(--dark-bg)",
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: 0.5,
        padding: "0 10px",
        width: "auto",
      }}
    >
      GIF
    </Button>
  );
}
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
  const {
    textareaRef,
    uploading,
    activeFormats,
    showGifPicker,
    showEmojiPicker,
    saveCursor,
    insertEmoji,
    toggleEmoji,
    toggleGif,
    handleFormat,
    handlePaste,
    handleSelect,
    handleKeyDown,
    handleSend,
    handleFileUpload,
    handleGifSelect,
    handleTextareaInput,
  } = useMessageInput({
    value,
    onChange,
    onSend,
    selectedId,
    isGroup,
    onFileSent,
  });

  return (
    <div style={styles.root}>
      {showGifPicker && (
        <GifPicker onSelect={handleGifSelect} onClose={toggleGif} />
      )}

      {showEmojiPicker && (
        <EmojiPicker onSelect={insertEmoji} onClose={toggleEmoji} />
      )}

      <QuickBar
        activeFormats={activeFormats}
        onFormat={handleFormat}
        onInsertEmoji={insertEmoji}
        showEmojiPicker={showEmojiPicker}
        onToggleEmoji={toggleEmoji}
      />

      <div style={styles.inputRow}>
        {features.fileUpload && (
          <Upload
            showUploadList={false}
            beforeUpload={handleFileUpload}
            disabled={uploading}
          >
            <Button
              icon={uploading ? <LoadingOutlined /> : <PaperClipOutlined />}
              disabled={uploading}
              style={styles.iconBtn}
            />
          </Upload>
        )}

        <GifButton
          active={showGifPicker}
          disabled={uploading}
          onClick={toggleGif}
          style={{ color: "red", display: "none" }}
        />

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onSelect={handleSelect}
          onBlur={saveCursor}
          onClick={saveCursor}
          placeholder={placeholder}
          rows={1}
          style={styles.textarea}
          onInput={handleTextareaInput}
        />

        <Button
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={sending}
          disabled={!value.trim() || sending}
          style={styles.sendBtn}
        />
      </div>
    </div>
  );
}

const styles = {
  root: {
    borderTop: "1px solid #1e1e3a",
    background: "#494950",
    background: "rgba(102,126,234,0.14)",
    margin: "12px 15px 3px",
    padding: "10px 5px",
    borderRadius: "11px",
  },

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

  emojiToggleBtn: {
    background: "none",
    border: "1px solid transparent",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    color: "var(--primary-color)",
    fontWeight: 700,
    letterSpacing: -1,
    padding: "3px 4px",
    transition: "background 0.1s",
    flexShrink: 0,
  },

  inputRow: {
    padding: "8px 16px 6px",
    display: "flex",
    gap: 10,
    alignItems: "flex-end",
  },

  iconBtn: {
    background: "var(--dark-bg)",
    border: "1px solid #2a2a4a",
    color: "#667eea",
    borderRadius: 10,
    height: 44,
    width: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  textarea: {
    flex: 1,
    // background: "#09090c",
    background: "var(--dark-bg)",
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
    // Preserve whitespace & URLs in the rendered area
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
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
};
