import { api } from "../../../../api";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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

export async function sendGif(gif, selectedId, isGroup) {
  const res = await fetch(gif.url);
  const blob = await res.blob();
  const file = new File([blob], gif.name, { type: "image/gif" });
  return sendFile(file, selectedId, isGroup);
}
