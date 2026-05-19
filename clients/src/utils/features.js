// utils/features.js
// Control features via .env — all default to TRUE if env var is missing

const flag = (key, fallback = true) => {
  const val = import.meta.env[key];
  if (val === undefined || val === '') return fallback;
  return val === 'true';
};

export const features = {
  deleteOwnMessage: flag('VITE_FEATURE_DELETE_OWN_MESSAGE'),
  deleteForEveryone: flag('VITE_FEATURE_DELETE_FOR_EVERYONE'),
  fileUpload: flag('VITE_FEATURE_FILE_UPLOAD'),
  deleteContact: flag('VITE_FEATURE_DELETE_CONTACT'),
  groupChat: flag('VITE_FEATURE_GROUP_CHAT'),
  typingIndicator: flag('VITE_FEATURE_TYPING_INDICATOR'),
  messageSeenStatus: flag('VITE_FEATURE_MESSAGE_SEEN_STATUS'),
};
