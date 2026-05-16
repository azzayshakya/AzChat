import React, { useState, useEffect, useRef, useCallback } from 'react';
import { message as antMsg } from 'antd';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../AuthContext.jsx';
import { api, getSocket } from '../../api.js';
import Navbar from '../../components/Navbar.jsx';
import useNotification from 'antd/es/notification/useNotification.js';
import ChatSidebar from './components/ChatSidebar.jsx';
import ChatHeader from './components/ChatHeader.jsx';
import MessageInput from './components/MessageInput.jsx';
import MessageList from './components/MessageList.jsx';

export default function Chatx() {
  const { user } = useAuth();
  const nav = useNavigate();
  const socket = getSocket();

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

  const { notify } = useNotification();

  useEffect(() => {
    if (!socket || !user?.id) return;

    const onConnect = () => socket.emit('register', user.id);
    const onOnlineUsers = (users) => setOnlineUsers(users);

    const onNewMessage = (msg) => {
      fetchContacts();

      const current = selectedRef.current;

      // Show notification only for incoming messages
      if (msg.senderId !== user.id) {
        const senderName =
          contacts.find((c) => c.id === msg.senderId)?.username || current?.username || 'Someone';

        notify({
          title: `💬 ${senderName}`,
          body: msg.text.length > 60 ? msg.text.slice(0, 60) + '…' : msg.text,
        });
      }

      setMessages((prev) => {
        if (!current) return prev;

        const isCurrentChat =
          (msg.senderId === current.id && msg.receiverId === user.id) ||
          (msg.senderId === user.id && msg.receiverId === current.id);

        if (!isCurrentChat) return prev;

        // Prevent duplicates
        if (prev.some((m) => m.id === msg.id)) {
          return prev;
        }

        return [...prev, msg];
      });
    };

    socket.on('connect', onConnect);
    socket.on('online_users', onOnlineUsers);
    socket.on('new_message', onNewMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('online_users', onOnlineUsers);
      socket.off('new_message', onNewMessage);
    };
  }, [socket, user?.id, notify]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const fetchContacts = useCallback(async () => {
    try {
      const { data } = await api.get(`/contacts`);
      setContacts(data.data);
    } catch (err) {
      console.error('Contacts error:', err);
    } finally {
      setLoadingContacts(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

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
        setSearchResults(data);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const markAsRead = useCallback(
    async (partnerId) => {
      try {
        await api.patch('/messages/read', {
          fromUserId: partnerId,
        });

        fetchContacts();
      } catch (err) {
        console.error('Mark read error:', err);
      }
    },
    [fetchContacts]
  );

  const loadMessages = async (partner) => {
    setSelected(partner);

    setLoadingMsgs(true);

    setMessages([]);

    setFirstUnreadIndex(null);

    try {
      // Current user automatically comes from JWT
      const { data } = await api.get(`/messages/${partner.id}`);

      // Messages array
      const msgs = data.data;

      // Find first unseen message
      const firstUnread = msgs.findIndex((m) => m.senderId === partner.id && m.status !== 'seen');

      setFirstUnreadIndex(firstUnread >= 0 ? firstUnread : null);

      setMessages(msgs);

      // Mark messages as seen
      if (firstUnread >= 0) {
        markAsRead(partner.id);
      }
    } catch (error) {
      antMsg.error('Failed to load messages');
    } finally {
      setLoadingMsgs(false);
    }
  };

  const sendMessage = () => {
    if (!text.trim() || !selected) return;
    socket.emit(
      'send_message',
      {
        receiverId: selected.id,

        text: text.trim(),
      },
      (response) => {
        if (!response.ok) {
          console.error(response.error);
        }
      }
    );
    setText('');
    setFirstUnreadIndex(null);
  };

  const isOnline = (id) => onlineUsers.includes(id);

  const handleSelectContact = (contact) => {
    loadMessages(contact);
    setSearchQ('');
    setSearchResults([]);
  };

  return (
    <>
      <Navbar />
      <div
        style={{
          display: 'flex',
          height: '93vh',
          background: '#0d0d1a',
          fontFamily: 'system-ui',
        }}
      >
        {/* Left panel */}
        <ChatSidebar
          currentUser={user}
          contacts={contacts}
          searchResults={searchResults}
          searchQ={searchQ}
          onSearch={handleSearch}
          searching={searching}
          loadingContacts={loadingContacts}
          selectedId={selected?.id}
          onlineUsers={onlineUsers}
          onSelectContact={handleSelectContact}
        />

        {/* Right panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!selected ? (
            /* Empty state */
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
              />

              <MessageInput
                value={text}
                onChange={setText}
                onSend={sendMessage}
                sending={sending}
                placeholder={`Message ${selected.username}...`}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
