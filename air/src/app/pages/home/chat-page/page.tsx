'use client'

import socket from "@/utils/socket";
import { useState, useEffect } from "react";
import { useUserData } from "../layout"
import RecentChats from "./recent-chats/page";
import ChatWindow from "./chat-window/page";
export default function Chat() {
  let { user } = useUserData();
  let [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    const savedUser: { email?: string } = JSON.parse(localStorage.getItem('user') || '{}');
    if (savedUser["email"]) {
      setEmail(savedUser["email"]);
    }

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
      socket.emit("send-message", "Test from client");
    });


    socket.on("receive-message", (msg) => {
      console.log("📥 Received:", msg);
    });


    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("receive-message");
      socket.disconnect();
    };
  }, [])
  return <div className="flex h-full w-full justify-center text-5xl text-blue-300 font-extralight">
    <div className="flex w-full">
      <div className="w-[30%] border-2">
        <RecentChats />
      </div>
      <div className=" w-[70%] border-2">
        <ChatWindow />
      </div>
    </div>
  </div>
}