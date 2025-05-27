import { createClient } from "@supabase/supabase-js";
import { io } from "socket.io-client";

const socket = io("https://air-iils.onrender.com",{
  path: "/api/socket",
  transports: ["websocket"],
  autoConnect:false
});

export default socket;


export const createSupabaseWithToken = async(token:string)=>{
  return await createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );
    }