// src/pages/api/socket.ts
import { Server as IOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io?: IOServer;
    };
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (res.socket.server.io) {
    console.log("✅ Socket.IO server already running");
    res.end();
    return;
  } 

  console.log("🆕 Setting up new Socket.IO server");

  const io = new IOServer(res.socket.server, {
    path: "/api/socket",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);
    
    socket.on("send-message", (message) => {
      console.log(" client connected:", socket.id);
      console.log("📨 Message received:", message, " from ", socket.id);

      socket.emit("receive-message", message);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  res.end();
}
