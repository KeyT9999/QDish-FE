import { io, Socket } from 'socket.io-client';

import { getAuthToken } from './api';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

let socket: Socket | null = null;
let socketToken: string | null = null;

export const getRealtimeSocket = () => {
  const token = getAuthToken();
  if (!token) return null;

  if (socket && socketToken === token) {
    return socket;
  }

  socket?.disconnect();
  socketToken = token;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 600,
    reconnectionDelayMax: 5000,
  });

  return socket;
};

export const disconnectRealtimeSocket = () => {
  socket?.disconnect();
  socket = null;
  socketToken = null;
};
