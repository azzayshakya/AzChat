import React, { useState } from 'react';
import { Dropdown, Modal, message as antMsg } from 'antd';
import { DeleteOutlined, CheckOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { features } from '../../../utils/features';
import { api } from '../../../api';

export default function MessageBubble({ message, isMine, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  // Don't render if deleted for everyone
  if (message.deletedFor === 'everyone') {
    return (
      <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
        <div
          style={{
            padding: '8px 14px',
            borderRadius: 12,
            background: '#1a1a2e',
            color: '#555',
            fontSize: 12,
            fontStyle: 'italic',
          }}
        >
          🚫 This message was deleted
        </div>
      </div>
    );
  }

  const handleDelete = (deleteFor) => {
    Modal.confirm({
      title: deleteFor === 'everyone' ? 'Delete for everyone?' : 'Delete for me?',
      content:
        deleteFor === 'everyone' ? 'This cannot be undone.' : 'Only you will stop seeing this.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeleting(true);
        try {
          await api.delete(`/messages/${message.id}`, { data: { deleteFor } });
          onDeleted?.(message.id, deleteFor);
        } catch {
          antMsg.error('Failed to delete message');
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  // Build dropdown menu only for own messages
  const menuItems = [];
  if (isMine && features.deleteOwnMessage) {
    menuItems.push({
      key: 'me',
      label: 'Delete for me',
      icon: <DeleteOutlined />,
      onClick: () => handleDelete('me'),
    });
  }
  if (isMine && features.deleteForEveryone) {
    menuItems.push({
      key: 'everyone',
      label: 'Delete for everyone',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete('everyone'),
    });
  }

  const seenIcon = () => {
    if (!features.messageSeenStatus || !isMine) return null;
    if (message.status === 'seen')
      return <CheckCircleOutlined style={{ color: '#a78bfa', fontSize: 10 }} />;
    if (message.status === 'delivered')
      return <CheckOutlined style={{ color: '#888', fontSize: 10 }} />;
    return <CheckOutlined style={{ color: '#555', fontSize: 10 }} />;
  };

  const renderContent = () => {
    // File message
    if (message.file) {
      const { category, url, name } = message.file;
      const fullUrl = `${import.meta.env.VITE_API_URL}${url}`;

      if (category === 'image') {
        return (
          <div>
            <img
              src={fullUrl}
              alt={name}
              style={{ maxWidth: 220, borderRadius: 8, display: 'block' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {message.text && <div style={{ marginTop: 4 }}>{message.text}</div>}
          </div>
        );
      }
      // All other file types — download link
      return (
        <div>
          <a
            href={fullUrl}
            download={name}
            target="_blank"
            rel="noreferrer"
            style={{
              color: '#a78bfa',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
            }}
          >
            📎 {name}
          </a>
          {message.text && <div style={{ marginTop: 4 }}>{message.text}</div>}
        </div>
      );
    }
    return <div>{message.text}</div>;
  };

  const bubble = (
    <div
      style={{
        maxWidth: '65%',
        padding: '9px 14px',
        borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isMine ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#1e1e3a',
        color: '#fff',
        fontSize: 13,
        lineHeight: 1.5,
        boxShadow: '0 2px 8px #0004',
        opacity: deleting ? 0.5 : 1,
        cursor: menuItems.length ? 'context-menu' : 'default',
      }}
    >
      {renderContent()}
      <div
        style={{
          fontSize: 10,
          color: isMine ? '#ccc' : '#666',
          marginTop: 4,
          textAlign: 'right',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 4,
          alignItems: 'center',
        }}
      >
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        {seenIcon()}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
      {menuItems.length > 0 ? (
        <Dropdown menu={{ items: menuItems }} trigger={['contextMenu']}>
          {bubble}
        </Dropdown>
      ) : (
        bubble
      )}
    </div>
  );
}
