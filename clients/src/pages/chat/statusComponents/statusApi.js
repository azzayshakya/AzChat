// /**
//  * statusApi.js
//  * All status-related API calls — wired to the real backend.
//  *
//  * VITE env vars:
//  *   VITE_STATUS_MAX_PER_USER   – max statuses a user can post  (default 10)
//  *   VITE_STATUS_TTL_HOURS      – how many hours a status lives  (default 24)
//  *   VITE_STATUS_MAX_TEXT_LEN   – max characters in text status  (default 280)
//  *   VITE_STATUS_MAX_IMAGE_MB   – max image size in MB           (default 10)
//  *   VITE_STATUS_POLL_MS        – polling interval ms            (default 60000)
//  */

// import { api } from "../../../api";

// // ─── Config (mirrors backend .env defaults) ───────────────────────────────────
// export const STATUS_CONFIG = {
//   maxPerUser: Number(import.meta.env.VITE_STATUS_MAX_PER_USER ?? 10),
//   ttlHours: Number(import.meta.env.VITE_STATUS_TTL_HOURS ?? 24),
//   maxTextLen: Number(import.meta.env.VITE_STATUS_MAX_TEXT_LEN ?? 280),
//   maxImageMb: Number(import.meta.env.VITE_STATUS_MAX_IMAGE_MB ?? 10),
//   pollMs: Number(import.meta.env.VITE_STATUS_POLL_MS ?? 60_000),
// };

// // ─── Feed ─────────────────────────────────────────────────────────────────────

// /**
//  * Fetch all visible statuses for the current user's contacts.
//  * GET /api/statuses
//  * Returns grouped feed: [{ user, statuses, allSeen, latestAt }]
//  */
// export async function fetchStatuses() {
//   const { data } = await api.get("/statuses");
//   return data.data;
// }

// /**
//  * Fetch current user's own statuses (with viewer lists).
//  * GET /api/statuses/me
//  * Returns: [{ id, userId, text, file, backgroundColor, textColor, viewers, createdAt, expiresAt }]
//  */
// export async function fetchMyStatuses() {
//   const { data } = await api.get("/statuses/me");
//   return data.data;
// }

// // ─── Post ─────────────────────────────────────────────────────────────────────

// /**
//  * Post a new status.
//  * POST /api/statuses   (multipart/form-data)
//  *
//  * @param {Object} payload
//  * @param {string|null}  payload.text
//  * @param {File|null}    payload.file            – image or video File object
//  * @param {string}       payload.backgroundColor – hex color
//  * @param {string}       payload.textColor       – hex color
//  *
//  * Returns the created status object.
//  * After posting, emit socket event so contacts get notified in real-time.
//  */
// export async function postStatus({ text, file, backgroundColor, textColor }) {
//   const form = new FormData();
//   if (text) form.append("text", text.trim());
//   if (file) form.append("file", file);
//   if (backgroundColor) form.append("backgroundColor", backgroundColor);
//   if (textColor) form.append("textColor", textColor);

//   const { data } = await api.post("/statuses", form, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });

//   const created = data.data;

//   // Notify contacts via socket
//   try {
//     const socket = getSocket();
//     socket.emit("status_posted", { statusId: created.id });
//   } catch (_) {
//     /* socket not critical */
//   }

//   return created;
// }

// // ─── Interactions ─────────────────────────────────────────────────────────────

// /**
//  * Mark a status as viewed (idempotent).
//  * POST /api/statuses/:statusId/view
//  * Also emits socket event so owner sees real-time view notification.
//  */
// export async function markStatusViewed(statusId) {
//   const { data } = await api.post(`/statuses/${statusId}/view`);

//   // Notify owner via socket
//   try {
//     const socket = getSocket();
//     socket.emit("status_viewed", { statusId });
//   } catch (_) {}

//   return data;
// }
// export async function replyToStatus(statusId, text) {
//   // const { data } = await api.post(`/statuses/${statusId}/replies`, { text });
//   // return data.data;
//   await delay(300);
//   return {
//     id: `reply_${Date.now()}`,
//     userId: "me",
//     username: "You",
//     text,
//     createdAt: new Date().toISOString(),
//   };
// }
// /**
//  * Get the viewer list for one of your own statuses.
//  * GET /api/statuses/:statusId/viewers
//  * Returns: { data: [{ userId, username, name, viewedAt }], total }
//  */
// export async function fetchStatusViewers(statusId) {
//   const { data } = await api.get(`/statuses/${statusId}/viewers`);
//   return data; // { data: [...], total }
// }

// /**
//  * Delete one of your own statuses.
//  * DELETE /api/statuses/:statusId
//  * Also emits socket event so contacts remove it from their feed immediately.
//  */
// export async function deleteStatus(statusId) {
//   const { data } = await api.delete(`/statuses/${statusId}`);

//   try {
//     const socket = getSocket();
//     socket.emit("status_deleted", { statusId });
//   } catch (_) {}

