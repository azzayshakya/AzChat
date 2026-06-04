import React, { useEffect, useRef, useState } from "react";
import { Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import StatusUploader from "./components/StatusUploader.jsx";
import UserAvatar from "../commonComponents/UserAvatar.jsx";
import { getProfileImage } from "../../../utils/getProfileImage.js";
import StatusViewer from "./components/StatusViewer.jsx";

export default function StatusBar({
  statuses,
  myStatuses,
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
  const [viewing, setViewing] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const myEntry =
    myStatuses.length > 0
      ? {
          id: "mine",
          userId: currentUser?.id,
          username: currentUser?.username ?? "My Status",
          avatar:
            currentUser?.role === "admin" ? "/developer_profile.jpg" : null,
          hasUnread: false,
          isMine: true,
          isAdmin: currentUser?.role === "admin",
          items: myStatuses,
        }
      : null;

  const feedWithoutMe = statuses.filter((s) => s.userId !== currentUser?.id);
  const allEntries = myEntry ? [myEntry, ...feedWithoutMe] : feedWithoutMe;

  const handleAvatarClick = (entry, startIndex = 0) => {
    setViewing({ entry, startIndex });
  };

  const handleUploaderPost = async (formData) => {
    await onPost(formData);
    setShowUploader(false);
  };
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      el.scrollLeft += e.deltaY + e.deltaX;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);
  return (
    <>
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          // paddingBottom: 10,
          paddingTop: 10,
          // margin: "10px",
          border: "2px rgba(255,255,255,0.05) solid",
          background: "rgba(102,126,234,0.14)",
          margin: "12px 15px",
          borderRadius: 11,
        }}
      >
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
              flexDirection: "row",
              gap: 12,
              overflowX: "auto",
              overflowY: "hidden",
              padding: "4px 14px 8px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              alignItems: "flex-start",
              width: "100%",
              boxSizing: "border-box",
              cursor: "grab",
            }}
            className="status-scroll"
          >
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
                }}
                className="status-add-btn"
              >
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

            {allEntries.map((entry) => {
              const { hasUnread, isMine, isAdmin } = entry;

              // Ring priority:
              // 1. Admin → brand gradient ring (always)
              // 2. hasUnread=true (someone else's unseen status) → primary color ring
              // 3. isMine or all seen → subtle gray ring
              const ringStyle = isAdmin
                ? {
                    background: "var(--brand-gradient)",
                    borderRadius: "50%",
                    padding: 2.5,
                    boxShadow:
                      "0 0 0 1px var(--dark-bg-light), 0 0 8px #764ba244",
                  }
                : hasUnread && !isMine
                  ? {
                      background: "var(--primary-color)",
                      borderRadius: "50%",
                      padding: 2.5,
                      boxShadow:
                        "0 0 0 1px var(--dark-bg-light), 0 0 8px var(--primary-color)",
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
                  <div style={{ ...ringStyle, flexShrink: 0 }}>
                    <UserAvatar
                      image={getProfileImage(entry)}
                      name={entry.username}
                      size={44}
                      avatarStyle={{ border: "2px solid var(--dark-bg-light)" }}
                    />
                  </div>

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
                        fontWeight: hasUnread && !isMine ? 600 : 400,
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
  .status-scroll { -webkit-overflow-scrolling: touch; }
  .status-scroll:active { cursor: grabbing; }
  .status-add-btn:hover { border-color: var(--primary-color) !important; }
`}</style>
    </>
  );
}
