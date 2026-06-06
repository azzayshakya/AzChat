import React, { useEffect, useRef } from "react";
import { Spin } from "antd";
import UnreadDivider from "../../../../components/UnreadDivider.jsx";
import DateDividerForChat from "../../../../components/DateDividerForChat.jsx";
import MessageBubble from "../../MessageInput/components/MessageBubble.jsx";
import { isNewDayMsg } from "../../../../utils/isNewDayMsg.js";
// import MessageBubble from "../inputComponents/MessageBubble.jsx";

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
        const showDateDivider = isNewDayMsg(msg, messages[index - 1]);

        return (
          <React.Fragment key={msg.id}>
            {showDateDivider && <DateDividerForChat msg={msg} />}

            {firstUnreadIndex !== null && index === firstUnreadIndex && (
              <UnreadDivider />
            )}

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
