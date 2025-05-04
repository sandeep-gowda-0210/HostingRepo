import React, { useEffect, useState, useContext } from 'react'
import type { Contact } from '../../layout';
import { useUserData } from '../../layout';
function RecentChats() {
  let [contacts, setContacts] = useState<Contact[] | null>(null);
  let [loading, setLoading] = useState<Boolean>(true);
  let {selectedUser, setSelectedUser } = useUserData();
  const fetchContacts = async () => {
    try {
      let contactdata = await fetch("/api/chatservice/getContacts", {
        method: "GET",
      });
      const { contactList } = await contactdata.json();
      if (contactList) {
        {
          setContacts(contactList);
          setLoading(false);
        }
      }
    }
    catch (error) {
      console.error("Error fetching contacts:", error);
    }
    finally {
      setLoading(false);
    }

  }
  const handleContactClick = (contact: Contact) => {
    console.log("Clicked on contact:", contact);
    setSelectedUser(contact);
  };
  useEffect(() => {
    fetchContacts();
  },[]);
  return (
    <div className="p-4 pb-0 h-full box-border flex flex-col">
      <h2 className="text-lg font-semibold h-fit">Recent Chats</h2>
      <div className="mt-4 border rounded p-4 h-full overflow-y-auto">
        {loading ? (
          <div>Loading...</div>
        ) : contacts===null || contacts.length === 0 ? (
          <div>No contacts found.</div>
        ) : (
          <ul className="space-y-3">
            {contacts.map((contact) => (
              <li
                key={contact.user_id}
                onClick={() => handleContactClick(contact)}
                className={`flex items-center space-x-3 p-2 rounded hover:bg-gray-400 ${selectedUser?.user_id==contact.user_id?"bg-gray-200":null}  transition-all hover:ease-in-out duration-500 cursor-pointer`}>
                <img
                  src={contact.profile_url}
                  alt={`${contact.user_name}'s profile`}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-medium">{contact.user_name}</div>
                  <div className="text-xs text-gray-500">{contact.email_id}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default RecentChats