import React, { useEffect, useRef } from 'react';
import { Spin } from 'antd';
import MessageBubble from './MessageBubble';
import UnreadDivider from './UnreadDivider';

/**
 * MessageList
 * Scrollable container for all messages in the active conversation.
 * Automatically scrolls to the bottom whenever messages change.
 * Inserts an <UnreadDivider /> above the first unread message.
 *
 * Props:
 *  - messages         {array}       Array of message objects
 *  - currentUserId    {string}      ID of the logged-in user
 *  - loadingMsgs      {boolean}     Show loading spinner while fetching
 *  - firstUnreadIndex {number|null} Index at which to insert the divider
 */
export default function MessageList({ messages, currentUserId, loadingMsgs, firstUnreadIndex }) {
  const bottomRef = useRef(null);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loadingMsgs) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 60 }}>
        <Spin size="large" tip="Loading messages..." />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#444', marginTop: 60 }}>
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
          {/* Insert divider just before the first unread message */}
          {firstUnreadIndex !== null && index === firstUnreadIndex && <UnreadDivider />}

          <MessageBubble message={msg} isMine={msg.senderId === currentUserId} />
        </React.Fragment>
      ))}

      {/* Invisible anchor used for auto-scroll */}
      <div ref={bottomRef} />
    </div>
  );
}
