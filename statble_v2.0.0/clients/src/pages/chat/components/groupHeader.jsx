import React, { useState } from "react";
import { Avatar, Badge, Button } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import GroupMembersModal from "./GroupMembersModal.jsx";

export default function GroupHeader({ group, currentUserId, onGroupUpdated }) {
  const [showMembers, setShowMembers] = useState(false);

  if (!group) return null;

  const onlineCount = group.members?.filter((m) => m.isOnline).length || 0;

  return (
    <>
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid #1e1e3a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#10101e",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar style={{ background: "#764ba2" }} icon={<TeamOutlined />} />
          <div>
            <div style={{ color: "#fff", fontWeight: 600 }}>{group.name}</div>
            <div style={{ color: "#666", fontSize: 11 }}>
              {group.members?.length || 0} members · {onlineCount} online
            </div>
          </div>
        </div>
        <Button
          icon={<TeamOutlined />}
          onClick={() => setShowMembers(true)}
          style={{
            background: "#1a1a2e",
            border: "1px solid #2a2a4a",
            color: "#a78bfa",
            borderRadius: 8,
          }}
        >
          Members
        </Button>
      </div>

      <GroupMembersModal
        open={showMembers}
        onClose={() => setShowMembers(false)}
        group={group}
        currentUserId={currentUserId}
        onGroupUpdated={onGroupUpdated}
      />
    </>
  );
}
