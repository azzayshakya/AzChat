import { useEffect, useRef, useCallback } from "react";

export function useNotification() {
  const audioRef = useRef(null);

  // ── Build a short "ding" sound via Web Audio API (no file needed) ──
  //   const playSound = useCallback(() => {
  //     try {
  //       const ctx = new (window.AudioContext || window.webkitAudioContext)();

  //       // Primary tone
  //       const osc = ctx.createOscillator();
  //       const gain = ctx.createGain();
  //       osc.connect(gain);
  //       gain.connect(ctx.destination);

  //       osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
  //       osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15); // drop to A4

  //       gain.gain.setValueAtTime(0.3, ctx.currentTime);
  //       gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

  //       osc.start(ctx.currentTime);
  //       osc.stop(ctx.currentTime + 0.4);

  //       // Close context after sound finishes
  //       setTimeout(() => ctx.close(), 500);
  //     } catch (err) {
  //       console.warn("Audio failed:", err);
  //     }
  //   }, []);
  const playSound = useCallback(() => {
    const audio = new Audio("/notification.mp3");
    audio.volume = 1;
    audio.play().catch(() => {}); // catch autoplay block silently
  }, []);

  // ── Request notification permission on mount ───────────────────────
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // ── Show OS notification + play sound ─────────────────────────────
  const notify = useCallback(
    ({ title, body, icon }) => {
      // Always play sound
      playSound();

      // Only show OS popup if tab is not focused
      if (document.visibilityState === "visible") return;

      if ("Notification" in window && Notification.permission === "granted") {
        const n = new Notification(title, {
          body,
          icon: icon || "/favicon.ico",
          badge: "/favicon.ico",
          tag: "chat-message", // replaces previous notif instead of stacking
          renotify: true, // still plays sound even if tag matches
        });

        // Auto-close after 5 seconds
        setTimeout(() => n.close(), 5000);

        // Focus the tab when user clicks notification
        n.onclick = () => {
          window.focus();
          n.close();
        };
      }
    },
    [playSound],
  );

  return { notify, playSound };
}
// import { useEffect, useRef, useCallback } from "react";

// export function useNotification() {
//   const ctxRef = useRef(null);
//   const unlockedRef = useRef(false);

//   // ── Unlock audio on first user gesture (click/keydown anywhere) ──────
//   useEffect(() => {
//     const unlock = () => {
//       if (unlockedRef.current) return;
//       try {
//         const ctx = new (window.AudioContext || window.webkitAudioContext)();
//         // Resume it immediately — this satisfies the browser's autoplay policy
//         ctx.resume().then(() => {
//           ctxRef.current = ctx;
//           unlockedRef.current = true;
//           console.log("🔊 Audio unlocked");
//         });
//       } catch (e) {
//         console.warn("AudioContext failed:", e);
//       }
//     };

//     // Any interaction unlocks it — login clicks, typing, etc.
//     window.addEventListener("click", unlock, { once: true });
//     window.addEventListener("keydown", unlock, { once: true });

//     return () => {
//       window.removeEventListener("click", unlock);
//       window.removeEventListener("keydown", unlock);
//     };
//   }, []);

//   const playSound = useCallback(() => {
//     const ctx = ctxRef.current;

//     if (!ctx || !unlockedRef.current) {
//       console.warn("🔇 Audio not unlocked yet — user hasn't interacted");
//       return;
//     }

//     try {
//       // ── Clean "ding" using Web Audio — no file needed ──────────────
//       const osc = ctx.createOscillator();
//       const gain = ctx.createGain();
//       osc.connect(gain);
//       gain.connect(ctx.destination);

//       osc.type = "sine";
//       osc.frequency.setValueAtTime(880, ctx.currentTime);
//       osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);

//       gain.gain.setValueAtTime(0.4, ctx.currentTime);
//       gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

//       osc.start(ctx.currentTime);
//       osc.stop(ctx.currentTime + 0.5);

//       console.log("🔔 Sound played");
//     } catch (err) {
//       console.warn("playSound error:", err);
//     }
//   }, []);

//   // ── Request OS notification permission on mount ──────────────────────
//   useEffect(() => {
//     if ("Notification" in window && Notification.permission === "default") {
//       Notification.requestPermission();
//     }
//   }, []);

//   const notify = useCallback(
//     ({ title, body }) => {
//       playSound(); // always play sound

//       // OS popup only when tab is not visible
//       if (document.visibilityState !== "visible") {
//         if ("Notification" in window && Notification.permission === "granted") {
//           const n = new Notification(title, {
//             body,
//             icon: "/favicon.ico",
//             tag: "chat-message",
//             renotify: true,
//           });
//           setTimeout(() => n.close(), 5000);
//           n.onclick = () => {
//             window.focus();
//             n.close();
//           };
//         }
//       }
//     },
//     [playSound],
//   );

//   return { notify, playSound };
// }
