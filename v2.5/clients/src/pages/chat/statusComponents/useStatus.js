/**
 * useStatus.js
 * Central hook for all status-related state and actions.
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
} from "./statusApi";

export function useStatus(currentUser) {
  const [statuses, setStatuses] = useState([]);
  const [myStatuses, setMyStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [replying, setReplying] = useState(false);
  const pollRef = useRef(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      // fetchStatuses needs currentUser.id to flag isMine on each entry
      const [all, mine] = await Promise.all([
        fetchStatuses(currentUser?.id),
        fetchMyStatuses(),
      ]);
      // DEBUG — remove before production
      console.log("[useStatus] feed:", all);
      console.log("[useStatus] mine:", mine);
      setStatuses(all);
      setMyStatuses(mine);
    } catch (err) {
      console.error("[useStatus] load error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, STATUS_CONFIG.pollMs);
    return () => clearInterval(pollRef.current);
  }, [load]);

  // ── Post ──────────────────────────────────────────────────────────────────
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
        setMyStatuses((prev) => [...prev, newItem]);

        // Reflect in the feed under the current user's group entry
        setStatuses((prev) => {
          const existing = prev.find((s) => s.userId === currentUser?.id);
          if (existing) {
            return prev.map((s) =>
              s.userId === currentUser.id
                ? { ...s, items: [...s.items, newItem] }
                : s
            );
          }
          // First status from this user — create their feed entry
          return [
            {
              id: currentUser.id,
              userId: currentUser.id,
              username: currentUser.username,
              avatar: null,
              hasUnread: false,
              isMine: true,
              isAdmin: currentUser.role === "admin",
              items: [newItem],
            },
            ...prev,
          ];
        });
        return newItem;
      } finally {
        setPosting(false);
      }
    },
    [myStatuses.length, currentUser]
  );

  // ── Delete ────────────────────────────────────────────────────────────────
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
          .filter((entry) => entry.items.length > 0 || entry.isMine)
      );
    } finally {
      setDeleting(null);
    }
  }, []);

  // ── Reply ─────────────────────────────────────────────────────────────────
  const handleReply = useCallback(async (statusId, text) => {
    setReplying(true);
    try {
      const reply = await replyToStatus(statusId, text);
      const appendReply = (items) =>
        items.map((i) =>
          i.id === statusId
            ? { ...i, replies: [...(i.replies ?? []), reply] }
            : i
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

  // ── Mark viewed ───────────────────────────────────────────────────────────
  const handleView = useCallback(async (statusId, userId) => {
    try {
      await markStatusViewed(statusId);
    } catch (_) {
      /* non-blocking */
    }

    setStatuses((prev) =>
      prev.map((entry) => {
        if (entry.userId !== userId) return entry;
        const updatedItems = entry.items.map((i) =>
          i.id === statusId
            ? { ...i, seen: true, views: (i.views ?? 0) + 1 }
            : i
        );
        // Recalculate hasUnread — false only when every item is seen
        const hasUnread = updatedItems.some((i) => !i.seen);
        return { ...entry, items: updatedItems, hasUnread };
      })
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
