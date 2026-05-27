import React, { useState, useEffect, useCallback } from "react";
import { Spin } from "antd";

import { api } from "../../api";
import { theme } from "../../theme";
import Tabs from "./components/Tabs";
import Navbar from "../../components/Navbar";
import StatCard from "./components/StatCard";
import RangeFilter from "./components/RangeFilter";
import ConfirmModal from "./components/ConfirmModel";

// ── Helpers ──────────────────────────────────────────────────

function Avatar({ name, size = 36 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: theme.gradientPrimary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.38,
        flexShrink: 0,
      }}
    >
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function Tag({ children, color }) {
  return (
    <span
      style={{
        background: color ? `${color}22` : theme.bgHover,
        border: `1px solid ${color ? `${color}66` : theme.border}`,
        borderRadius: 6,
        padding: "2px 8px",
        fontSize: 11,
        color: color || theme.textMuted,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

function SectionHeader({ title, right }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 15 }}>
        {title}
      </div>
      {right}
    </div>
  );
}

// ── TABS CONFIG ──────────────────────────────────────────────

const TABS = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "users", label: "Users", icon: "👥" },
  { key: "chats", label: "Chats", icon: "💬" },
  { key: "connections", label: "Connections", icon: "🔗" },
];

// ── MAIN COMPONENT ───────────────────────────────────────────

