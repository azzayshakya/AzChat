import React from "react";

export default function MessageBubble({ message, isMine }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: "65%",
          padding: "9px 14px",
          borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isMine
            ? "linear-gradient(135deg, #667eea, #764ba2)"
            : "#1e1e3a",
          color: "#fff",
          fontSize: 13,
          lineHeight: 1.5,
          boxShadow: "0 2px 8px #0004",
        }}
      >
        <div>{message.text}</div>
        <div
          style={{
            fontSize: 10,
            color: isMine ? "#ccc" : "#666",
            marginTop: 4,
            textAlign: "right",
          }}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
