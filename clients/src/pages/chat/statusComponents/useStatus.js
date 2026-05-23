/**
 * useStatus.js
 * Central hook for all status-related state and actions.
 * Used by StatusBar, StatusViewer, and StatusUploader.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchStatuses,
  fetchMyStatuses,
  postStatus,
  deleteStatus,
  replyToStatus,
  markStatusViewed,
  STATUS_CONFIG,
} from "../statusApi.js";

export function useStatus(currentUser) {
  const [statuses, setStatuses] = useState([]); // all visible statuses
  const [myStatuses, setMyStatuses] = useState([]); // current user's own
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [deleting, setDeleting] = useState(null); // statusId being deleted
  const [replying, setReplying] = useState(false);
  const pollRef = useRef(null);

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const [all, mine] = await Promise.all([
        fetchStatuses(),
        fetchMyStatuses(),
      ]);
      setStatuses(all);
      setMyStatuses(mine);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Poll for new statuses
    pollRef.current = setInterval(load, STATUS_CONFIG.pollMs);
    return () => clearInterval(pollRef.current);
  }, [load]);

  // ── Post ────────────────────────────────────────────────────────────────────
  const handlePost = useCallback(
    async (formData) => {
      if (myStatuses.length >= STATUS_CONFIG.maxPerUser) {
        throw new Error(
          `You can only have ${STATUS_CONFIG.maxPerUser} statuses at a time.`
        );
      }
      setPosting(true);
      try {
        const newItem = await postStatus(formData);
        setMyStatuses((prev) => [newItem, ...prev]);
        // Reflect in statuses list under the current user's entry
        setStatuses((prev) => {
          const existing = prev.find((s) => s.userId === currentUser?.id);
          if (existing) {
            return prev.map((s) =>
              s.userId === currentUser.id
                ? { ...s, items: [newItem, ...s.items], hasUnread: false }
                : s
            );
          }
          return [
            {
              id: currentUser.id,
              userId: currentUser.id,
              username: currentUser.username,
              role: currentUser.role,
              avatar: null,
              items: [newItem],
              hasUnread: false,
              isAdmin: currentUser.role === "admin",
            },
            ...prev,
          ];
        });
        return newItem;
      } finally {
        setPosting(false);
      }
    },
    [myStatuses, currentUser]
  );

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (statusId) => {
    setDeleting(statusId);
    try {
      await deleteStatus(statusId);
      setMyStatuses((prev) => prev.filter((s) => s.id !== statusId));
      setStatuses((prev) =>
        prev
          .map((entry) => ({
            ...entry,
            items: entry.items.filter((i) => i.id !== statusId),
          }))
          .filter((entry) => entry.items.length > 0 || entry.isAdmin)
      );
    } finally {
      setDeleting(null);
    }
  }, []);

  // ── Reply ────────────────────────────────────────────────────────────────────
  const handleReply = useCallback(async (statusId, text) => {
    setReplying(true);
    try {
      const reply = await replyToStatus(statusId, text);
      // Append reply to the right status item
      const appendReply = (items) =>
        items.map((i) =>
          i.id === statusId ? { ...i, replies: [...i.replies, reply] } : i
        );
      setStatuses((prev) =>
        prev.map((entry) => ({ ...entry, items: appendReply(entry.items) }))
      );
      setMyStatuses((prev) => appendReply(prev));
      return reply;
    } finally {
      setReplying(false);
    }
  }, []);

  // ── Mark viewed ──────────────────────────────────────────────────────────────
  const handleView = useCallback(async (statusId, userId) => {
    await markStatusViewed(statusId);
    setStatuses((prev) =>
      prev.map((entry) =>
        entry.userId === userId
          ? {
              ...entry,
              hasUnread: false,
              items: entry.items.map((i) =>
                i.id === statusId ? { ...i, views: (i.views ?? 0) + 1 } : i
              ),
            }
          : entry
      )
    );
  }, []);

  return {
    statuses,
    myStatuses,
    loading,
    posting,
    deleting,
    replying,
    handlePost,
    handleDelete,
    handleReply,
    handleView,
    reload: load,
  };
}
