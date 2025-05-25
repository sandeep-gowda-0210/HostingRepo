// src/pages/api/socket.ts
import { Server as IOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import { pushMessage, setUserFriendListNotification } from "@/services/chatService";

import type { Message } from "@/app/pages/home/chat-page/chat-window/page";
import { getUser } from "@/services/authService";
import { setSocketServer, setUserSocket, getUserSocketMap, removeUserSocket } from "@/utils/socketStore";
import { assert_generate_autoreply, autoReplyOllama } from "@/services/autoReplyService";
import { shareFiles } from "@/services/documentService";
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
    setSocketServer(res.socket.server.io);
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
    pingTimeout: 20000,
    maxHttpBufferSize: 1e8,
    perMessageDeflate: false,
  });


  io.on("connection", async (socket) => {
    try {
      const token = extractToken(socket);
      if (!token) return logAuthError(socket.id);

      const { data, error } = await getUser(token);
      const user = data?.[0];
      if (!user || error) return logUserError(error);

      const userId = user.user_id;
      setUserSocket(userId, socket.id);

      console.log(`✅ User ${userId} connected with socket ${socket.id}`);
      console.log("🔌 New client connected:", socket.id);

      socket.on("refreshActiveUsers", () => {
        const activeUserIds = Array.from(getUserSocketMap().keys());
        io.emit("activeUsers", activeUserIds)
      });
       const activeUserIds = Array.from(getUserSocketMap().keys());
      console.log(activeUserIds);

      io.emit("activeUsers", activeUserIds)
      socket.on("send-message", async (message: Message) => {
        await handleSendMessage(socket, token, message);
      });

      socket.on("notification-seen", async (users) => {
        console.log("entered notification seen");
        let output = await setUserFriendListNotification(token, users.sender_id, users.receiver_id);
        // console.log(output );
        socket.emit("refresh-recents");
      })
      socket.on("document-share", async (data) => {
        let {data:sharedData,error} = await shareFiles(data.id,data.user_id,data.receiver_id,token);
        if(error!==null){
          console.log("Error sending doument to user ");
          
        }
          const receiverSocketId = getUserSocketMap().get(data.receiver_id);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("receive-message", sharedData);
          }
      })

      socket.on("disconnect", () => {
        removeUserSocket(userId);
        const activeUserIds = Array.from(getUserSocketMap().keys());
        io.emit("activeUsers", activeUserIds)

        console.log(`❌ User ${userId} disconnected`);
        console.log("❌ Client disconnected:", socket.id);
      });
    } catch (err) {
      console.error("🔥 Socket connection error:", err);
    }
  });
  res.socket.server.io = io;
  setSocketServer(res.socket.server.io);
  res.end();





  function extractToken(socket: any): string | null {
    const cookieHeader = socket.handshake.headers.cookie || "";
    const cookies = parse(cookieHeader);
    return cookies["login-token"] || null;
  }


  async function handleSendMessage(socket: any, token: string, message: Message) {
    console.log("📨 Message received from:", socket.id);

    const {data:pushedData,error:pushedError} = await pushMessage(token, message);
    socket.emit("sent-message");

    if (pushedError) {
      return console.error("❌ Error pushing message:", pushedError);
    }

    const receiverSocketId = getUserSocketMap().get(message.receiver_id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-message", message);
    }

    if (message.type === "text" && message.receiver_id!==message.sender_id) {
      await handleAutoReply(socket, token, message, receiverSocketId);
    }
  }

  async function handleAutoReply(
    socket: any,
    token: string,
    originalMessage: Message,
    receiverSocketId?: string
  ) {
    const { data: reply, error } = await assert_generate_autoreply(
      token,
      originalMessage.sender_id,
      originalMessage.receiver_id,
      originalMessage.content
    );

    if (error || !reply) {
      return console.warn("🤖 Auto-reply not generated:", error);
    }

    const replyMessage: Message = {
      ...originalMessage,
      content: reply,
      sender_id: originalMessage.receiver_id,
      receiver_id: originalMessage.sender_id,
    };

    socket.emit("receive-message", replyMessage);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-message", replyMessage);
      console.log("📤 Auto-reply sent to:", receiverSocketId);
    }
  }




  function logAuthError(socketId: string) {
    console.error(`🚫 Authentication failed for socket: ${socketId}`);
  }

  function logUserError(error: any) {
    console.error("❌ User profile not found or DB error:", error);
  }
}


