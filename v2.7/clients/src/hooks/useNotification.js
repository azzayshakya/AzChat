import { useEffect, useRef, useCallback } from "react";

export function useNotification() {
  const audioRef = useRef(null);

  const playSound = useCallback(() => {
    const audio = new Audio("/notification.mp3");
    audio.volume = 1;
    audio.play().catch(() => {});
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const notify = useCallback(
    ({ title, body, icon }) => {
      playSound();

      if (document.visibilityState === "visible") return;

      if ("Notification" in window && Notification.permission === "granted") {
        const n = new Notification(title, {
          body,
          icon: icon || "/favicon.ico",
          badge: "/favicon.ico",
          tag: "chat-message",
          renotify: true,
        });

        setTimeout(() => n.close(), 5000);

        n.onclick = () => {
          window.focus();
          n.close();
        };
      }
    },
    [playSound]
  );

  return { notify, playSound };
}
