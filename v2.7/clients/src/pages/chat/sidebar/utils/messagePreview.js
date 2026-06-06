import { truncateText } from "../../../../utils/TimeFormater";

export function getMessagePreview(msg) {
  if (!msg) return null;

  if (msg.deletedFor === "everyone") {
    return "🚫 Message deleted";
  }

  if (msg.file) {
    const cat = msg.file.category;

    if (cat === "image") return "📷 Photo";
    if (cat === "video") return "🎥 Video";
    if (cat === "audio") return "🎵 Audio";

    return `📎 ${msg.file.name || "File"}`;
  }

  return truncateText(msg.text || "File / Deleted message", 20);
}
