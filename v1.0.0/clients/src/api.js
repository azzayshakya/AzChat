import axios from "axios";
import { io } from "socket.io-client";

export const api = axios.create({
  baseURL: "/api",
});

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(window.location.origin, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      autoConnect: false, // ← don't connect until we call .connect()
    });
  }
  return socket;
}

export function connectSocket(userId) {
  const s = getSocket();

  if (!s.connected) {
    s.connect();
  }

  // always re-register on connect (handles reconnects too)
  s.off("connect"); // remove old listener first
  s.on("connect", () => {
    console.log("🟢 Socket connected:", s.id);
    s.emit("register", userId);
  });

  // if already connected, register immediately
  if (s.connected) {
    s.emit("register", userId);
  }

  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
