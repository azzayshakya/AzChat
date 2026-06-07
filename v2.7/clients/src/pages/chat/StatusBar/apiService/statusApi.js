import { api, getSocket } from "../../../../api";

export const STATUS_CONFIG = {
  maxPerUser: Number(import.meta.env.VITE_STATUS_MAX_PER_USER ?? 10),
  ttlHours: Number(import.meta.env.VITE_STATUS_TTL_HOURS ?? 24),
  maxTextLen: Number(import.meta.env.VITE_STATUS_MAX_TEXT_LEN ?? 280),
  maxImageMb: Number(import.meta.env.VITE_STATUS_MAX_IMAGE_MB ?? 10),
  pollMs: Number(import.meta.env.VITE_STATUS_POLL_MS ?? 60_000),
  replyMaxLen: 200,
};

// ─── URL helper ───────────────────────────────────────────────────────────────
// Backend stores relative paths like /uploads/images/foo.webp
// We prefix with the API base so <img src> works from the browser.
export function statusMediaUrl(relativeUrl) {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith("http")) return relativeUrl;
  return `${import.meta.env.VITE_API_URL}${relativeUrl}`;
}

// ─── Transform a raw status item from the backend into the frontend shape ─────
// Backend status: { id, userId, text, file, backgroundColor, textColor, viewers, createdAt, expiresAt }
// Frontend item:  { id, userId, text, imageUrl, backgroundColor, textColor, views, createdAt, expiresAt, seen, replies }
function transformItem(raw, seen = false) {
  return {
    id: raw.id,
    userId: raw.userId,
    text: raw.text ?? null,
    // Backend stores file under raw.file.url — map to imageUrl for the viewer
    imageUrl: raw.file?.url ? statusMediaUrl(raw.file.url) : null,
    backgroundColor: raw.backgroundColor ?? "#1a1540",
    textColor: raw.textColor ?? "#ffffff",
    // Backend viewers array length = view count; frontend tracks as `views`
    views: Array.isArray(raw.viewers) ? raw.viewers.length : (raw.views ?? 0),
    viewers: raw.viewers ?? [],
    visibleTo: raw.visibleTo ?? [],
    createdAt: raw.createdAt,
    expiresAt: raw.expiresAt,
    seen: raw.seen ?? seen,
    // replies is a frontend-only concept for now (stub endpoint)
    replies: raw.replies ?? [],
    // privacy is sent from uploader but not persisted by backend yet; default public
    privacy: raw.privacy ?? "public",
  };
}

// ─── Transform the feed response (array of user groups) ──────────────────────
// Backend group: { user, statuses, latestAt, allSeen }
// Frontend entry: { id, userId, username, avatar, items, hasUnread, isMine, isAdmin }
function transformFeedEntry(group, currentUserId) {
  const user = group.user ?? {};
  return {
    // Use userId as the stable React key
    id: user.id,
    userId: user.id,
    username: user.username ?? user.name ?? "Unknown",
    avatar: user.avatar ?? null,
    isOnline: user.isOnline ?? false,
    lastSeen: user.lastSeen ?? null,
    // allSeen=false means there is at least one unseen status → show ring
    hasUnread: group.allSeen === false,
    isMine: user.id === currentUserId,
    isAdmin: user.role === "admin",
    items: (group.statuses ?? []).map((s) => transformItem(s, s.seen)),
    latestAt: group.latestAt,
  };
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function fetchStatuses(currentUserId) {
  const { data } = await api.get("/statuses");
  // data.data is an array of grouped feed entries
  return (data.data ?? []).map((group) =>
    transformFeedEntry(group, currentUserId)
  );
}

export async function fetchMyStatuses() {
  const { data } = await api.get("/statuses/me");
  // data.data is a flat array of raw status objects
  return (data.data ?? []).map((s) => transformItem(s, true));
}

export async function postStatus(formData) {
  const { data } = await api.post("/statuses", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const created = transformItem(data.data);

  try {
    getSocket().emit("status_posted", { statusId: created.id });
  } catch (_) {
    /* socket optional */
  }

  return created;
}

export async function markStatusViewed(statusId) {
  const { data } = await api.post(`/statuses/${statusId}/view`);

  try {
    getSocket().emit("status_viewed", { statusId });
  } catch (_) {}

  return data;
}

export async function fetchStatusViewers(statusId) {
  const { data } = await api.get(`/statuses/${statusId}/viewers`);
  return data;
}

export async function deleteStatus(statusId) {
  const { data } = await api.delete(`/statuses/${statusId}`);

  try {
    getSocket().emit("status_deleted", { statusId });
  } catch (_) {}

  return data;
}

/**
 * replyToStatus — stub until backend adds POST /api/statuses/:id/replies.
 * Returns a fake reply object so the UI can optimistically append it.
 */
export async function replyToStatus(statusId, text) {
  // TODO: replace with real API call when endpoint exists
  // const { data } = await api.post(`/statuses/${statusId}/replies`, { text });
  // return data.data;
  return {
    id: `reply_${Date.now()}`,
    userId: "me",
    username: "You",
    text,
    createdAt: new Date().toISOString(),
  };
}

export function subscribeToStatusEvents({
  onNewStatus,
  onStatusSeen,
  onStatusRemoved,
} = {}) {
  const socket = getSocket();
  if (onNewStatus) socket.on("new_status", onNewStatus);
  if (onStatusSeen) socket.on("status_seen", onStatusSeen);
  if (onStatusRemoved) socket.on("status_removed", onStatusRemoved);

  return () => {
    if (onNewStatus) socket.off("new_status", onNewStatus);
    if (onStatusSeen) socket.off("status_seen", onStatusSeen);
    if (onStatusRemoved) socket.off("status_removed", onStatusRemoved);
  };
}
