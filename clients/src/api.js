import axios from 'axios';
import { io } from 'socket.io-client';

const BASE = import.meta.env.VITE_API_URL;

// Axios instance
export const api = axios.create({
  baseURL: BASE + '/api',
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem('chat_token'));

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let socket;

export function getSocket() {
  const token = JSON.parse(localStorage.getItem('chat_token'));

  // Create socket only once
  if (!socket) {
    socket = io(BASE || window.location.origin, {
      transports: ['websocket'],

      // JWT socket auth
      auth: {
        token,
      },
    });
  }

  return socket;
}
