import React, { useRef, useState } from 'react';
import { Input, Button, Upload, message as antMsg } from 'antd';
import { SendOutlined, PaperClipOutlined, LoadingOutlined } from '@ant-design/icons';
import { features } from '../../../utils/features';
import { api } from '../../../api';

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
  const uploadRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!selectedId) return false; // block antd auto-upload

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

    return false; // always prevent antd default upload
  };

  return (
    <div
      style={{
        padding: '14px 20px',
        borderTop: '1px solid #1e1e3a',
        display: 'flex',
        gap: 10,
        background: '#10101e',
        alignItems: 'center',
      }}
    >
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

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPressEnter={onSend}
        placeholder={placeholder}
        style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          color: '#fff',
          borderRadius: 10,
          height: 44,
        }}
      />

      <Button
        icon={<SendOutlined />}
        onClick={onSend}
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
  );
}
