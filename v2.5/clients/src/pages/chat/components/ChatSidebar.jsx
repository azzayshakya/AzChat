import {
  Input,
  Spin,
  Empty,
  Avatar,
  Dropdown,
  Button,
  message as antMsg,
} from "antd";
import {
  SearchOutlined,
  WifiOutlined,
  UserOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  TeamOutlined,
  PlusOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import ContactItem from "./ContactItem.jsx";
import StatusBar from "../statusComponents/StatusBar.jsx";
import { useStatus } from "../statusComponents/useStatus.js";
import { features } from "../../../utils/features.js";
import { api } from "../../../api.js";
import { useState } from "react";
import UserAvatar from "../commonComponents/UserAvatar.jsx";
import CreateGroupModal from "../modals/Creategroupmodal.jsx";
import { getProfileImage } from "../../../utils/getProfileImage.js";

export default function ChatSidebar({
  currentUser,
  contacts,
  setContacts,
  groups,
  setGroups,
  searchResults,
  searchQ,
  onSearch,
  searching,
  loadingContacts,
  loadingGroups,
  selectedId,
  selectedType,
  onlineUsers,
  onSelectContact,
  onSelectGroup,
}) {
  const [tab, setTab] = useState("chats");
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  // ── Status hook ──────────────────────────────────────────────────────────
  const {
    statuses,
    myStatuses,
    loading: statusLoading,
    posting,
    deleting,
    replying,
    handlePost,
    handleDelete,
    handleReply,
    handleView,
  } = useStatus(currentUser);

  const isOnline = (id) => onlineUsers.includes(id);

  const sortedContacts = searchQ
    ? searchResults
    : [...contacts].sort((a, b) => {
        const tA = a.lastMessage
          ? new Date(a.lastMessage.createdAt).getTime()
          : 0;
        const tB = b.lastMessage
          ? new Date(b.lastMessage.createdAt).getTime()
          : 0;
        return tB - tA;
      });

  const handleDeleteContact = async (contactId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/contacts/${contactId}`);
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      antMsg.success("Chat cleared");
    } catch {
      antMsg.error("Failed to clear chat");
    }
  };

  const handleDeleteGroup = async (groupId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/groups/${groupId}`);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      antMsg.success("Group deleted");
    } catch (err) {
      antMsg.error(err?.response?.data?.error || "Failed to delete group");
    }
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: "8px 0",
    textAlign: "center",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    color: active ? "#a78bfa" : "var(--text-highlight)",
    borderBottom: active ? "2px solid #667eea" : "2px solid transparent",
    transition: "all 0.15s",
  });

  return (
    <div
      style={{
        width: 300,
        borderRight: "1px solid #1e1e3a",
        display: "flex",
        flexDirection: "column",
        background: "#10101e",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      <div
        style={{
          padding: "16px 16px 12px",
          borderBottom: "1px solid #1e1e3a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          // border: "2px red solid",
          background: "rgba(102,126,234,0.14)",
          margin: "12px 15px 3px",
          borderRadius: 11,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <UserAvatar
            name={currentUser.username}
            size={40}
            image={getProfileImage(currentUser)}
          />
          <div>
            <div
              className={
                currentUser.role === "admin" ? "admin_text_color_main" : ""
              }
              style={{ color: "#fff", fontWeight: 600, fontSize: "1rem" }}
            >
              {currentUser.username}
            </div>
            <div
              style={{
                color: "#667eea",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <WifiOutlined /> LAN
            </div>
          </div>
        </div>
        {features.groupChat && (
          <Button
            icon={<PlusOutlined />}
            size="small"
            onClick={() => setShowCreateGroup(true)}
            title="Create Group"
            style={{
              background: "#1a1a2e",
              border: "1px solid #2a2a4a",
              color: "#667eea",
              borderRadius: 8,
            }}
          />
        )}
      </div>

      {/* ── Status bar (above search) ───────────────────────────────────── */}
      <div style={{ flexShrink: 0 }}>
        <StatusBar
          statuses={statuses}
          myStatuses={myStatuses}
          loading={statusLoading}
          currentUser={currentUser}
          deleting={deleting}
          replying={replying}
          posting={posting}
          onView={handleView}
          onDelete={handleDelete}
          onReply={handleReply}
          onPost={handlePost}
        />
      </div>

      {features.groupChat && (
        <div
          style={{
            display: "flex",
            margin: "10px 12px 8px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 10,
            padding: 3,
            gap: 3,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {[
            { key: "chats", icon: <MessageOutlined />, label: "Chats" },
            { key: "groups", icon: <TeamOutlined />, label: "Groups" },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                padding: "6px 0",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: tab === key ? 600 : 400,
                cursor: "pointer",
                border: "none",
                fontFamily: "inherit",
                transition: "all 0.15s",

                background:
                  tab === key ? "var(--primary-color)" : "transparent",
                color: tab === key ? "white" : "var(--text-muted)",
                boxShadow: tab === key ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      )}

      {tab === "chats" && (
        <div style={{ padding: "12px 12px 8px", flexShrink: 0 }}>
          <Input
            className="search-input"
            prefix={
              searching ? (
                <Spin size="small" />
              ) : (
                <SearchOutlined style={{ color: "var(--text-highlight)" }} />
              )
            }
            placeholder="Search users..."
            value={searchQ}
            onChange={(e) => onSearch(e.target.value)}
            style={{
              background: "#1a1a2e",
              border: "1px solid #2a2a4a",
              color: "#fff",
              borderRadius: 8,
            }}
            allowClear
          />
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "chats" ? (
          loadingContacts && !searchQ ? (
            <div style={{ textAlign: "center", paddingTop: 40 }}>
              <Spin />
            </div>
          ) : sortedContacts.length === 0 ? (
            <Empty
              description={
                <span style={{ color: "var(--text-highlight)" }}>
                  {searchQ ? "No users found" : "No chats yet"}
                </span>
              }
              style={{ paddingTop: 40 }}
            />
          ) : (
            sortedContacts.map((contact) => {
              const menuItems =
                features.deleteContact && !searchQ
                  ? [
                      {
                        key: "delete",
                        label: "Clear chat",
                        icon: <DeleteOutlined />,
                        danger: true,
                        onClick: (e) => handleDeleteContact(contact.id, e),
                      },
                    ]
                  : [];

              return (
                <div
                  key={contact.id}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <div style={{ flex: 1 }}>
                    <ContactItem
                      contact={contact}
                      isSelected={
                        selectedType === "direct" && selectedId === contact.id
                      }
                      isOnline={isOnline(contact.id)}
                      onClick={() => onSelectContact(contact)}
                    />
                  </div>
                  {menuItems.length > 0 && (
                    <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                      <EllipsisOutlined
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          color: "#555",
                          padding: "0 10px",
                          cursor: "pointer",
                          fontSize: 16,
                        }}
                      />
                    </Dropdown>
                  )}
                </div>
              );
            })
          )
        ) : loadingGroups ? (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <Spin />
          </div>
        ) : groups.length === 0 ? (
          <Empty
            description={<span style={{ color: "#555" }}>No groups yet</span>}
            style={{ paddingTop: 40 }}
          >
            <Button
              onClick={() => setShowCreateGroup(true)}
              style={{
                background: "#667eea",
                border: "none",
                color: "#fff",
                borderRadius: 8,
              }}
            >
              Create your first group
            </Button>
          </Empty>
        ) : (
          groups.map((group) => {
            const isSelected =
              selectedType === "group" && selectedId === group.id;
            const myRole = group.members?.find(
              (m) => m.id === currentUser.id
            )?.role;
            const canDelete = myRole === "owner";

            const menuItems = canDelete
              ? [
                  {
                    key: "delete",
                    label: "Delete group",
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: (e) => handleDeleteGroup(group.id, e),
                  },
                ]
              : [];

            return (
              <div
                key={group.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  // border: "2px blue solid",
                  // gap: 10,
                  // padding: "8px 10px",
                  margin: "10px 15px",
                  borderRadius: 11,
                  cursor: "pointer",
                  transition: "background 0.12s",
                  background: isSelected
                    ? "transparent"
                    : "rgba(102,126,234,0.14)",
                  outline: isSelected
                    ? "rgb(102 126 234 / 90%) solid 2px"
                    : "none",
                }}
              >
                <div
                  onClick={() => onSelectGroup(group)}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    // cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    // background: isSelected ? "#1e1e3a" : "transparent",
                    // borderLeft: isSelected
                    //   ? "3px solid #764ba2"
                    //   : "3px solid transparent",
                    // transition: "all 0.15s",
                  }}
                >
                  <Avatar
                    style={{ background: "#764ba2", flexShrink: 0 }}
                    icon={<TeamOutlined />}
                  />
                  <div style={{ overflow: "hidden", flex: 1 }}>
                    <div
                      style={{ color: "#fff", fontWeight: 500, fontSize: 13 }}
                    >
                      {group.name}
                    </div>
                    <div style={{ color: "#666", fontSize: 11 }}>
                      {group.members?.length || 0} members
                    </div>
                  </div>
                </div>
                {menuItems.length > 0 && (
                  <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                    <EllipsisOutlined
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        color: "#555",
                        padding: "0 10px",
                        cursor: "pointer",
                        fontSize: 16,
                      }}
                    />
                  </Dropdown>
                )}
              </div>
            );
          })
        )}
      </div>

      <CreateGroupModal
        open={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreated={(g) => setGroups((prev) => [...prev, g])}
      />
    </div>
  );
}
