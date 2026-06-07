export const truncateText = (text = "", maxLength = 15) => {
  /**
   * truncateText("JavaScript Developer", 10)
   * Output: "JavaScript..."
   */
  if (typeof text !== "string") return "";

  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "...";
};

export const formatMessageTime = (dateString) => {
  /**
   * Input: 2026-06-06T09:59:40Z
   * Output: "Just now"
   *
   * Input: 2026-06-06T09:55:00Z
   * Output: "5 min ago"
   */
  if (!dateString) return "";

  const now = new Date();
  const msgDate = new Date(dateString);

  const diffMs = now - msgDate;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  if (days < 30) {
    return `${days} day ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} month ago`;
  }

  const years = Math.floor(months / 12);

  return `${years} year ago`;
};

export function timeLeft(iso) {
  if (!iso) return "";
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "expired";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}
