'use client'
import { useState, useEffect } from "react";
import { useUserData } from "../layout"

export default function Chat(){
    let {user} = useUserData();
    let [email, setEmail] = useState<string|null>(null);
    useEffect(()=>{
        const savedUser:{email?:string} = JSON.parse(localStorage.getItem('user') || '{}');
        if (savedUser["email"]) {
          setEmail(savedUser["email"]);
        }
    },[])
    return <div className="flex h-full w-full justify-center text-5xl text-blue-300 font-extralight">
        This is chat page
    </div>
}