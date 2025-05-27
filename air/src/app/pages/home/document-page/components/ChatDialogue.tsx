'use client'

import React, { useState } from 'react';
import socket from '@/utils/socket';
import { useUserData } from '@/context/UserContext';
import { shareDocuments } from '../utils/api';

type ChatDialogueProps = {
  isOpen: boolean;
  onClose: () => void;
  onUserSelect: (userId: string) => void;
  fileToSend: string | null;
};

type User = {
  user_id: string;
  user_name: string;
  email_id: string;
  profile_url: string;
};

const ChatDialogue = ({ isOpen, onClose, onUserSelect, fileToSend }: ChatDialogueProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useUserData();

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    if (!query.trim()) return setUsers([]);

    try {
      const res = await fetch(`/api/chatservice/searchUser?query=${query}`);
      const { users } = await res.json();
      setUsers(users);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleUserSelect = async (selectedUser: User) => {
    onUserSelect(selectedUser.user_id);
    onClose();

    if (fileToSend && user?.user_id) {
      console.log("file to send", fileToSend);
      try {
        console.log("user id", user.user_id, selectedUser.user_id);
        
        const data = await shareDocuments(fileToSend, user.user_id, selectedUser.user_id);
        console.log("inside user select ",data);
        
        socket.emit('refresh-recents');
      } catch (err) {
        console.error('File send error:', err);
      }
    }

  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-zinc-900 text-white rounded-lg w-full max-w-md p-6 shadow-xl border border-zinc-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Select User to Send File</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xl font-bold">&times;</button>
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full p-2 mb-4 border border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500 rounded"
        />
        <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800">
          {users.map((u) => (
            <div
              key={u.user_id}
              onClick={() => handleUserSelect(u)}
              className="flex items-center p-2 hover:bg-zinc-800 cursor-pointer rounded transition-colors"
            >
              <img src={u.profile_url} alt="profile" className="w-8 h-8 rounded-full mr-3" />
              <div>
                <div className="font-medium text-sm">
                  {u.user_id === user?.user_id ? 'Myself' : u.user_name}
                </div>
                <div className="text-xs text-zinc-400">{u.email_id}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatDialogue;
