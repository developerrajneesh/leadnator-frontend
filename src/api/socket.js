// Socket.IO client — singleton. Auto-connects with the stored JWT and
// auto-reconnects. Callers subscribe with `onSocket(event, handler)` which
// returns an unsubscribe function.
//
// Usage:
//   import { onSocket, getSocket } from "../../api/socket";
//   useEffect(() => onSocket("wa.inbound", (p) => {...}), []);

import { io } from "socket.io-client";
import { getToken } from "./client";

const BASE = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/api\/?$/, "");

let socket = null;

export function getSocket() {
  if (socket) return socket;
  const token = getToken();
  if (!token) return null;

  socket = io(BASE, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on("connect",     () => console.log("[socket] connected", socket.id));
  socket.on("disconnect",  (r) => console.log("[socket] disconnected", r));
  socket.on("connect_error", (e) => console.warn("[socket] connect_error", e.message));
  socket.on("ready",       (d) => console.log("[socket] ready", d));

  return socket;
}

export function onSocket(event, handler) {
  const s = getSocket();
  if (!s) return () => {};
  s.on(event, handler);
  return () => s.off(event, handler);
}

export function disconnectSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}
