import React, { useEffect, useRef } from 'react';
import { Spin } from 'antd';
import MessageBubble from './MessageBubble';
import UnreadDivider from './UnreadDivider';

export default function MessageList({
  messages,
  currentUserId,
  loadingMsgs,
  firstUnreadIndex,
  onMessageDeleted,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loadingMsgs) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip="Loading messages..." />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#444',
        }}
      >
        No messages yet. Say hello! 👋
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {messages.map((msg, index) => (
        <React.Fragment key={msg.id}>
          {firstUnreadIndex !== null && index === firstUnreadIndex && <UnreadDivider />}
          <MessageBubble
            message={msg}
            isMine={msg.senderId === currentUserId}
            onDeleted={onMessageDeleted}
          />
        </React.Fragment>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
