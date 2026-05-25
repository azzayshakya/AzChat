// utils/chatHelpers.js

export const truncateText = (text = "", maxLength = 15) => {
  if (typeof text !== "string") return "";

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength) + "...";
};

export const formatMessageTime = (dateString) => {
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
