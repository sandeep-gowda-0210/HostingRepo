'use client'
import React, { useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import { useEffect,createContext,useContext } from "react";
import Layout from "@/components/layout/Layout";
export type User={
  user_id:string,
  user_name:string,
  first_name:string,
  last_name:string,
  email_id:string,
  profile_url:string,
  status:string,
  bio:string
}

type UserContextType={
  user:User|null,
  setUser:(user:User|null)=>void;
  refreshUser:() => Promise<void>,
  selectedUser: Contact|null,
  setSelectedUser:(selectedUser:Contact|null)=>void;
}
export type Contact = {
  user_id: string;
  user_name: string;
  email_id: string;
  profile_url: string;
};

const UserContext = createContext<UserContextType>({
  user:null,
  setUser:()=>{},
  refreshUser: async () => {},
  selectedUser:null,
  setSelectedUser:async ()=>{}
});

export default function Home({children}:{children: React.ReactNode}){
  const [user,setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState<Boolean>(true);
  const [selectedUser,setSelectedUser] = useState<Contact|null>(null);


  const fetchData = async()=>{
    try{
    const userData = await fetch('/api/userauth/getuser',{
      method:'GET',
      headers:{'Content-Type':'application/json'},
      cache:'no-store',
    })
    const {profile_data:userdata} =await userData.json();
    if(userdata){{
      setUser(userdata[0]);
      setLoading(false);
    } 
  }
}
  catch(error){
    console.log(error);
    
  }
}
useEffect(()=>{
  fetchData();
  },[])

  return <UserContext.Provider value={{user,setUser,refreshUser:fetchData,setSelectedUser,selectedUser}}>
    {/* <Navbar/> */}
    {loading?<div className="flex w-full h-screen justify-center items-center text-6xl font-bold text-gray-400">Loading....</div>:<div>
    {/* <div className="flex w-full justify-center h-[5rem] items-center text-2xl font-bold text-gray-400">
    
      Welcome {user?.first_name}</div> */}
    {/* { children } */}
    <Layout user={user}>{children}</Layout>
    </div>
    }
  </UserContext.Provider>
}

export const useUserData = ()=> useContext(UserContext);