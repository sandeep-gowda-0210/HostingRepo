'use client';
import { useEffect, useState, useRef } from 'react';
import socket from '@/utils/socket';
import { useUserData } from '../../layout';
export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  status?:string;
  created_at?:Timestamp;
  time_stamp?:Timestamp;
};
import type { Contact } from '../../layout';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';

function ChatWindow() {
  let {user,selectedUser} = useUserData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
      setCurrentUserId(user?.user_id||null);
  }, [user]);
  useEffect(() => {
    socket.on('receive-message', (message: Message) => {
      if (
        (message.sender_id === selectedUser?.user_id && message.receiver_id === currentUserId) ||
        (message.sender_id === currentUserId && message.receiver_id === selectedUser?.user_id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off('receive-message');
    };
  }, [selectedUser]);

  useEffect(() => {
    const loadMessages = async () => {
      setMessages([]);
      if (!currentUserId || !selectedUser?.user_id) return;

      try {
        const params = new URLSearchParams({
          from: currentUserId,
          to: selectedUser.user_id,
        });
        
        const res = await fetch(`/api/chatservice/getMessages?${params.toString()}`);
        const data = await res.json();
        setMessages(data.messages);
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    loadMessages();
  }, [currentUserId, selectedUser?.user_id]);


  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser || !currentUserId) return;

    let messagePayload:Partial<Message> = {
      sender_id: currentUserId,
      receiver_id: selectedUser.user_id,
      content: newMessage,
      // timestamp: new Date().toISOString()
    };

    socket.emit('send-message', messagePayload);

    let messagePayload_1:Message={
      id: Math.random().toString(),
      sender_id: currentUserId,
      receiver_id: selectedUser.user_id,
      content: newMessage,
    }

    setMessages((prev) => [...prev, { ...messagePayload_1}]);
    setNewMessage('');
  };

  return (!selectedUser || !socket.id? <div className='flex justify-center items-center h-full border-2 rounded-2xl'>No chat Selected</div>: <div className="flex flex-col h-full border rounded shadow">
    {/* Top Bar */}
    <div className="flex items-center p-4 border-b bg-blend-darken">
      <img
        src={selectedUser.profile_url}
        alt="Profile"
        className="w-9 h-10 rounded-full mr-3"
      />
      <h2 className="text-lg font-semibold">{selectedUser.user_name}</h2>
    </div>

    {/* Messages */}
    <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-blend-darken">
      {messages.length === 0 ? (
        <div className="text-gray-500 text-3xl flex h-full w-full justify-center items-center">No messages yet</div>
      ) : (
        messages.map((msg,index) => (
          <div
            key={index}
            className={`max-w-[75%] w-fit p-2 rounded-lg text-sm ${
              msg.sender_id === currentUserId
                ? 'bg-[#414141] self-end ml-auto text-right'
                : 'bg-[#323332] self-start mr-auto'
            }`}
          >
            <div >{msg.content}</div>
            {/* <div className="text-[10px] text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div> */}
          </div>
        ))
      )}
    </div>

    {/* Bottom Bar */}
    <div className="p-3 border-t bg-[#4b4949] flex items-center">
      <input
        type="text"
        className="flex-1 text-lg border rounded px-3 py-1 mr-2 bg-transparent outline-0"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button
        onClick={handleSend}
        className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        <svg width="30" height="30" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.20308 1.04312C1.00481 0.954998 0.772341 1.0048 0.627577 1.16641C0.482813 1.32802 0.458794 1.56455 0.568117 1.75196L3.92115 7.50002L0.568117 13.2481C0.458794 13.4355 0.482813 13.672 0.627577 13.8336C0.772341 13.9952 1.00481 14.045 1.20308 13.9569L14.7031 7.95693C14.8836 7.87668 15 7.69762 15 7.50002C15 7.30243 14.8836 7.12337 14.7031 7.04312L1.20308 1.04312ZM4.84553 7.10002L2.21234 2.586L13.2689 7.50002L2.21234 12.414L4.84552 7.90002H9C9.22092 7.90002 9.4 7.72094 9.4 7.50002C9.4 7.27911 9.22092 7.10002 9 7.10002H4.84553Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
      </button>
    </div>
  </div>
  );
}

export default ChatWindow;