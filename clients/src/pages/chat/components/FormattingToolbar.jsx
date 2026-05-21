// components/FormattingToolbar.jsx
import React from "react";
import {
  BoldOutlined,
  CodeOutlined,
  OrderedListOutlined,
  CheckSquareOutlined,
  ItalicOutlined,
} from "@ant-design/icons";

const FORMATS = [
  {
    key: "bold",
    icon: <BoldOutlined />,
    wrap: ["**", "**"],
    tip: "Bold (Ctrl+B)",
  },
  {
    key: "italic",
    icon: <ItalicOutlined />,
    wrap: ["_", "_"],
    tip: "Italic (Ctrl+I)",
  },
  {
    key: "code",
    icon: <CodeOutlined />,
    wrap: ["`", "`"],
    tip: "Code (Ctrl+E)",
  },
  { key: "bullet", icon: <OrderedListOutlined />, prefix: "• ", tip: "Bullet" },
  { key: "task", icon: <CheckSquareOutlined />, prefix: "[ ] ", tip: "Task" },
];

export default function FormattingToolbar({ activeFormats, onFormat }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: "6px 10px",
        borderBottom: "1px solid #1e1e3a",
        background: "#0e0e1c",
      }}
    >
      {FORMATS.map((f) => (
        <button
          key={f.key}
          title={f.tip}
          onClick={() => onFormat(f)}
          style={{
            background: activeFormats.includes(f.key)
              ? "#2a2a4a"
              : "transparent",
            border: activeFormats.includes(f.key)
              ? "1px solid #667eea"
              : "1px solid transparent",
            color: activeFormats.includes(f.key) ? "#667eea" : "#666",
            borderRadius: 6,
            width: 28,
            height: 28,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            transition: "all 0.15s",
          }}
        >
          {f.icon}
        </button>
      ))}
    </div>
  );
}
