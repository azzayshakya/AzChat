import React, { useState, useEffect, useRef, useCallback } from "react";
import { message as antMsg } from "antd";
import { useAuth } from "../../AuthContext.jsx";
import { api, getSocket } from "../../api.js";
import ChatHeader from "./components/ChatHeader.jsx";
import GroupHeader from "./components/GroupHeader.jsx";
import MessageList from "./components/MessageList.jsx";
import { features } from "../../utils/features.js";
import { useNotification } from "../../hooks/useNotification.js";
import NoMessage from "./commonComponents/NoMessage.jsx";
import MessageInput from "./MessageInput/index.jsx";
import ChatSidebar from "./sidebar/index.jsx";

export default function Chatx() {
  const { user } = useAuth();

  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQ, setSearchQ] = useState("");

  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [searching, setSearching] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [firstUnreadIndex, setFirstUnreadIndex] = useState(null);

  const selectedRef = useRef(null);
  const selectedTypeRef = useRef(null);
  const searchTimer = useRef(null);
  const socketRef = useRef(null);
  const { notify } = useNotification();
  const fetchContacts = useCallback(async () => {
    try {
      const { data } = await api.get("/contacts");
      setContacts(data.data || []);
    } catch {
      antMsg.error("Failed to load contacts");
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    if (!features.groupChat) {
      setLoadingGroups(false);
      return;
    }
    try {
      const { data } = await api.get("/groups");
      setGroups(data.data || []);
    } catch {
      antMsg.error("Failed to load groups");
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
    fetchGroups();
  }, [fetchContacts, fetchGroups]);

  // ── Socket ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    socketRef.current = getSocket();
    return () => {
      socketRef.current?.off();
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !user?.id) return;

    socket.on("online_users", setOnlineUsers);

    // Direct message
    socket.on("new_message", (msg) => {
      fetchContacts();
      if (msg.senderId !== user.id) {
        notify({
          title: "New Message",
          body: msg.text || "You received a file",
        });
      }
      setMessages((prev) => {
        const current = selectedRef.current;
        const type = selectedTypeRef.current;
        if (!current || type !== "direct") return prev;
        const isCurrentChat =
          msg.chatId === [user.id, current.id].sort().join("_");
        if (!isCurrentChat || prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("new_group_message", (msg) => {
      fetchGroups();
      if (msg.senderId !== user.id) {
        notify({
          title: "New Group Message",
          body: msg.text || "You received a file",
        });
      }
      setMessages((prev) => {
        const current = selectedRef.current;
        const type = selectedTypeRef.current;
        if (!current || type !== "group") return prev;
        if (msg.chatId !== current.id || prev.some((m) => m.id === msg.id))
          return prev;
        return [...prev, msg];
      });
    });

    if (features.messageSeenStatus) {
      socket.on("messages_seen", ({ chatId, seenBy }) => {
        setMessages((prev) =>
          prev.map((m) => ({
            ...m,
            status:
              m.chatId === chatId && m.receiverId === seenBy
                ? "seen"
                : m.status,
          }))
        );
      });
    }

    socket.on("message_deleted", ({ messageId, deletedFor }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? deletedFor === "everyone"
              ? { ...m, deletedFor: "everyone", text: null, file: null }
              : m
            : m
        )
      );
    });

    socket.on("message_edited", (updated) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
    });

    return () => {
      socket.off("online_users");
      socket.off("new_message");
      socket.off("new_group_message");
      socket.off("messages_seen");
      socket.off("message_deleted");
      socket.off("message_edited");
    };
  }, [user?.id, fetchContacts]);

  useEffect(() => {
    selectedRef.current = selected;
    selectedTypeRef.current = selectedType;
  }, [selected, selectedType]);

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
        const { data } = await api.get(`/users/search?q=${val}`);
        setSearchResults(data.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const handleSelectContact = async (partner) => {
    setSelected(partner);
    setSelectedType("direct");
    setLoadingMsgs(true);
    setMessages([]);
    setFirstUnreadIndex(null);
    setSearchQ("");
    setSearchResults([]);
    try {
      const { data } = await api.get(`/messages/${partner.id}`);
      const msgs = data.data || [];
      const firstUnread = msgs.findIndex(
        (m) => m.senderId === partner.id && m.status !== "seen"
      );
      setFirstUnreadIndex(firstUnread >= 0 ? firstUnread : null);
      setMessages(msgs);
      if (firstUnread >= 0) {
        await api.patch("/messages/read", { fromUserId: partner.id });
        fetchContacts();
      }
    } catch {
      antMsg.error("Failed to load messages");
    } finally {
      setLoadingMsgs(false);
    }
  };
  const handleSelectGroup = async (group) => {
    setSelected(group);
    setSelectedType("group");
    setLoadingMsgs(true);
    setMessages([]);
    setFirstUnreadIndex(null);

    socketRef.current?.emit("join_group_room", { groupId: group.id });

    try {
      const { data } = await api.get(`/groups/${group.id}/messages`);
      setMessages(data.data || []);
    } catch {
      antMsg.error("Failed to load group messages");
    } finally {
      setLoadingMsgs(false);
    }
  };

  const sendMessage = () => {
    if (!text.trim() || !selected || sending) return;
    setSending(true);

    if (selectedType === "group") {
      socketRef.current.emit(
        "send_group_message",
        { groupId: selected.id, text: text.trim() },
        (res) => {
          setSending(false);
          if (!res?.ok) antMsg.error(res?.error || "Failed to send");
        }
      );
    } else {
      socketRef.current.emit(
        "send_message",
        { receiverId: selected.id, text: text.trim() },
        (res) => {
          setSending(false);
          if (!res?.ok) antMsg.error(res?.error || "Failed to send");
        }
      );
    }
    setText("");
    setFirstUnreadIndex(null);
  };

  const handleMessageDeleted = (messageId, deleteFor) => {
    setMessages((prev) =>
      deleteFor === "everyone"
        ? prev.map((m) =>
            m.id === messageId
              ? { ...m, deletedFor: "everyone", text: null, file: null }
              : m
          )
        : prev.filter((m) => m.id !== messageId)
    );
  };

  const handleFileSent = (msg) => {
    setMessages((prev) => [...prev, msg]);
    fetchContacts();
  };

  const handleGroupUpdated = (updatedGroup) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
    if (selected?.id === updatedGroup.id) setSelected(updatedGroup);
  };

  const isOnline = (id) => onlineUsers.includes(id);
  const isGroupSelected = selectedType === "group";

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        overflow: "hidden",
        background: "var(--dark-bg)",
      }}
    >
      <ChatSidebar
        currentUser={user}
        contacts={contacts}
        setContacts={setContacts}
        groups={groups}
        setGroups={setGroups}
        searchResults={searchResults}
        searchQ={searchQ}
        onSearch={handleSearch}
        searching={searching}
        loadingContacts={loadingContacts}
        loadingGroups={loadingGroups}
        selectedId={selected?.id}
        selectedType={selectedType}
        onlineUsers={onlineUsers}
        onSelectContact={handleSelectContact}
        onSelectGroup={handleSelectGroup}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {!selected ? (
          <NoMessage />
        ) : (
          <>
            {isGroupSelected ? (
              <GroupHeader
                group={selected}
                currentUserId={user.id}
                onGroupUpdated={handleGroupUpdated}
              />
            ) : (
              <ChatHeader contact={selected} isOnline={isOnline(selected.id)} />
            )}

            <MessageList
              messages={messages}
              currentUserId={user.id}
              loadingMsgs={loadingMsgs}
              firstUnreadIndex={firstUnreadIndex}
              onMessageDeleted={handleMessageDeleted}
              isGroup={isGroupSelected}
              groupMembers={isGroupSelected ? selected.members : null}
            />
            <MessageInput
              value={text}
              onChange={setText}
              onSend={sendMessage}
              sending={sending}
              placeholder={
                isGroupSelected
                  ? `Message ${selected.name}...`
                  : `Message ${selected.username}...`
              }
              selectedId={selected.id}
              isGroup={isGroupSelected}
              onFileSent={handleFileSent}
            />
          </>
        )}
      </div>
    </div>
  );
}
