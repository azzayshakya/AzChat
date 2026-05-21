import React, { useEffect, useRef } from "react";
import { Spin } from "antd";
import MessageBubble from "./MessageBubble.jsx";
import UnreadDivider from "./UnreadDivider.jsx";

export default function MessageList({
  messages,
  currentUserId,
  loadingMsgs,
  firstUnreadIndex,
  onMessageDeleted,
  isGroup,
  groupMembers,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Detect if current message belongs to a new day
  const isNewDay = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;

    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();

    return currentDate !== prevDate;
  };

  if (loadingMsgs) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" tip="Loading messages..." />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-highlight)",
        }}
      >
        {isGroup
          ? "No messages yet. Start the conversation! 👋"
          : "No messages yet. Say hello! 👋"}
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {messages.map((msg, index) => {
        const showDateDivider = isNewDay(msg, messages[index - 1]);

        return (
          <React.Fragment key={msg.id}>
            {/* Date Divider */}
            {showDateDivider && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "14px 0 10px",
                }}
              >
                <div
                  style={{
                    background: "#1a1a2e",
                    color: "var(--text-muted)",
                    fontSize: 11,
                    padding: "6px 14px",
                    borderRadius: 999,
                    border: "1px solid #2a2a4a",
                    boxShadow: "0 2px 8px #0003",
                    fontWeight: 500,
                    letterSpacing: 0.2,
                  }}
                >
                  {new Date(msg.createdAt).toLocaleDateString([], {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            )}

            {/* Unread Divider */}
            {firstUnreadIndex !== null && index === firstUnreadIndex && (
              <UnreadDivider />
            )}

            {/* Message */}
            <MessageBubble
              message={msg}
              isMine={msg.senderId === currentUserId}
              onDeleted={onMessageDeleted}
              isGroup={isGroup}
              groupMembers={groupMembers}
            />
          </React.Fragment>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
