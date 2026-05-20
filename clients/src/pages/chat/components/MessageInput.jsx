import React, { useRef, useState, useCallback } from 'react';
import { Button, Upload, message as antMsg } from 'antd';
import { SendOutlined, PaperClipOutlined, LoadingOutlined } from '@ant-design/icons';
import { features } from '../../../utils/features';
import { api } from '../../../api';
import FormattingToolbar from './FormattingToolbar';

export default function MessageInput({
  value,
  onChange,
  onSend,
  sending,
  placeholder = 'Type a message...',
  selectedId,
  isGroup,
  onFileSent,
}) {
  const [uploading, setUploading] = useState(false);
  const [activeFormats, setActiveFormats] = useState([]);
  const textareaRef = useRef(null);

  // Apply wrap (bold/italic/code) or prefix (bullet/task) at cursor
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
        // Toggle: if already wrapped, remove; else wrap
        const isWrapped =
          value.slice(start - open.length, start) === open &&
          value.slice(end, end + close.length) === close;

        if (isWrapped) {
          newText =
            value.slice(0, start - open.length) + selected + value.slice(end + close.length);
          newStart = start - open.length;
          newEnd = end - open.length;
          setActiveFormats((prev) => prev.filter((k) => k !== fmt.key));
        } else {
          newText = value.slice(0, start) + open + selected + close + value.slice(end);
          newStart = start + open.length;
          newEnd = end + open.length;
          setActiveFormats((prev) => (prev.includes(fmt.key) ? prev : [...prev, fmt.key]));
        }
      } else if (fmt.prefix) {
        // Insert prefix at start of current line
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        newText = value.slice(0, lineStart) + fmt.prefix + value.slice(lineStart);
        newStart = start + fmt.prefix.length;
        newEnd = end + fmt.prefix.length;
      }

      onChange(newText);
      // Restore cursor after state update
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(newStart, newEnd);
      }, 0);
    },
    [value, onChange]
  );

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e) => {
      // Enter → new line (not send)
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const el = textareaRef.current;
        const pos = el.selectionStart;
        const newText = value.slice(0, pos) + '\n' + value.slice(pos);
        onChange(newText);
        setTimeout(() => el.setSelectionRange(pos + 1, pos + 1), 0);
        return;
      }
      // Ctrl+Enter → send
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        onSend();
        setActiveFormats([]);
        return;
      }
      // Ctrl+B → bold
      if (e.key === 'b' && e.ctrlKey) {
        e.preventDefault();
        applyFormat({ key: 'bold', wrap: ['**', '**'] });
      }
      // Ctrl+I → italic
      if (e.key === 'i' && e.ctrlKey) {
        e.preventDefault();
        applyFormat({ key: 'italic', wrap: ['_', '_'] });
      }
      // Ctrl+E → code
      if (e.key === 'e' && e.ctrlKey) {
        e.preventDefault();
        applyFormat({ key: 'code', wrap: ['`', '`'] });
      }
    },
    [value, onChange, onSend, applyFormat]
  );

  const handleSend = () => {
    onSend();
    setActiveFormats([]);
  };

  const handleFileUpload = async (file) => {
    if (!selectedId) return false;
    const MAX = 10 * 1024 * 1024;
    if (file.size > MAX) {
      antMsg.error('File too large. Max 10MB.');
      return false;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      if (isGroup) form.append('groupId', selectedId);
      else form.append('receiverId', selectedId);
      const { data } = await api.post('/messages/file', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onFileSent?.(data.data);
      antMsg.success('File sent');
    } catch (err) {
      antMsg.error(err?.response?.data?.error || 'Failed to send file');
    } finally {
      setUploading(false);
    }
    return false;
  };

  return (
    <div style={{ borderTop: '1px solid #1e1e3a', background: '#10101e' }}>
      <FormattingToolbar activeFormats={activeFormats} onFormat={applyFormat} />

      <div style={{ padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        {features.fileUpload && (
          <Upload showUploadList={false} beforeUpload={handleFileUpload} disabled={uploading}>
            <Button
              icon={uploading ? <LoadingOutlined /> : <PaperClipOutlined />}
              disabled={uploading}
              style={{
                background: '#1a1a2e',
                border: '1px solid #2a2a4a',
                color: '#667eea',
                borderRadius: 10,
                height: 44,
                width: 44,
              }}
            />
          </Upload>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`${placeholder}  ·  Ctrl+Enter to send`}
          rows={1}
          style={{
            flex: 1,
            background: '#1a1a2e',
            border: '1px solid #2a2a4a',
            color: '#fff',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 13,
            lineHeight: 1.5,
            resize: 'none',
            outline: 'none',
            fontFamily: 'system-ui',
            minHeight: 44,
            maxHeight: 160,
            overflowY: 'auto',
          }}
          onInput={(e) => {
            // Auto-grow
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
          }}
        />

        <Button
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={sending}
          disabled={!value.trim() || sending}
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            height: 44,
            width: 44,
            borderRadius: 10,
            color: '#fff',
          }}
        />
      </div>
      <div style={{ padding: '0 16px 8px', fontSize: 10, color: '#333' }}>
        Ctrl+B bold · Ctrl+I italic · Ctrl+E code · Enter new line · Ctrl+Enter send
      </div>
    </div>
  );
}
