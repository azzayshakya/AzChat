import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Input,
  Button,
  Avatar,
  Spin,
  Badge,
  Empty,
  message as antMsg,
} from "antd";
import {
  SendOutlined,
  SearchOutlined,
  WifiOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { api, getSocket } from "../api";
import Navbar from "../components/Navbar.jsx";
import { useNotification } from "../hooks/useNotification";

export default function Chat() {
  const { user, logout, checkAdmin } = useAuth();
  const nav = useNavigate();
  const socket = getSocket();

  const [contacts, setContacts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQ, setSearchQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [searching, setSearching] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [firstUnreadIndex, setFirstUnreadIndex] = useState(null);
  const bottomRef = useRef(null);
  const searchTimer = useRef(null);
  const selectedRef = useRef(null);

  const { notify } = useNotification();

  const isAdmin = user?.role === "admin";
  useEffect(() => {
    if (!socket || !user?.id) return;

    const onConnect = () => socket.emit("register", user.id);
    const onDisconnect = () => {};
    const onOnlineUsers = (users) => setOnlineUsers(users);

    const onNewMessage = (msg) => {
      fetchContacts();
      const current = selectedRef.current;

      // ✅ notify is now actually called here
      if (msg.from !== user.id) {
        const senderName =
          contacts.find((c) => c.id === msg.from)?.username ||
          current?.username ||
          "Someone";

        notify({
          title: `💬 ${senderName}`,
          body: msg.text.length > 60 ? msg.text.slice(0, 60) + "…" : msg.text,
        });
      }

      setMessages((prev) => {
        if (!current) return prev;
        const isCurrentChat =
          (msg.from === current.id && msg.to === user.id) ||
          (msg.from === user.id && msg.to === current.id);
        if (!isCurrentChat) return prev;
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("online_users", onOnlineUsers);
    socket.on("new_message", onNewMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("online_users", onOnlineUsers);
      socket.off("new_message", onNewMessage);
    };
  }, [socket, user.id, notify]); // ✅ add notify to deps

  const fetchContacts = useCallback(async () => {
    try {
      const { data } = await api.get(`/contacts`);
      setContacts(data);
    } catch (err) {
      console.error("Contacts error:", err);
    } finally {
      setLoadingContacts(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── NEW: mark messages read & compute firstUnreadIndex ───────────────
  const markAsRead = useCallback(
    async (partnerId) => {
      try {
        await api.patch("/messages/read", {
          userId: user.id,
          fromId: partnerId,
        });
        fetchContacts(); // clear the badge
      } catch (err) {
        console.error("Mark read error:", err);
      }
    },
    [user.id, fetchContacts]
  );

  const loadMessages = async (partner) => {
    setSelected(partner);
    setLoadingMsgs(true);
    setMessages([]);
    setFirstUnreadIndex(null);
    try {
      const { data } = await api.get(`/messages/${user.id}/${partner.id}`);

      // Find where unread messages begin (messages FROM partner, unread)
      const firstUnread = data.findIndex(
        (m) => m.from === partner.id && m.to === user.id && !m.isRead
      );
      setFirstUnreadIndex(firstUnread >= 0 ? firstUnread : null);
      setMessages(data);

      // Mark them all read now that the chat is open
      if (firstUnread >= 0) {
        markAsRead(partner.id);
      }
    } catch {
      antMsg.error("Failed to load messages");
    } finally {
      setLoadingMsgs(false);
    }
  };

  const handleSearch = (val) => {
    setSearchQ(val);
    clearTimeout(searchTimer.current);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const { data } = await api.get(
          `/users/search?q=${val}&exclude=${user.id}`
        );
        setSearchResults(data);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const sendMessage = () => {
    if (!text.trim() || !selected) return;
    socket.emit("send_message", {
      from: user.id,
      to: selected.id,
      text: text.trim(),
    });
    setText("");
    // clear unread divider after we send something — we're clearly "here"
    setFirstUnreadIndex(null);
  };

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const getSortedDisplayList = () => {
    if (searchQ) return searchResults;
    return [...contacts].sort((a, b) => {
      const timeA = a.lastAt ? new Date(a.lastAt).getTime() : 0;
      const timeB = b.lastAt ? new Date(b.lastAt).getTime() : 0;
      return timeB - timeA;
    });
  };

  const displayList = getSortedDisplayList();
  const isOnline = (id) => onlineUsers.includes(id);

  return (
    <>
      <Navbar />
      <div
        style={{
          display: "flex",
          height: "93vh",
          background: "#0d0d1a",
          fontFamily: "system-ui",
        }}
      >
        {/* ── LEFT PANEL ─────────────────────────────────────────── */}
        <div
          style={{
            width: 300,
            borderRight: "1px solid #1e1e3a",
            display: "flex",
            flexDirection: "column",
            background: "#10101e",
          }}
        >
          {/* Header */}
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
              <Avatar
                style={{ background: "#667eea" }}
                icon={<UserOutlined />}
              />
              <div>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>
                  {user.username}
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
          </div>

          {/* Search */}
          <div style={{ padding: "12px 12px 8px" }}>
            <Input
              prefix={
                searching ? (
                  <Spin size="small" />
                ) : (
                  <SearchOutlined style={{ color: "#555" }} />
                )
              }
              placeholder="Search users..."
              value={searchQ}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                background: "#1a1a2e",
                border: "1px solid #2a2a4a",
                color: "#fff",
                borderRadius: 8,
              }}
              allowClear
            />
          </div>

          {/* Contact list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingContacts && !searchQ ? (
              <div style={{ textAlign: "center", paddingTop: 40 }}>
                <Spin />
              </div>
            ) : displayList.length === 0 ? (
              <Empty
                description={
                  <span style={{ color: "#555" }}>
                    {searchQ ? "No users found" : "No chats yet"}
                  </span>
                }
                style={{ paddingTop: 40 }}
              />
            ) : (
              displayList.map((u) => {
                const hasUnread = !searchQ && u.unreadCount > 0;
                return (
                  <div
                    key={u.id}
                    className={
                      u.role === "admin" ? "animated-admin-border" : ""
                    }
                    onClick={() => {
                      loadMessages(u);

                      setSearchQ("");

                      setSearchResults([]);
                    }}
                    style={{
                      padding: "12px 16px",

                      cursor: "pointer",

                      display: "flex",

                      alignItems: "center",

                      gap: 12,

                      background:
                        selected?.id === u.id ? "#1e1e3a" : "transparent",

                      borderLeft:
                        selected?.id === u.id
                          ? "3px solid #667eea"
                          : "3px solid transparent",

                      transition: "all 0.15s",
                    }}
                  >
                    {/* ── Online dot badge ── */}
                    <Badge
                      dot
                      color={isOnline(u.id) ? "#52c41a" : "#555"}
                      offset={[-2, 30]}
                    >
                      <Avatar style={{ background: "#667eea", flexShrink: 0 }}>
                        {u.username[0].toUpperCase()}
                      </Avatar>
                    </Badge>

                    <div style={{ overflow: "hidden", flex: 1 }}>
                      <div
                        style={{
                          // ── NEW: bold + brighter color when unread ──────
                          color: hasUnread ? "#c4b5fd" : "#fff",
                          fontWeight: hasUnread ? 700 : 500,
                          fontSize: 13,
                        }}
                      >
                        {u.username}
                      </div>
                      {u.lastMessage && (
                        <div
                          style={{
                            // ── NEW: brighter preview for unread ───────────
                            color: hasUnread ? "#a78bfa" : "#666",
                            fontWeight: hasUnread ? 500 : 400,
                            fontSize: 11,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {u.lastMessage}
                        </div>
                      )}
                    </div>

                    {/* ── NEW: unread count pill ──────────────────────── */}
                    {hasUnread && (
                      <div
                        style={{
                          background: "#667eea",
                          color: "#fff",
                          borderRadius: 10,
                          minWidth: 20,
                          height: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "0 6px",
                          flexShrink: 0,
                        }}
                      >
                        {u.unreadCount > 99 ? "99+" : u.unreadCount}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {!selected ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#333",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48 }}>💬</div>
                <div style={{ marginTop: 12, fontSize: 15 }}>
                  Select a user to start chatting
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid #1e1e3a",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "#10101e",
                }}
              >
                <Badge
                  dot
                  color={isOnline(selected.id) ? "#52c41a" : "#555"}
                  offset={[-2, 30]}
                >
                  <Avatar style={{ background: "#667eea" }}>
                    {selected.username[0].toUpperCase()}
                  </Avatar>
                </Badge>
                <div>
                  <div style={{ color: "#fff", fontWeight: 600 }}>
                    {selected.username}
                  </div>
                  <div
                    style={{
                      color: isOnline(selected.id) ? "#52c41a" : "#666",
                      fontSize: 11,
                    }}
                  >
                    {isOnline(selected.id) ? "Online" : "Offline"}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                // className={selected.role === "admin" ? "admin-chat-bg" : ""}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {/* {selected.role === "admin" && (
                  <div className="admin-chat-banner">
                    <span className="shield-icon">🛡️</span>
                    You are chatting with the Admin
                  </div>
                )} */}

                {loadingMsgs ? (
                  <div style={{ textAlign: "center", paddingTop: 60 }}>
                    <Spin size="large" tip="Loading messages..." />
                  </div>
                ) : messages.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#444",
                      marginTop: 60,
                    }}
                  >
                    No messages yet. Say hello! 👋
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const mine = msg.from === user.id;

                    // ── NEW: insert "New messages" divider ─────────────
                    const showDivider =
                      firstUnreadIndex !== null && index === firstUnreadIndex;

                    return (
                      <React.Fragment key={msg.id}>
                        {showDivider && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              margin: "8px 0",
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                                height: 1,
                                background:
                                  "linear-gradient(to right, transparent, #667eea)",
                              }}
                            />
                            <div
                              style={{
                                background: "#667eea22",
                                border: "1px solid #667eea66",
                                borderRadius: 12,
                                padding: "3px 12px",
                                color: "#a78bfa",
                                fontSize: 11,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                              }}
                            >
                              New messages
                            </div>
                            <div
                              style={{
                                flex: 1,
                                height: 1,
                                background:
                                  "linear-gradient(to left, transparent, #667eea)",
                              }}
                            />
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            justifyContent: mine ? "flex-end" : "flex-start",
                          }}
                        >
                          <div
                            style={{
                              maxWidth: "65%",
                              padding: "9px 14px",
                              borderRadius: mine
                                ? "16px 16px 4px 16px"
                                : "16px 16px 16px 4px",
                              background: mine
                                ? "linear-gradient(135deg, #667eea, #764ba2)"
                                : "#1e1e3a",
                              color: "#fff",
                              fontSize: 13,
                              lineHeight: 1.5,
                              boxShadow: "0 2px 8px #0004",
                            }}
                          >
                            <div>{msg.text}</div>
                            <div
                              style={{
                                fontSize: 10,
                                color: mine ? "#ccc" : "#666",
                                marginTop: 4,
                                textAlign: "right",
                              }}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
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
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onPressEnter={sendMessage}
                  placeholder={`Message ${selected.username}...`}
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
                  onClick={sendMessage}
                  loading={sending}
                  disabled={!text.trim()}
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
