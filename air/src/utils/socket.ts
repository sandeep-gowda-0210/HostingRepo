import { createClient } from "@supabase/supabase-js";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001",{
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