//   return data; // { ok: true, statusId }
// }

// // ─── Socket listeners (call once on mount, return cleanup fn) ─────────────────

// /**
//  * Subscribe to real-time status events.
//  *
//  * @param {Object} handlers
//  * @param {Function} handlers.onNewStatus    – ({ status, user }) => void
//  * @param {Function} handlers.onStatusSeen   – ({ statusId, viewer, viewedAt }) => void
//  * @param {Function} handlers.onStatusRemoved – ({ statusId, userId }) => void
//  *
//  * @returns {Function} cleanup — call on component unmount
//  *
//  * Usage:
//  *   useEffect(() => {
//  *     const cleanup = subscribeToStatusEvents({
//  *       onNewStatus:     (payload) => { ... },
//  *       onStatusSeen:    (payload) => { ... },
//  *       onStatusRemoved: (payload) => { ... },
//  *     });
//  *     return cleanup;
//  *   }, []);
//  */
// export function subscribeToStatusEvents({
//   onNewStatus,
//   onStatusSeen,
//   onStatusRemoved,
// } = {}) {
//   const socket = getSocket();

//   if (onNewStatus) socket.on("new_status", onNewStatus);
//   if (onStatusSeen) socket.on("status_seen", onStatusSeen);
//   if (onStatusRemoved) socket.on("status_removed", onStatusRemoved);

//   return () => {
//     if (onNewStatus) socket.off("new_status", onNewStatus);
//     if (onStatusSeen) socket.off("status_seen", onStatusSeen);
//     if (onStatusRemoved) socket.off("status_removed", onStatusRemoved);
//   };
// }

// // ─── Utils ────────────────────────────────────────────────────────────────────

// /** "2h ago", "just now", etc. */
// export function timeAgo(iso) {
//   const diff = Date.now() - new Date(iso).getTime();
//   const m = Math.floor(diff / 60_000);
//   if (m < 1) return "just now";
//   if (m < 60) return `${m}m ago`;
//   const h = Math.floor(m / 60);
//   if (h < 24) return `${h}h ago`;
//   return `${Math.floor(h / 24)}d ago`;
// }

// /** "23h 12m left" or "expired" */
// export function timeLeft(iso) {
//   const diff = new Date(iso).getTime() - Date.now();
//   if (diff <= 0) return "expired";
//   const h = Math.floor(diff / 3_600_000);
//   const m = Math.floor((diff % 3_600_000) / 60_000);
//   return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
// }

// /**
//  * Build the full URL for a status media file.
//  * status.file.url is a relative path like /uploads/images/abc.webp
//  */
// export function statusMediaUrl(relativeUrl) {
//   if (!relativeUrl) return null;
//   return `${import.meta.env.VITE_API_URL}${relativeUrl}`;
// }
// old code

/**
 * statusApi.js
 * All status-related API calls.
 * Dummy responses are used until the backend is implemented.
 * Replace the dummy blocks with real `api.get/post/delete` calls.
 *
 * ENV vars consumed (via import.meta.env):
 *   VITE_STATUS_MAX_PER_USER   – max statuses a user can post (default 10)
 *   VITE_STATUS_TTL_HOURS      – how many hours a status lives  (default 24)
 *   VITE_STATUS_MAX_TEXT_LEN   – max characters in text status  (default 300)
 *   VITE_STATUS_MAX_IMAGE_MB   – max image size in MB           (default 5)
 *   VITE_STATUS_REPLY_MAX_LEN  – max reply length               (default 200)
 *   VITE_STATUS_POLL_MS        – polling interval for new statuses (default 60000)
 */

export const STATUS_CONFIG = {
  maxPerUser: Number(import.meta.env.VITE_STATUS_MAX_PER_USER ?? 10),
  ttlHours: Number(import.meta.env.VITE_STATUS_TTL_HOURS ?? 24),
  maxTextLen: Number(import.meta.env.VITE_STATUS_MAX_TEXT_LEN ?? 300),
  maxImageMb: Number(import.meta.env.VITE_STATUS_MAX_IMAGE_MB ?? 5),
  replyMaxLen: Number(import.meta.env.VITE_STATUS_REPLY_MAX_LEN ?? 200),
  pollMs: Number(import.meta.env.VITE_STATUS_POLL_MS ?? 60_000),
};

