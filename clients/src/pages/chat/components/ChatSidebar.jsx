import React from 'react';
import { Input, Spin, Empty, Avatar, Dropdown, message as antMsg } from 'antd';
import {
  SearchOutlined,
  WifiOutlined,
  UserOutlined,
  DeleteOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import ContactItem from './ContactItem';

import { features } from '../../../utils/features';
import { api } from '../../../api';

export default function ChatSidebar({
  currentUser,
  contacts,
  setContacts,
  searchResults,
  searchQ,
  onSearch,
  searching,
  loadingContacts,
  selectedId,
  onlineUsers,
  onSelectContact,
}) {
  const displayList = searchQ
    ? searchResults
    : [...contacts].sort((a, b) => {
        const tA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const tB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return tB - tA;
      });

  const isOnline = (id) => onlineUsers.includes(id);

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      antMsg.success('Chat cleared');
    } catch {
      antMsg.error('Failed to clear chat');
    }
  };

  return (
    <div
      style={{
        width: 300,
        borderRight: '1px solid #1e1e3a',
        display: 'flex',
        flexDirection: 'column',
        background: '#10101e',
      }}
    >
      {/* Current user header */}
      <div
        style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid #1e1e3a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar style={{ background: '#667eea' }} icon={<UserOutlined />} />
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>
              {currentUser.username}
            </div>
            <div
              style={{
                color: '#667eea',
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <WifiOutlined /> LAN
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 12px 8px' }}>
        <Input
          prefix={searching ? <Spin size="small" /> : <SearchOutlined style={{ color: '#555' }} />}
          placeholder="Search users..."
          value={searchQ}
          onChange={(e) => onSearch(e.target.value)}
          style={{
            background: '#1a1a2e',
            border: '1px solid #2a2a4a',
            color: '#fff',
            borderRadius: 8,
          }}
          allowClear
        />
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loadingContacts && !searchQ ? (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <Spin />
          </div>
        ) : displayList.length === 0 ? (
          <Empty
            description={
              <span style={{ color: '#555' }}>{searchQ ? 'No users found' : 'No chats yet'}</span>
            }
            style={{ paddingTop: 40 }}
          />
        ) : (
          displayList.map((contact) => {
            const menuItems = [];
            if (features.deleteContact && !searchQ) {
              menuItems.push({
                key: 'delete',
                label: 'Clear chat',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDeleteContact(contact.id),
              });
            }

            return (
              <div
                key={contact.id}
                style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
              >
                <div style={{ flex: 1 }}>
                  <ContactItem
                    contact={contact}
                    isSelected={selectedId === contact.id}
                    isOnline={isOnline(contact.id)}
                    onClick={() => onSelectContact(contact)}
                  />
                </div>
                {menuItems.length > 0 && (
                  <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                    <EllipsisOutlined
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: '#555', padding: '0 10px', cursor: 'pointer', fontSize: 16 }}
                    />
                  </Dropdown>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
