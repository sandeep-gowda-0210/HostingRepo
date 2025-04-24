'use client'
import { useEffect, useState } from "react";
import { useUserData } from "../layout"

export default function Document(){
    let {user} = useUserData();
    return <div className="flex h-full w-full justify-center text-5xl text-blue-300 font-extralight">
        Document Storage Page.
    </div>
}




// let [email, setEmail] = useState<string|null>(null);
// useEffect(()=>{
//     const savedUser:{email?:string} = JSON.parse(localStorage.getItem('user') || '{}');
//     if (savedUser["email"]) {
//       setEmail(savedUser["email"]);
//     }
// },[])