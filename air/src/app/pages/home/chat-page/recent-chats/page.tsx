'use client'

import React, { useEffect, useState, useContext } from 'react'
import type { Contact } from '../../layout';
import { useUserData } from '../../layout';
import socket from '@/utils/socket';
import { CircularLoader } from '@/components/loader/Loader';
export const playNotificationSound = () => {
  const notificationSound = new Audio("/resources/tap-notification.mp3");
  notificationSound.play().catch(err => {
    console.error("Audio play failed:", err);
  });
};

function RecentChats() {
  let [contacts, setContacts] = useState<Contact[] | null>(null);
  let [recentLoading, setrecentLoading] = useState<Boolean>(true);
  let [activeUsers, setActiveUsers] = useState<string[]>([]);
  let { selectedUser, setSelectedUser, refreshRecentChatFlag, user, triggerRefreshRecentChat } = useUserData();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchContacts = async () => {
    try {
      let contactdata = await fetch("/api/chatservice/getContacts", {
        method: "GET",
      });
      const { contactList } = await contactdata.json();
      console.log("received contact list", contactList);

      if (contactList) {
        {
          setContacts(contactList);
        }
      }
    }
    catch (error) {
      console.error("Error fetching contacts:", error);
    }
    finally {
      setrecentLoading(false);
    }

  }
  const handleContactClick = (contact: Contact) => {
    // console.log("Clicked on contact:", contact);

    setSelectedUser(contact);
    socket.emit("refreshActiveUsers");
    if (user?.user_id) {
      let users = { sender_id: contact.user_id, receiver_id: user.user_id }
      socket.emit("notification-seen", users);
    }
  };
  useEffect(() => {
    socket.on("activeUsers", async (activeUserIds) => {
      console.log("Active users", (activeUserIds));
      setActiveUsers(activeUserIds);
    })
    socket.on("refresh-recents", async () => {
      await triggerRefreshRecentChat()
    })
    fetchContacts();
    return () => {
      socket.off("refresh-recents");
      socket.off("activeUsers");
    }
  }, [refreshRecentChatFlag]);

  const handleSearch = async (searchTerm: string) => {
    setSearchTerm(searchTerm);

    if (searchTerm.trim() === "") {
      fetchContacts();
      return;
    }

    try {
      const res = await fetch(`/api/chatservice/searchUser?query=${searchTerm}`, {
        method: "GET",
      });

      const { users } = await res.json();

      if (Array.isArray(users)) {
        setContacts(users);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };


  return (
    <div className="p-4 h-full flex flex-col bg-[#1e1e2f] text-white rounded-lg shadow-lg border border-gray-700">
  <h2 className="text-xl font-semibold text-center mt-2 pb-4 border-b border-gray-700">Recent Chats</h2>

  <input
    type="text"
    placeholder="Search contacts..."
    value={searchTerm}
    onChange={(e) => handleSearch(e.target.value)}
    className="my-4 px-4 text-lg py-2 bg-[#2a2a3d] text-white placeholder-gray-400 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
  />

  <div className="overflow-y-auto flex-1 pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
    {recentLoading ? (
      <div className='h-full w-full pt-10 flex justify-center items-center'><CircularLoader /></div>
    ) : contacts === null || contacts.length === 0 ? (
      <div className='text-lg text-center text-gray-400'>No contacts found...</div>
    ) : (
      <ul className="space-y-2">
        {contacts && contacts.filter((contact) =>
          contact.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email_id.toLowerCase().includes(searchTerm.toLowerCase())
        ).map((contact) => {
          const isSelected = selectedUser?.user_id === contact.user_id;
          const isSelf = contact.user_id === user?.user_id;

          return (
            <li
              key={contact.user_id}
              onClick={() => handleContactClick(contact)}
              className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all 
                ${isSelected ? "bg-[#3a3a4f]" : "hover:bg-[#2f2f44]"} 
                `}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={contact.profile_url}
                  alt={`${contact.user_name}'s profile`}
                  className={`w-10 h-10 rounded-full object-cover 
                    ${activeUsers.includes(contact.user_id) ? "ring-2 ring-green-500" : "ring-2 ring-transparent"}`}
                />
                <div className="overflow-hidden">
                  <div className="text-sm font-medium truncate">
                    {isSelf ? contact.user_name+" (You)" : contact.email_id}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {isSelf ? contact.user_name : contact.email_id}
                  </div>
                </div>
              </div>
              {contact.notification_status && (
                <span className="h-3 w-3 rounded-full bg-red-500 border-2 border-gray-800"></span>
              )}
            </li>
          );
        })}
      </ul>
    )}
  </div>
</div>
  );

}

export default RecentChats