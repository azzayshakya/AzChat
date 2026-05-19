import React, { useState } from 'react';
import { Modal, Input, Button, Avatar, Tag, message as antMsg, Spin } from 'antd';
import { UserAddOutlined, DeleteOutlined, CrownOutlined, SearchOutlined } from '@ant-design/icons';
import { api } from '../../../api.js';

export default function GroupMembersModal({ open, onClose, group, currentUserId, onGroupUpdated }) {
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingId, setLoadingId] = useState(null); // tracks which user action is in progress
  const searchTimer = React.useRef(null);

  if (!group) return null;

  const myRole = group.members?.find((m) => m.id === currentUserId)?.role;
  const isAdmin = myRole === 'admin' || myRole === 'owner';

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
        // Filter out already-members
        const memberIds = group.members.map((m) => m.id);
        setSearchResults((data.data || []).filter((u) => !memberIds.includes(u.id)));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const addMember = async (userId) => {
    setLoadingId(userId);
    try {
      const { data } = await api.post(`/groups/${group.id}/members`, { userId });
      antMsg.success('Member added');
      onGroupUpdated(data.data);
      setSearchQ('');
      setSearchResults([]);
    } catch (err) {
      antMsg.error(err?.response?.data?.error || 'Failed to add member');
    } finally {
      setLoadingId(null);
    }
  };

  const removeMember = async (userId) => {
    setLoadingId(userId);
    try {
      const { data } = await api.delete(`/groups/${group.id}/members/${userId}`);
      antMsg.success('Member removed');
      onGroupUpdated(data.data);
    } catch (err) {
      antMsg.error(err?.response?.data?.error || 'Failed to remove member');
    } finally {
      setLoadingId(null);
    }
  };

  const promote = async (userId) => {
    setLoadingId(userId);
    try {
      const { data } = await api.patch(`/groups/${group.id}/members/${userId}/promote`);
      onGroupUpdated(data.data);
    } catch (err) {
      antMsg.error(err?.response?.data?.error || 'Failed to promote');
    } finally {
      setLoadingId(null);
    }
  };

  const roleBadge = (role) => {
    if (role === 'owner')
      return (
        <Tag color="gold" style={{ fontSize: 10 }}>
          Owner
        </Tag>
      );
    if (role === 'admin')
      return (
        <Tag color="blue" style={{ fontSize: 10 }}>
          Admin
        </Tag>
      );
    return null;
  };

  return (
    <Modal
      title={<span style={{ color: '#fff' }}>👥 {group.name} — Members</span>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      styles={{
        content: { background: '#10101e', border: '1px solid #1e1e3a' },
        header: { background: '#10101e', borderBottom: '1px solid #1e1e3a' },
      }}
    >
      {/* Add member search — admin/owner only */}
      {isAdmin && (
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={
              searching ? <Spin size="small" /> : <SearchOutlined style={{ color: '#555' }} />
            }
            placeholder="Search users to add..."
            value={searchQ}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              background: '#1a1a2e',
              border: '1px solid #2a2a4a',
              color: '#fff',
              borderRadius: 8,
              marginBottom: 8,
            }}
            allowClear
          />
          {searchResults.map((u) => (
            <div
              key={u.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 4px',
                borderBottom: '1px solid #1a1a2e',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar size="small" style={{ background: '#667eea' }}>
                  {u.username[0].toUpperCase()}
                </Avatar>
                <span style={{ color: '#fff', fontSize: 13 }}>{u.username}</span>
              </div>
              <Button
                size="small"
                icon={<UserAddOutlined />}
                loading={loadingId === u.id}
                onClick={() => addMember(u.id)}
                style={{ background: '#667eea', border: 'none', color: '#fff', borderRadius: 6 }}
              >
                Add
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Current members */}
      <div style={{ color: '#666', fontSize: 11, marginBottom: 8 }}>
        {group.members?.length || 0} members
      </div>
      {(group.members || []).map((m) => (
        <div
          key={m.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 4px',
            borderBottom: '1px solid #1a1a2e',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size="small" style={{ background: '#667eea' }}>
              {m.username[0].toUpperCase()}
            </Avatar>
            <span style={{ color: m.id === currentUserId ? '#a78bfa' : '#fff', fontSize: 13 }}>
              {m.username} {m.id === currentUserId && '(you)'}
            </span>
            {roleBadge(m.role)}
          </div>

          {/* Actions: only admins/owners can act, cannot act on owner */}
          {isAdmin && m.id !== currentUserId && m.role !== 'owner' && (
            <div style={{ display: 'flex', gap: 6 }}>
              {myRole === 'owner' && m.role !== 'admin' && (
                <Button
                  size="small"
                  icon={<CrownOutlined />}
                  loading={loadingId === m.id}
                  onClick={() => promote(m.id)}
                  style={{
                    background: '#1a1a2e',
                    border: '1px solid #2a2a4a',
                    color: '#a78bfa',
                    borderRadius: 6,
                  }}
                />
              )}
              <Button
                size="small"
                icon={<DeleteOutlined />}
                loading={loadingId === m.id}
                danger
                onClick={() => removeMember(m.id)}
                style={{ borderRadius: 6 }}
              />
            </div>
          )}

          {/* Self leave */}
          {m.id === currentUserId && m.role !== 'owner' && (
            <Button
              size="small"
              danger
              onClick={() => removeMember(currentUserId)}
              style={{ borderRadius: 6 }}
            >
              Leave
            </Button>
          )}
        </div>
      ))}
    </Modal>
  );
}
