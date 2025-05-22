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
  let {selectedUser, setSelectedUser,refreshRecentChatFlag, user,triggerRefreshRecentChat} = useUserData();
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
    if(user?.user_id){
    let users={sender_id:contact.user_id,receiver_id:user.user_id}
    socket.emit("notification-seen",users);
    }
  };
  useEffect(() => {
    socket.on("activeUsers",async(activeUserIds)=>{
      console.log("Active users",(activeUserIds));
      setActiveUsers(activeUserIds);
    })
    socket.on("refresh-recents",async()=>{
      await triggerRefreshRecentChat()
    })
    fetchContacts();
    return ()=>{
      socket.off("refresh-recents");
      socket.off("activeUsers");
    }
  },[refreshRecentChatFlag]);

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
    <div className="p-4 pt-0 pb-0 h-full box-border flex flex-col">
  
      
  
      <div className="border rounded  pt-0  max-h-full h-full overflow-y-auto">
        <h2 className="text-lg font-semibold h-fit mt-6 text-center border-b-1 pb-5 w-full rounded-0">Recent Chats</h2>
        <div className='p-4 pt-0'>
        {/* <input
        type="text"
        placeholder="Search contacts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className=" mb-4 p-1 border w-full border-gray-300 text-sm rounded focus:outline-none focus:ring focus:border-blue-300"
      /> */}
      <input
        type="text"
        placeholder="Search contacts..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="mb-4 p-1 border w-full border-gray-300 text-sm rounded focus:outline-none focus:ring focus:border-blue-300"
      />
        {recentLoading ? (
          <div className='h-full w-full pt-30 flex justify-center items-center'><CircularLoader/></div>
        ) : contacts === null || contacts.length === 0 ? (
          <div>No contacts found.</div>
        ) : (
          <ul className="space-y-3">
            {contacts && contacts
              .filter((contact) =>
                contact.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.email_id.toLowerCase().includes(searchTerm.toLowerCase())
              )
              // .sort((a, b) =>
              //   a.user_name.toLowerCase().localeCompare(b.user_name.toLowerCase())
              // )
              .map((contact) => (
                <li
                  key={contact.user_id}
                  onClick={() => handleContactClick(contact)}
                  className={`flex items-center justify-between pr-5 space-x-3 p-2 rounded hover:bg-gray-400  transition-all ${contact.user_id === user?.user_id ? selectedUser?.user_id === contact.user_id ? "bg-gray-200":"bg-[#2c2a45]":null} ${selectedUser?.user_id === contact.user_id ? "bg-gray-200":""} hover:ease-in-out duration-300 cursor-pointer overflow-hidden `}
                >
                  <div className={`flex items-center space-x-3 p-2 rounded overflow-hidden `}
                >
                  <img
                    src={contact.profile_url}
                    alt={`${contact.user_name}'s profile`}
                    className={`w-10 h-10 rounded-full object-cover ${(activeUsers.includes(contact.user_id)) ? "border-3 border-green-400":null}`}
                  />
                  <div>{
                    contact.user_id !== user?.user_id?<><div className="text-sm font-medium">{contact.user_name}</div>
                    <div className="text-xs text-gray-500">{contact.email_id}</div></>:<><div className="text-sm font-medium">Myself</div><div className="text-xs text-gray-500">{contact.user_name}</div></>
                    }
                  </div>
                  </div>
                    {contact.notification_status?<div className='h-3 w-3 rounded-full bg-red-400 border-gray-600 border-2'></div>:null}
                </li>
              ))}
          </ul>
        )}
      </div>
      </div>
    </div>
  );
  
}

export default RecentChats