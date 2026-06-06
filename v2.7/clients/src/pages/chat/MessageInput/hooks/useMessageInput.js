
import { useRef, useState, useCallback } from "react";
import { message as antMsg } from "antd";
import {
  applyFormat,
  insertAtCursor,
  sanitizePaste,
  detectActiveFormats,
  FORMAT_DEFS,
} from "../utils/messageFormatting";
import { sendFile, sendGif } from "../utils/fileUpload";

/**
 * @param {object} params
 * @param {string}   params.value        Controlled textarea value
 * @param {Function} params.onChange     setState setter for value
 * @param {Function} params.onSend       Called when the user commits a send
 * @param {string}   params.selectedId
 * @param {boolean}  params.isGroup
 * @param {Function} [params.onFileSent] Called with server payload after upload
 */
export function useMessageInput({
  value,
  onChange,
  onSend,
  selectedId,
  isGroup,
  onFileSent,
}) {
  // ── UI state ──────────────────────────────────────────────────────────────
  const [uploading, setUploading] = useState(false);
  const [activeFormats, setActiveFormats] = useState([]);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const textareaRef = useRef(null);
  const cursorPosRef = useRef(null); // persists cursor across re-renders

  // ─────────────────────────────────────────────────────────────────────────
  // Cursor helpers
  // ─────────────────────────────────────────────────────────────────────────

  const saveCursor = useCallback(() => {
    const el = textareaRef.current;
    if (el) cursorPosRef.current = el.selectionStart;
  }, []);

  /** Refocus the textarea and place the cursor at `pos`. */
  const restoreCursor = useCallback((pos) => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(pos, pos);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Emoji insert
  // ─────────────────────────────────────────────────────────────────────────

  const insertEmoji = useCallback(
    (emoji) => {
      const pos = cursorPosRef.current ?? value.length;
      const { newText, newPos } = insertAtCursor(value, pos, emoji);
      onChange(newText);
      cursorPosRef.current = newPos;
      setTimeout(() => restoreCursor(newPos), 0);
    },
    [value, onChange, restoreCursor]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Picker toggles (mutually exclusive)
  // ─────────────────────────────────────────────────────────────────────────

  const toggleEmoji = useCallback(() => {
    setShowEmojiPicker((v) => !v);
    setShowGifPicker(false);
  }, []);

  const toggleGif = useCallback(() => {
    setShowGifPicker((v) => !v);
    setShowEmojiPicker(false);
  }, []);

  const closeAllPickers = useCallback(() => {
    setShowEmojiPicker(false);
    setShowGifPicker(false);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Text formatting
  // ─────────────────────────────────────────────────────────────────────────

  const handleFormat = useCallback(
    (fmt) => {
      const el = textareaRef.current;
      if (!el) return;

      const { newText, newStart, newEnd, wasActive } = applyFormat(
        value,
        el.selectionStart,
        el.selectionEnd,
        fmt
      );

      onChange(newText);

      // Keep activeFormats in sync
      setActiveFormats((prev) =>
        wasActive
          ? prev.filter((k) => k !== fmt.key)
          : prev.includes(fmt.key)
            ? prev
            : [...prev, fmt.key]
      );

      setTimeout(() => {
        if (el) {
          el.focus();
          el.setSelectionRange(newStart, newEnd);
        }
      }, 0);
    },
    [value, onChange]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Paste handler — preserves whitespace and URLs
  // ─────────────────────────────────────────────────────────────────────────

  const handlePaste = useCallback(
    (e) => {
      const raw = e.clipboardData?.getData("text");
      if (!raw) return; // let the browser handle non-text pastes

      e.preventDefault();

      const el = textareaRef.current;
      const pos = el ? el.selectionStart : value.length;
      const end = el ? el.selectionEnd : pos;

      // Replace the selected range (if any) with the sanitised paste
      const sanitised = sanitizePaste(raw);
      const newText = value.slice(0, pos) + sanitised + value.slice(end);
      const newPos = pos + sanitised.length;

      onChange(newText);
      cursorPosRef.current = newPos;
      setTimeout(() => restoreCursor(newPos), 0);
    },
    [value, onChange, restoreCursor]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Selection change → update activeFormats highlight
  // ─────────────────────────────────────────────────────────────────────────

  const handleSelect = useCallback(() => {
    saveCursor();
    const el = textareaRef.current;
    if (!el) return;
    setActiveFormats(
      detectActiveFormats(value, el.selectionStart, el.selectionEnd)
    );
  }, [value, saveCursor]);

  // ─────────────────────────────────────────────────────────────────────────
  // Keyboard shortcuts
  // ─────────────────────────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e) => {
      // Close pickers
      if (e.key === "Escape") {
        closeAllPickers();
        return;
      }

      // Ctrl+Enter → insert literal newline
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        const el = textareaRef.current;
        const pos = el.selectionStart;
        onChange(value.slice(0, pos) + "\n" + value.slice(pos));
        setTimeout(() => el.setSelectionRange(pos + 1, pos + 1), 0);
        return;
      }

      // Enter (no modifier) → send
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
        return;
      }

      // Ctrl+B / Ctrl+I / Ctrl+E → formatting
      const fmtMap = { b: "bold", i: "italic", e: "code" };
      if (e.ctrlKey && fmtMap[e.key]) {
        e.preventDefault();
        handleFormat(FORMAT_DEFS[fmtMap[e.key]]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, onChange, closeAllPickers, handleFormat]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Send
  // ─────────────────────────────────────────────────────────────────────────

  const handleSend = useCallback(() => {
    onSend();
    setActiveFormats([]);
    closeAllPickers();
  }, [onSend, closeAllPickers]);

  // ─────────────────────────────────────────────────────────────────────────
  // File upload
  // ─────────────────────────────────────────────────────────────────────────

  const handleFileUpload = useCallback(
    async (file) => {
      setUploading(true);
      try {
        const payload = await sendFile(file, selectedId, isGroup);
        onFileSent?.(payload);
        antMsg.success("File sent");
      } catch (err) {
        antMsg.error(
          err?.response?.data?.error || err?.message || "Failed to send file"
        );
      } finally {
        setUploading(false);
      }
      return false; // prevent antd's default upload behaviour
    },
    [selectedId, isGroup, onFileSent]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // GIF send
  // ─────────────────────────────────────────────────────────────────────────

  const handleGifSelect = useCallback(
    async (gif) => {
      setShowGifPicker(false);
      setUploading(true);
      try {
        const payload = await sendGif(gif, selectedId, isGroup);
        onFileSent?.(payload);
      } catch (err) {
        antMsg.error(
          err?.response?.data?.error || err?.message || "Failed to send GIF"
        );
      } finally {
        setUploading(false);
      }
    },
    [selectedId, isGroup, onFileSent]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Auto-resize textarea helper (called from onInput)
  // ─────────────────────────────────────────────────────────────────────────

  const handleTextareaInput = useCallback((e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Expose everything the component needs
  // ─────────────────────────────────────────────────────────────────────────

  return {
    // Refs
    textareaRef,

    // State
    uploading,
    activeFormats,
    showGifPicker,
    showEmojiPicker,

    // Handlers
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
  };
}