// ─── Dummy data ──────────────────────────────────────────────────────────────
const DUMMY_STATUSES = [
  {
    id: "admin-welcome",
    userId: "admin",
    username: "AZChat",
    role: "admin",
    avatar: null, // will show initials
    items: [
      {
        id: "admin-s1",
        type: "text_image",
        text: "Welcome to AZChat 🎉 Connect with your team, share updates, and stay in sync!",
        imageUrl: null,
        backgroundColor: "#1a0a3d",
        textColor: "#c4b5fd",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23).toISOString(),
        privacy: "public",
        views: 12,
        replies: [],
      },
    ],
    hasUnread: true,
    isAdmin: true,
  },
  {
    id: "u1",
    userId: "u1",
    username: "ajayshakya",
    role: "admin",
    avatar: "/developer_profile.jpg",
    items: [
      {
        id: "s2",
        type: "text",
        text: "Working on the new feature 🚀",
        imageUrl: null,
        backgroundColor: "#0d1f3c",
        textColor: "#7aaee0",
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
        privacy: "public",
        views: 5,
        replies: [
          {
            id: "r1",
            userId: "u2",
            username: "hannibal",
            text: "Looks amazing!",
            createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          },
        ],
      },
      {
        id: "s3",
        type: "text",
        text: "Bug fixed! Pushing to prod now 🐛✅",
        imageUrl: null,
        backgroundColor: "#0a2a1a",
        textColor: "#4caf89",
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23).toISOString(),
        privacy: "friends",
        views: 3,
        replies: [],
      },
    ],
    hasUnread: false,
    isAdmin: false,
  },
  {
    id: "u2",
    userId: "u2",
    username: "hannibal",
    role: "user",
    avatar: null,
    items: [
      {
        id: "s4",
        type: "image",
        text: "Sunday vibes 🌅",
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
        backgroundColor: "#1a1010",
        textColor: "#e07070",
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 21).toISOString(),
        privacy: "public",
        views: 8,
        replies: [],
      },
    ],
    hasUnread: true,
    isAdmin: false,
  },
  {
    id: "u3",
    userId: "u3",
    username: "eram",
    role: "user",
    avatar: null,
    items: [
      {
        id: "s5",
        type: "text",
        text: "Just finished reading a great book 📚",
        imageUrl: null,
        backgroundColor: "#1a0a1a",
        textColor: "#d07099",
        createdAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
        privacy: "friends",
        views: 2,
        replies: [],
      },
    ],
    hasUnread: true,
    isAdmin: false,
  },
];

// Current user's own statuses (dummy)
const MY_STATUSES = [
  {
    id: "my1",
    type: "text",
    text: "Late night coding session ☕",
    imageUrl: null,
    backgroundColor: "#1a1540",
    textColor: "#a78bfa",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23).toISOString(),
    privacy: "public",
    views: 4,
    replies: [],
  },
];

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Fetch all visible statuses (contacts' + admin welcome).
 * Real: GET /api/statuses
 */
export async function fetchStatuses() {
  // --- REAL implementation (uncomment when backend ready) ---
  // const { data } = await api.get("/statuses");
  // return data.data;

  // --- DUMMY ---
  await delay(400);
  return DUMMY_STATUSES;
}

/**
 * Fetch current user's own statuses.
 * Real: GET /api/statuses/mine
 */
export async function fetchMyStatuses() {
  // const { data } = await api.get("/statuses/mine");
  // return data.data;
  await delay(300);
  return MY_STATUSES;
}

/**
 * Post a new status.
 * @param {FormData} formData  – fields: text?, imageFile?, privacy, backgroundColor, textColor
 * Real: POST /api/statuses
 */
export async function postStatus(formData) {
  // const { data } = await api.post("/statuses", formData, {
  //   headers: { "Content-Type": "multipart/form-data" },
  // });
  // return data.data;
  await delay(600);
  const text = formData.get("text");
  const privacy = formData.get("privacy") ?? "public";
  const imageFile = formData.get("imageFile");
  const backgroundColor = formData.get("backgroundColor") ?? "#1a1540";
  const textColor = formData.get("textColor") ?? "#a78bfa";
  const type = imageFile && text ? "text_image" : imageFile ? "image" : "text";
  return {
    id: `new_${Date.now()}`,
    type,
    text: text || null,
    imageUrl: imageFile ? URL.createObjectURL(imageFile) : null,
    backgroundColor,
    textColor,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(
      Date.now() + 1000 * 60 * 60 * STATUS_CONFIG.ttlHours
    ).toISOString(),
    privacy,
    views: 0,
    replies: [],
  };
}

/**
 * Delete a status item.
 * Real: DELETE /api/statuses/:statusId
 */
export async function deleteStatus(statusId) {
  // await api.delete(`/statuses/${statusId}`);
  await delay(400);
  return { ok: true };
}

/**
 * Reply to a status.
 * Real: POST /api/statuses/:statusId/replies
 */
export async function replyToStatus(statusId, text) {
  // const { data } = await api.post(`/statuses/${statusId}/replies`, { text });
  // return data.data;
  await delay(300);
  return {
    id: `reply_${Date.now()}`,
    userId: "me",
    username: "You",
    text,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Mark a status as viewed.
 * Real: POST /api/statuses/:statusId/view
 */
export async function markStatusViewed(statusId) {
  // await api.post(`/statuses/${statusId}/view`);
  await delay(100);
  return { ok: true };
}

// ─── Utils ────────────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function timeLeft(iso) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "expired";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}
