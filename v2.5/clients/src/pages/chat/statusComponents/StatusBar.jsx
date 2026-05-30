import React, { useRef, useState } from "react";
import { Avatar, Tooltip, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import StatusViewer from "./StatusViewer.jsx";
import StatusUploader from "./StatusUploader.jsx";
import UserAvatar from "../commonComponents/UserAvatar.jsx";
import { getProfileImage } from "../../../utils/getProfileImage.js";

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
  const myStatus =
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

  const allStatus = myStatus ? [myStatus, ...statuses] : statuses;
  const handleAvatarClick = (entry, startIndex = 0) => {
    setViewing({ entry, startIndex });
  };
  console.log("azz bab", allStatus);
  const handleUploaderPost = async (formData) => {
    await onPost(formData);
    setShowUploader(false);
  };

  return (
    <>
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          paddingBottom: 10,
          paddingTop: 10,
          border: "2px red solid",
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

            {allStatus.map((status) => {
              const hasUnread = status.hasUnread;
              const isMine = status.isMine;
              const isAdmin = status.isAdmin;

              const ringStyle = isAdmin
                ? {
                    background: "var(--brand-gradient)",
                    borderRadius: "50%",
                    padding: 2.5,
                    boxShadow:
                      "0 0 0 1px var(--dark-bg-light), 0 0 8px #764ba244",
                  }
                : hasUnread
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
                  key={status.id}
                  onClick={() => handleAvatarClick(status, 0)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 5,
                    cursor: "pointer",
                    flexShrink: 0,
                    border: "2px red solid",
                  }}
                >
                  <div style={ringStyle}>
                    <UserAvatar
                      image={getProfileImage(status)}
                      name={isAdmin ? "AZ Chat" : status.username}
                      size={44}
                      avatarStyle={{
                        border: "2px solid var(--dark-bg-light)",
                      }}
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
                        // className="",
                        color: isAdmin
                          ? "red"
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
                      {isMine ? "My Status" : status.username}
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
                      {status.items.length > 1
                        ? `${status.items.length} updates`
                        : status.items.length === 1
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
