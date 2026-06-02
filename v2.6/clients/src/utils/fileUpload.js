/**
 * fileUpload.js
 * Async helpers for sending files and GIFs through the messages API.
 * Completely stateless — callers manage loading/error state.
 */

import { api } from "../api";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ─────────────────────────────────────────────────────────────────────────────
// sendFile
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uploads a File object to the /messages/file endpoint.
 *
 * @param {File}   file
 * @param {string} selectedId   Conversation / group ID
 * @param {boolean} isGroup
 * @returns {Promise<object>}   The `data.data` payload from the server
 * @throws  Will throw (with a user-friendly `.message`) on validation or network errors
 */
export async function sendFile(file, selectedId, isGroup) {
  if (!selectedId) throw new Error("No conversation selected.");

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large. Maximum size is 10 MB.");
  }

  const form = new FormData();
  form.append("file", file);
  if (isGroup) {
    form.append("groupId", selectedId);
  } else {
    form.append("receiverId", selectedId);
  }

  const { data } = await api.post("/messages/file", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// sendGif
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches a remote GIF URL, converts it to a Blob, and uploads it via sendFile.
 *
 * @param {{ url: string, name: string }} gif
 * @param {string}  selectedId
 * @param {boolean} isGroup
 * @returns {Promise<object>}  The `data.data` payload from the server
 */
export async function sendGif(gif, selectedId, isGroup) {
  const res = await fetch(gif.url);
  const blob = await res.blob();
  const file = new File([blob], gif.name, { type: "image/gif" });
  return sendFile(file, selectedId, isGroup);
}
