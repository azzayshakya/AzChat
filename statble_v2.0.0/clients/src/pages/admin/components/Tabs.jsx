import React, { useState } from "react";
import { theme } from "../../../theme";

/**
 * Tabs component
 *
 * Props:
 *   tabs: [{ key: string, label: string, icon?: ReactNode }]
 *   defaultTab?: string
 *   onChange?: (key) => void
 *   children: (activeKey) => ReactNode   — render-prop pattern
 */
export default function Tabs({ tabs, defaultTab, onChange, children }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key);

  const handleClick = (key) => {
    setActive(key);
    onChange?.(key);
  };

  return (
    <div>
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: `1px solid ${theme.border}`,
          padding: "0 24px",
          background: theme.bgPanel,
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              onClick={() => handleClick(tab.key)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "14px 20px",
                color: isActive ? theme.primary : theme.textMuted,
                fontWeight: isActive ? 700 : 400,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderBottom: isActive
                  ? `2px solid ${theme.primary}`
                  : "2px solid transparent",
                marginBottom: -1,
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              {tab.icon && <span style={{ fontSize: 16 }}>{tab.icon}</span>}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>{children(active)}</div>
    </div>
  );
}
