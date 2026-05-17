import React from "react";
import { Input, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";

/**
 * MessageInput
 * The bottom bar with a text field and send button.
 *
 * Props:
 *  - value       {string}  Current input value (controlled)
 *  - onChange    {fn}      Called with the new string on every keystroke
 *  - onSend      {fn}      Called when Enter is pressed or Send is clicked
 *  - sending     {boolean} Shows a loading state on the send button
 *  - placeholder {string}  Placeholder text (e.g. "Message Alice...")
 */
export default function MessageInput({
  value,
  onChange,
  onSend,
  sending,
  placeholder = "Type a message...",
}) {
  return (
    <div
      style={{
        padding: "14px 20px",
        borderTop: "1px solid #1e1e3a",
        display: "flex",
        gap: 10,
        background: "#10101e",
      }}
    >
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPressEnter={onSend}
        placeholder={placeholder}
        style={{
          background: "#1a1a2e",
          border: "1px solid #2a2a4a",
          color: "#fff",
          borderRadius: 10,
          height: 44,
        }}
      />

      <Button
        icon={<SendOutlined />}
        onClick={onSend}
        loading={sending}
        disabled={!value.trim()}
        style={{
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          border: "none",
          height: 44,
          width: 44,
          borderRadius: 10,
          color: "#fff",
        }}
      />
    </div>
  );
}
