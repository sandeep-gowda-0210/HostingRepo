'use client'
import React, { createContext, useContext, useEffect, useState } from "react";
import socket from "@/utils/socket";
import Layout from "@/components/layout/Layout";

export type User = {
  user_id: string;
  user_name: string;
  first_name: string;
  last_name: string;
  email_id: string;
  profile_url: string;
  status: string;
  bio: string;
};

export type Contact = {
  user_id: string;
  user_name: string;
  email_id: string;
  profile_url: string;
  notification_status: Boolean;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  selectedUser: Contact | null;
  setSelectedUser: (selectedUser: Contact | null) => void;
  refreshRecentChatFlag: Boolean;
  triggerRefreshRecentChat: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserData = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<Boolean>(true);
  const [selectedUser, setSelectedUser] = useState<Contact | null>(null);
  const [refreshRecentChatFlag, setRefreshRecentChatFlag] = useState<Boolean>(true);

  const triggerRefreshRecentChat = () => setRefreshRecentChatFlag((prev) => !prev);

  const fetchData = async () => {
    try {
      const userData = await fetch('/api/userauth/getuser');
      const { profile_data: userdata } = await userData.json();
      if (userdata && userdata[0]) {
        setUser(userdata[0]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("receive-message", (msg) => {
      console.log("📥 Received:", msg);
    });

    const initSocket = async () => {
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

    initSocket();

    return () => {
      isMounted = false;
      socket.off("connect");
      socket.off("receive-message");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex w-full h-screen justify-center items-center bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 text-5xl font-semibold text-blue-500 select-none animate-pulse">
        Loading...
      </div>
    );
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        refreshUser: fetchData,
        selectedUser,
        setSelectedUser,
        refreshRecentChatFlag,
        triggerRefreshRecentChat,
      }}
    >
        <div className="max-h-[100vh] bg-[#121212] text-blue-300">
        
            <Layout user={user}>{children}</Layout>
          </div>
    </UserContext.Provider>
  );
};
