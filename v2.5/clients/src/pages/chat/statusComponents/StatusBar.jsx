/**
 * StatusBar.jsx
 * Horizontal scrollable row of status avatars shown above the search bar
 * in ChatSidebar. Includes the "+ Add status" pill for the current user.
 */

import React, { useRef, useState } from "react";
import { Avatar, Tooltip, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import StatusViewer from "./StatusViewer.jsx";
import StatusUploader from "./StatusUploader.jsx";

export default function StatusBar({
  statuses, // array from useStatus
  myStatuses, // current user's own status items
  loading,
  currentUser,
  deleting,
  replying,
  onView,
  onDelete,
  onReply,
  onPost,
  posting,
}) {
  const scrollRef = useRef(null);
  const [viewing, setViewing] = useState(null); // { entry, startIndex }
  const [showUploader, setShowUploader] = useState(false);

  // Merge my statuses at the front as a special "My Status" entry
  const myEntry =
    myStatuses.length > 0
      ? {
          id: "mine",
          userId: currentUser?.id,
          username: "My Status",
          role: currentUser?.role,
          avatar:
            currentUser?.role === "admin" ? "/developer_profile.jpg" : null,
          items: myStatuses,
          hasUnread: false,
          isMine: true,
          isAdmin: currentUser?.role === "admin",
        }
      : null;

  const allEntries = myEntry ? [myEntry, ...statuses] : statuses;

  const handleAvatarClick = (entry, startIndex = 0) => {
    setViewing({ entry, startIndex });
  };

  const handleUploaderPost = async (formData) => {
    await onPost(formData);
    setShowUploader(false);
  };

  // Initials helper
  const initials = (name) =>
    name
      ?.split(/[\s_]/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  const AVATAR_COLORS = [
    "#2e2860",
    "#163a30",
    "#3a1c1c",
    "#162040",
    "#38192c",
    "#1a3020",
    "#382610",
  ];
  const colorFor = (id) =>
    AVATAR_COLORS[
      (id?.split("").reduce((a, c) => a + c.charCodeAt(0), 0) ?? 0) %
        AVATAR_COLORS.length
    ];

  return (
    <>
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          paddingBottom: 10,
          paddingTop: 10,
        }}
      >
        {/* Section label */}
        <div
          style={{
            fontSize: 10,
            color: "var(--text-dim)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "0 14px 8px",
            fontWeight: 600,
          }}
        >
          Status
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <Spin size="small" />
          </div>
        ) : (
          <div
            ref={scrollRef}
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              padding: "0 14px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              alignItems: "flex-start",
            }}
            className="status-scroll"
          >
            {/* Add Status button (always first) */}
            <div
              onClick={() => setShowUploader(true)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: "var(--dark-bg-light)",
                  border: "2px dashed #444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "border-color 0.2s",
                  position: "relative",
                }}
                className="status-add-btn"
              >
                {/* Small + badge */}
                <PlusOutlined
                  style={{ color: "var(--primary-color)", fontSize: 18 }}
                />
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: "var(--text-dim)",
                  textAlign: "center",
                  width: 52,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Add
              </span>
            </div>

            {/* Status entries */}
            {allEntries.map((entry) => {
              const hasUnread = entry.hasUnread;
              const isMine = entry.isMine;
              const isAdmin = entry.isAdmin;

              // Ring color
              const ringColor = isAdmin
                ? "var(--brand-gradient)"
                : hasUnread
                  ? "var(--primary-color)"
                  : "#333";

              const ringStyle =
                hasUnread || isAdmin
                  ? {
                      background: isAdmin
                        ? "var(--brand-gradient)"
                        : "var(--primary-color)",
                      borderRadius: "50%",
                      padding: 2.5,
                    }
                  : {
                      background: "#333",
                      borderRadius: "50%",
                      padding: 2.5,
                    };

              return (
                <div
                  key={entry.id}
                  onClick={() => handleAvatarClick(entry, 0)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 5,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {/* Glowing ring + avatar */}
                  <div
                    style={{
                      ...ringStyle,
                      boxShadow:
                        hasUnread || isAdmin
                          ? `0 0 0 1px var(--dark-bg-light), 0 0 8px ${isAdmin ? "#764ba2" : "var(--primary-color)"}44`
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        overflow: "hidden",
                        background: colorFor(entry.userId),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid var(--dark-bg-light)",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#fff",
                        userSelect: "none",
                      }}
                    >
                      {entry.avatar ? (
                        <img
                          src={entry.avatar}
                          alt={entry.username}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        initials(isAdmin ? "AZ Chat" : entry.username)
                      )}
                    </div>
                  </div>

                  {/* Username */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        color: isAdmin
                          ? "var(--accent-light)"
                          : isMine
                            ? "var(--text-highlight)"
                            : hasUnread
                              ? "var(--text-white)"
                              : "var(--text-dim)",
                        textAlign: "center",
                        width: 52,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: hasUnread ? 600 : 400,
                      }}
                    >
                      {isMine ? "My Status" : entry.username}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        color: "var(--text-dim)",
                        textAlign: "center",
                        width: 52,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {entry.items.length > 1
                        ? `${entry.items.length} updates`
                        : entry.items.length === 1
                          ? "1 update"
                          : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Viewer Modal */}
      {viewing && (
        <StatusViewer
          entry={viewing.entry}
          startIndex={viewing.startIndex}
          currentUser={currentUser}
          onClose={() => setViewing(null)}
          onDelete={onDelete}
          onReply={onReply}
          onView={onView}
          deleting={deleting}
          replying={replying}
        />
      )}

      {/* Status Uploader Modal */}
      {showUploader && (
        <StatusUploader
          onClose={() => setShowUploader(false)}
          onPost={handleUploaderPost}
          posting={posting}
          myCount={myStatuses.length}
        />
      )}

      <style>{`
        .status-scroll::-webkit-scrollbar { display: none; }
        .status-add-btn:hover { border-color: var(--primary-color) !important; }
      `}</style>
    </>
  );
}