export default function Admin() {
  // Overview data
  const [allUsers, setAllUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Chats
  const [chatRange, setChatRange] = useState("all");
  const [chatStats, setChatStats] = useState(null);
  const [loadingChats, setLoadingChats] = useState(false);

  // Connections
  const [connRange, setConnRange] = useState("all");
  const [connections, setConnections] = useState(null);
  const [loadingConns, setLoadingConns] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetchers ────────────────────────────────────────────────

  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const [usersRes, onlineRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/online-users"),
      ]);
      setAllUsers(usersRes.data);
      setOnlineUsers(onlineRes.data.users || []);
    } catch (err) {
      showToast("Failed to load overview", "error");
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const fetchChats = useCallback(async () => {
    setLoadingChats(true);
    try {
      const { data } = await api.get(`/admin/chats?range=${chatRange}`);
      setChatStats(data);
    } catch {
      showToast("Failed to load chat stats", "error");
    } finally {
      setLoadingChats(false);
    }
  }, [chatRange]);

  const fetchConnections = useCallback(async () => {
    setLoadingConns(true);
    try {
      const { data } = await api.get(`/admin/connections?range=${connRange}`);
      setConnections(data);
    } catch {
      showToast("Failed to load connections", "error");
    } finally {
      setLoadingConns(false);
    }
  }, [connRange]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);
  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // ── Delete user ─────────────────────────────────────────────

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setDeleteTarget(null);
      showToast("User deleted successfully");
      fetchOverview();
    } catch {
      showToast("Failed to delete user", "error");
    }
  };

  // ── Tab content renderers ────────────────────────────────────

  const renderOverview = () => {
    if (loadingOverview) return <CenteredSpin />;

    const onlineIds = onlineUsers.map((u) => u.id);

    return (
      <div style={{ padding: 24 }}>
        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <StatCard icon="👤" label="Total Users" value={allUsers.length} />
          <StatCard
            icon="🟢"
            label="Online Now"
            value={onlineUsers.length}
            color={`linear-gradient(135deg, #52c41a, #389e0d)`}
          />
          <StatCard
            icon="💤"
            label="Offline"
            value={allUsers.length - onlineUsers.length}
            color={`linear-gradient(135deg, #555, #333)`}
          />
        </div>

        {/* Online users list */}
        <SectionHeader title={`🟢 Online Users (${onlineUsers.length})`} />
        {onlineUsers.length === 0 ? (
          <EmptyState text="No users online right now" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {onlineUsers.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                badge={<Tag color={theme.online}>Online</Tag>}
                onDelete={() => setDeleteTarget(u)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderUsers = () => {
    if (loadingOverview) return <CenteredSpin />;
    const onlineIds = onlineUsers.map((u) => u.id);

    return (
      <div style={{ padding: 24 }}>
        <SectionHeader title={`All Users (${allUsers.length})`} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {allUsers.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              badge={
                onlineIds.includes(u.id) ? (
                  <Tag color={theme.online}>Online</Tag>
                ) : (
                  <Tag>Offline</Tag>
                )
              }
              onDelete={() => setDeleteTarget(u)}
              showExtra
            />
          ))}
        </div>
      </div>
    );
  };

  const renderChats = () => (
    <div style={{ padding: 24 }}>
      <SectionHeader
        title="Chat Statistics"
        right={<RangeFilter value={chatRange} onChange={setChatRange} />}
      />
      {loadingChats ? (
        <CenteredSpin />
      ) : chatStats ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 28,
            }}
          >
            <StatCard
              icon="📨"
              label="Total Messages"
              value={chatStats.totalMessages}
            />
          </div>

          {chatStats.messages.length === 0 ? (
            <EmptyState text="No messages in this period" />
          ) : (
            <div>
              <div
                style={{
                  color: theme.textMuted,
                  fontSize: 12,
                  marginBottom: 10,
                }}
              >
                {chatStats.messages.length} messages shown
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {chatStats.messages.slice(0, 50).map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      background: theme.bgCard,
                      border: `1px solid ${theme.border}`,
                      borderRadius: theme.radius,
                      padding: "10px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        color: theme.primary,
                        fontSize: 11,
                        fontWeight: 600,
                        minWidth: 70,
                        flexShrink: 0,
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div
                      style={{
                        color: theme.textMuted,
                        fontSize: 11,
                        minWidth: 80,
                        flexShrink: 0,
                      }}
                    >
                      {msg.from} → {msg.to}
                    </div>
                    <div
                      style={{
                        color: theme.textSecondary,
                        fontSize: 13,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatStats.messages.length > 50 && (
                  <div
                    style={{
                      color: theme.textDim,
                      fontSize: 12,
                      textAlign: "center",
                      padding: 12,
                    }}
                  >
                    Showing first 50 of {chatStats.messages.length} messages
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );

  const renderConnections = () => (
    <div style={{ padding: 24 }}>
      <SectionHeader
        title="User Connections"
        right={<RangeFilter value={connRange} onChange={setConnRange} />}
      />
      {loadingConns ? (
        <CenteredSpin />
      ) : connections ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 28,
            }}
          >
            <StatCard
              icon="🔗"
              label="Unique Pairs"
              value={connections.totalPairs}
            />
          </div>

          {connections.connections.length === 0 ? (
            <EmptyState text="No connections in this period" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {connections.connections.map((conn, i) => (
                <div
                  key={i}
                  style={{
                    background: theme.bgCard,
                    border: `1px solid ${theme.border}`,
                    borderRadius: theme.radiusLg,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  {/* User A */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flex: 1,
                      minWidth: 120,
                    }}
                  >
                    <Avatar name={conn.userA.username} />
                    <div>
                      <div
                        style={{
                          color: theme.textPrimary,
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {conn.userA.username}
                      </div>
                      <div style={{ color: theme.textDim, fontSize: 10 }}>
                        {conn.userA.id}
                      </div>
                    </div>
                  </div>

                  {/* Arrow + total */}
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ color: theme.textDim, fontSize: 18 }}>⇄</div>
                    <div
                      style={{
                        background: theme.gradientPrimary,
                        borderRadius: 10,
                        padding: "2px 10px",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 700,
                        marginTop: 2,
                      }}
                    >
                      {conn.totalMessages} msgs
                    </div>
                  </div>

                  {/* User B */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flex: 1,
                      minWidth: 120,
                    }}
                  >
                    <Avatar name={conn.userB.username} />
                    <div>
                      <div
                        style={{
                          color: theme.textPrimary,
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {conn.userB.username}
                      </div>
                      <div style={{ color: theme.textDim, fontSize: 10 }}>
                        {conn.userB.id}
                      </div>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexShrink: 0,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        background: theme.bgHover,
                        border: `1px solid ${theme.border}`,
                        borderRadius: theme.radius,
                        padding: "6px 12px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          color: theme.primaryLighter,
                          fontWeight: 700,
                          fontSize: 16,
                        }}
                      >
                        {conn.sentByA}
                      </div>
                      <div style={{ color: theme.textDim, fontSize: 10 }}>
                        by {conn.userA.username}
                      </div>
                    </div>
                    <div
                      style={{
                        background: theme.bgHover,
                        border: `1px solid ${theme.border}`,
                        borderRadius: theme.radius,
                        padding: "6px 12px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          color: theme.primaryLighter,
                          fontWeight: 700,
                          fontSize: 16,
                        }}
                      >
                        {conn.sentByB}
                      </div>
                      <div style={{ color: theme.textDim, fontSize: 10 }}>
                        by {conn.userB.username}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );

  // ── Render ───────────────────────────────────────────────────

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: "93vh",
          background: theme.bg,
          fontFamily: "system-ui",
        }}
      >
        {/* Page header */}
        <div
          style={{
            background: theme.bgPanel,
            borderBottom: `1px solid ${theme.border}`,
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                color: theme.textPrimary,
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              ⚙️ Admin Dashboard
            </div>
            <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>
              AzChat · Manage users, chats, and connections
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs tabs={TABS} defaultTab="overview">
          {(active) => (
            <div>
              {active === "overview" && renderOverview()}
              {active === "users" && renderUsers()}
              {active === "chats" && renderChats()}
              {active === "connections" && renderConnections()}
            </div>
          )}
        </Tabs>

        {/* Delete confirmation modal */}
        <ConfirmModal
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />

        {/* Toast */}
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              background: toast.type === "error" ? theme.danger : theme.primary,
              color: "#fff",
              borderRadius: theme.radius,
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: theme.shadowLg,
              zIndex: 9999,
              animation: "slideUp 0.2s ease",
            }}
          >
            {toast.msg}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0 }
          to   { transform: translateY(0);    opacity: 1 }
        }
      `}</style>
    </>
  );
}

// ── Small shared sub-components ──────────────────────────────

function UserRow({ user, badge, onDelete, showExtra }) {
  return (
    <div
      style={{
        background: theme.bgCard,
        border: `1px solid ${theme.border}`,
        borderRadius: theme.radius,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = theme.bgHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = theme.bgCard)}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: theme.gradientPrimary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          flexShrink: 0,
        }}
      >
        {user.username?.[0]?.toUpperCase()}
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <div
          style={{
            color: theme.textPrimary,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {user.username}
        </div>
        <div
          style={{
            color: theme.textDim,
            fontSize: 11,
            display: "flex",
            gap: 12,
            marginTop: 2,
            flexWrap: "wrap",
          }}
        >
          <span>{user.email}</span>
          {showExtra && <span>ID: {user.id}</span>}
          {showExtra && user.createdAt && (
            <span>
              Joined{" "}
              {new Date(user.createdAt).toLocaleDateString([], {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {badge}
        <button
          onClick={() => onDelete(user)}
          style={{
            background: "transparent",
            border: `1px solid ${theme.dangerBorder}`,
            borderRadius: theme.radiusSm,
            color: theme.danger,
            cursor: "pointer",
            padding: "5px 10px",
            fontSize: 12,
            fontWeight: 600,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.dangerBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function CenteredSpin() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <Spin size="large" />
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div
      style={{
        textAlign: "center",
        color: theme.textDim,
        padding: 48,
        fontSize: 14,
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
      {text}
    </div>
  );
}
