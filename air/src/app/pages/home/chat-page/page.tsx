'use client'

import { useState, useEffect } from "react";
import { useUserData } from "../layout"
import RecentChats from "./recent-chats/page";
import ChatWindow from "./chat-window/page";
export default function Chat() {
    let {  selectedUser } = useUserData();

  
//   return <div className="flex max-h-[90vh] h-full w-full justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-blue-300 font-extralight text-5xl shadow-lg rounded-lg overflow-hidden">
//   <div className="flex w-full h-full gap-4 p-4">
//     {/* Sidebar: Recent Chats */}
//     <div className="w-[30%] bg-gray-850 rounded-lg shadow-inner overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-700">
//       <RecentChats />
//     </div>

//     {/* Main Chat Window */}
//     <div className="w-[70%] h-full bg-gray-900 rounded-lg shadow-inner flex flex-col overflow-hidden">
//       <ChatWindow />
//     </div>
//   </div>
// </div>

return <div className="flex max-h-[90vh] h-full w-full justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-blue-300 font-extralight text-5xl shadow-lg rounded-lg overflow-hidden">
      <div className="flex w-full h-full gap-4 p-4 relative overflow-hidden">
        
        {/* Recent Chats (always visible on desktop, toggles on mobile) */}
        <div
          className={`w-full sm:w-[30%] bg-gray-850 rounded-lg shadow-inner overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-700 z-10 transition-transform duration-500 ease-in-out 
          ${selectedUser ? "translate-x-[-110%] sm:translate-x-0" : "translate-x-0"}`}
        >
          <RecentChats />
        </div>

        {/* Chat Window (slides in on mobile) */}
        <div
          className={`absolute sm:relative top-0 left-0 w-full sm:w-[70%] h-full bg-gray-900 rounded-lg shadow-inner flex flex-col transition-transform duration-500 ease-in-out 
          ${selectedUser ? "translate-x-0" : "translate-x-full sm:translate-x-0"}`}
        >
          <ChatWindow />
        </div>
      </div>
    </div>

} 