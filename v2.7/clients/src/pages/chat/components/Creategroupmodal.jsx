import React, { useState } from "react";
import { Modal, Input, Button, message as antMsg } from "antd";
import { api } from "../../../api.js";

export default function CreateGroupModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return antMsg.error("Group name is required");
    setLoading(true);
    try {
      const { data } = await api.post("/groups", {
        name: name.trim(),
        description: description.trim(),
      });
      antMsg.success("Group created");
      onCreated(data.data);
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      antMsg.error(err?.response?.data?.error || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<span style={{ color: "#fff" }}>Create Group</span>}
      open={open}
      onCancel={onClose}
      footer={null}
      styles={{
        content: { background: "#10101e", border: "1px solid #1e1e3a" },
        header: { background: "#10101e", borderBottom: "1px solid #1e1e3a" },
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          paddingTop: 8,
        }}
      >
        <Input
          placeholder="Group name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          style={{
            background: "#1a1a2e",
            border: "1px solid #2a2a4a",
            color: "#fff",
            borderRadius: 8,
          }}
        />
        <Input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
          style={{
            background: "#1a1a2e",
            border: "1px solid #2a2a4a",
            color: "#fff",
            borderRadius: 8,
          }}
        />
        <Button
          onClick={handleCreate}
          loading={loading}
          style={{
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            border: "none",
            color: "#fff",
            borderRadius: 8,
            height: 40,
          }}
          block
        >
          Create Group
        </Button>
      </div>
    </Modal>
  );
}
