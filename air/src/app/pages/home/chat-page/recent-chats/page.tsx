import React, { useEffect, useState } from 'react'
type Contact = {
  user_id: string;
  user_name: string;
  email_id: string;
};

function RecentChats() {
  let [contacts, setContacts] = useState<Contact[] | null>(null);
  let [loading, setLoading] = useState<Boolean>(true);

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
  useEffect(() => {
    fetchContacts();
  },[]);
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Recent Chats</h2>
      <div className="mt-4 border rounded p-4">
        {loading ? (
          <div>Loading...</div>
        ) : contacts === null || contacts.length === 0 ? (
          <div>No contacts found.</div>
        ) : (
          <ul>
            {contacts.map((contact) => (
              <li key={contact.user_id} className="mb-2 ">
                <div className="text-sm font-medium">{contact.user_name}</div>
                <div className="text-xs text-gray-500">{contact.email_id}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default RecentChats