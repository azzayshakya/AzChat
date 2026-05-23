import React, { useState } from "react";
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
import CreateGroupModal from "./CreateGroupModal.jsx";
import { features } from "../../../utils/features.js";
import { api } from "../../../api.js";
import UserAvatar from "../UComponents/UserAvatar.jsx";

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
        background: "var(--dark-bg-light)",
        // background: "yellow",
      }}
    >
      {/* Current Logged in user header */}
      <div
        style={{
          padding: "16px 16px 12px",
          borderBottom: "1px solid #1e1e3a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <UserAvatar
            isOnline={isOnline}
            showOnlineStatus={true}
            name={currentUser.username}
            image={
              currentUser.id === "13e78680-65ca-4ed3-ab02-495ad60132a3"
                ? "/default_female_profile_pic.jpg"
                : currentUser.role === "admin"
                  ? "/developer_profile.jpg"
                  : "/default_male_profile_pic.jpg"
            }
          />

          <div>
            <div
              className={
                currentUser.role === "admin" ? "admin_text_color_main" : ""
              }
              style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}
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

      {features.groupChat && (
        <div style={{ display: "flex", borderBottom: "1px solid #1e1e3a" }}>
          <div
            style={tabStyle(tab === "chats")}
            onClick={() => setTab("chats")}
          >
            <MessageOutlined style={{ marginRight: 4 }} /> Chats
          </div>
          <div
            style={tabStyle(tab === "groups")}
            onClick={() => setTab("groups")}
          >
            <TeamOutlined style={{ marginRight: 4 }} /> Groups
          </div>
        </div>
      )}

      {tab === "chats" && (
        <div style={{ padding: "12px 12px 8px" }}>
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
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
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  onClick={() => onSelectGroup(group)}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: isSelected ? "#1e1e3a" : "transparent",
                    borderLeft: isSelected
                      ? "3px solid #764ba2"
                      : "3px solid transparent",
                    transition: "all 0.15s",
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
