'use client'

import socket from "@/utils/socket";
import { useState, useEffect } from "react";
import { useUserData } from "../layout"
import RecentChats from "./recent-chats/page";
import ChatWindow from "./chat-window/page";
export default function Chat() {
  const initSocket = async (isMounted:Boolean) => {
    try {
      const res = await fetch('/api/socket');
      if (res.ok && isMounted) {
        console.log("✅ Socket API route initialized");
        socket.connect();
      }
    } catch (error) {
      console.error("❌ Failed to fetch /api/socket:", error);
    }
  };
  useEffect(() => {
    let isMounted:Boolean = true;

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });


    socket.on("receive-message", (msg) => {
      console.log("📥 Received:", msg);
    });

    // fetch('/api/socket').then(()=>{socket.connect()});
    initSocket(isMounted);

    

    return () => {
      socket.off("connect");
      socket.off("receive-message");
      socket.disconnect();
    };
  }, [])
  return <div className="flex h-full w-full justify-center text-5xl text-blue-300 font-extralight">
    <div className="flex w-full h-full">
      <div className="w-[30%]">
        <RecentChats />
      </div>
      <div className=" w-[70%] h-full">
        <ChatWindow />
      </div>
    </div>
  </div>
} 