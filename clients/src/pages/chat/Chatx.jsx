import React, { useState, useEffect, useRef, useCallback } from 'react';
import { message as antMsg } from 'antd';
import { useAuth } from '../../AuthContext.jsx';
import { api, getSocket } from '../../api.js';
import ChatSidebar from './components/ChatSidebar.jsx';
import ChatHeader from './components/ChatHeader.jsx';
import MessageInput from './components/MessageInput.jsx';
import MessageList from './components/MessageList.jsx';
import { features } from '../../utils/features';

export default function Chatx() {
  const { user } = useAuth();

  const [contacts, setContacts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [searching, setSearching] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [firstUnreadIndex, setFirstUnreadIndex] = useState(null);

  const selectedRef = useRef(null);
  const searchTimer = useRef(null);
  const socketRef = useRef(null);

  // ── Contacts ──────────────────────────────────────────────────────────────
  const fetchContacts = useCallback(async () => {
    try {
      const { data } = await api.get('/contacts');
      setContacts(data.data || []);
    } catch {
      antMsg.error('Failed to load contacts');
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // ── Socket ────────────────────────────────────────────────────────────────
  useEffect(() => {
    socketRef.current = getSocket();
    return () => {
      socketRef.current?.off();
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !user?.id) return;

    socket.on('online_users', setOnlineUsers);

    socket.on('new_message', (msg) => {
      fetchContacts();
      setMessages((prev) => {
        const current = selectedRef.current;
        if (!current) return prev;
        const isCurrentChat = msg.chatId === [user.id, current.id].sort().join('_');
        if (!isCurrentChat || prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    if (features.messageSeenStatus) {
      socket.on('messages_seen', ({ chatId, seenBy }) => {
        setMessages((prev) =>
          prev.map((m) => ({
            ...m,
            status: m.chatId === chatId && m.receiverId === seenBy ? 'seen' : m.status,
          }))
        );
      });
    }

    // Sync real-time deletes from other sessions
    socket.on('message_deleted', ({ messageId, deletedFor }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? deletedFor === 'everyone'
              ? { ...m, deletedFor: 'everyone', text: null, file: null }
              : m
            : m
        )
      );
    });

    return () => {
      socket.off('online_users');
      socket.off('new_message');
      socket.off('messages_seen');
      socket.off('message_deleted');
    };
  }, [user?.id, fetchContacts]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // ── Search ────────────────────────────────────────────────────────────────
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

  // ── Load messages ─────────────────────────────────────────────────────────
  const loadMessages = async (partner) => {
    setSelected(partner);
    setLoadingMsgs(true);
    setMessages([]);
    setFirstUnreadIndex(null);
    try {
      const { data } = await api.get(`/messages/${partner.id}`);
      const msgs = data.data || [];
      const firstUnread = msgs.findIndex((m) => m.senderId === partner.id && m.status !== 'seen');
      setFirstUnreadIndex(firstUnread >= 0 ? firstUnread : null);
      setMessages(msgs);
      if (firstUnread >= 0) {
        await api.patch('/messages/read', { fromUserId: partner.id });
        fetchContacts();
      }
    } catch {
      antMsg.error('Failed to load messages');
    } finally {
      setLoadingMsgs(false);
    }
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = () => {
    if (!text.trim() || !selected || sending) return;
    setSending(true);
    socketRef.current.emit(
      'send_message',
      { receiverId: selected.id, text: text.trim() },
      (res) => {
        setSending(false);
        if (!res?.ok) antMsg.error(res?.error || 'Failed to send');
      }
    );
    setText('');
    setFirstUnreadIndex(null);
  };

  // ── Message deleted locally ───────────────────────────────────────────────
  const handleMessageDeleted = (messageId, deleteFor) => {
    setMessages((prev) =>
      deleteFor === 'everyone'
        ? prev.map((m) =>
            m.id === messageId ? { ...m, deletedFor: 'everyone', text: null, file: null } : m
          )
        : prev.filter((m) => m.id !== messageId)
    );
  };

  // ── File sent ─────────────────────────────────────────────────────────────
  const handleFileSent = (msg) => {
    setMessages((prev) => [...prev, msg]);
    fetchContacts();
  };

  const isOnline = (id) => onlineUsers.includes(id);

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        background: '#0d0d1a',
        fontFamily: 'system-ui',
      }}
    >
      <ChatSidebar
        currentUser={user}
        contacts={contacts}
        setContacts={setContacts}
        searchResults={searchResults}
        searchQ={searchQ}
        onSearch={handleSearch}
        searching={searching}
        loadingContacts={loadingContacts}
        selectedId={selected?.id}
        onlineUsers={onlineUsers}
        onSelectContact={(c) => {
          loadMessages(c);
          setSearchQ('');
          setSearchResults([]);
        }}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!selected ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#333',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48 }}>💬</div>
              <div style={{ marginTop: 12, fontSize: 15 }}>Select a user to start chatting</div>
            </div>
          </div>
        ) : (
          <>
            <ChatHeader contact={selected} isOnline={isOnline(selected.id)} />
            <MessageList
              messages={messages}
              currentUserId={user.id}
              loadingMsgs={loadingMsgs}
              firstUnreadIndex={firstUnreadIndex}
              onMessageDeleted={handleMessageDeleted}
            />
            <MessageInput
              value={text}
              onChange={setText}
              onSend={sendMessage}
              sending={sending}
              placeholder={`Message ${selected.username}...`}
              selectedId={selected.id}
              isGroup={false}
              onFileSent={handleFileSent}
            />
          </>
        )}
      </div>
    </div>
  );
}
