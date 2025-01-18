import io from "socket.io-client";

export const socket = io("https://natalias-kitchen-backend.vercel.app", {
  withCredentials: true,
});
