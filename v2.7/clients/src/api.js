import axios from "axios";
import { io } from "socket.io-client";

const BASE = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: BASE + "/api",
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem("chat_token"));

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let socket = null;

// Create single socket instance
export function getSocket() {
  const token = JSON.parse(localStorage.getItem("chat_token"));

  // Reuse existing connected socket
  if (socket?.connected) {
    return socket;
  }

  // Disconnect old broken socket
  if (socket) {
    socket.disconnect();
  }

  socket = io(BASE || window.location.origin, {
    transports: ["websocket"],

    autoConnect: true,

    auth: {
      token,
    },
  });

  return socket;
}
