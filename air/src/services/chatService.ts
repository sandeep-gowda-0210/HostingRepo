import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import type { Message } from "@/app/pages/home/chat-page/chat-window/page";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import { getSocketServer, getUserSocketMap } from "@/utils/socketStore";
export type scheduleMessageType={sender_id:string,receiver_id:string, message_content:string, send_time:Timestamp};

export const getContacts = async(token:string)=>{
    const supabaseWithToken = createClient(
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
    
    const { data: { user }, error: authError } = await supabaseWithToken.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Auth Error' }, { status: 401 });
    }
  
    const { data: contactList, error: profileError } = await supabaseWithToken
      .from('Profile')
      .select('user_id,user_name,email_id,profile_url')
      .neq('user_id', user.id);

    return contactList;
  }

  
export const pushMessage = async(token:string,messagePayload:Message)=>{
  const supabaseWithToken = createClient(
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

    console.log("message inserting", messagePayload);
    
  const { error } = await supabaseWithToken
    .from('Message')
    .insert({sender_id:messagePayload.sender_id,receiver_id:messagePayload.receiver_id,content:messagePayload.content});
    console.log("message Data inserted error", error);
    
  return error;
}


export const fetchMessages = async(token:string, from_user_id: string, to_user_id:string)=>{
  const supabaseWithToken = createClient(
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

    
  const { data, error } = await supabaseWithToken
    .from('Message')
    .select('*').or(
      `and(sender_id.eq.${from_user_id},receiver_id.eq.${to_user_id}),and(sender_id.eq.${to_user_id},receiver_id.eq.${from_user_id})`
    );;
    // console.log("message Data inserted error", error);
    
  return {data,error};
}


export const setScheduleMessage = async(token:string, scheduleData:scheduleMessageType)=>{
  const supabaseWithToken = createClient(
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

    
  const {error}= await supabaseWithToken
    .from('ScheduleMessage')
    .insert(scheduleData);
  return error;
}


export const sendScheduledMessage=async ()=>{
  const supabaseSuperClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const now = new Date().toISOString();
  console.log("time",now);
  
  const { data: messages, error } = await supabaseSuperClient
    .from('ScheduleMessage')
    .select('*')
    .lte('send_time', now)


    // console.log("Message to be sent: ",messages);
    
  if (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch scheduled messages' }, { status: 500 });
  }

  if (!messages || messages.length === 0) {
    return NextResponse.json({ message: 'No messages to send' }, { status: 200 });
  }
// console.log("sending message....");

  for (const msg of messages) {
    const { sender_id, receiver_id, message_content, id } = msg;

    const { error: insertError } = await supabaseSuperClient
      .from('Message')
      .insert({
        sender_id,
        receiver_id,
        content: message_content,
      });

    if (insertError) {
      console.error(`Insert failed for ID ${id}:`, insertError);
      continue;
    }
    if (!insertError) {
      const io = getSocketServer();
      const userSocketMap = getUserSocketMap();
      console.log("io ", io, "usersocketMap ", userSocketMap);
      
      // if (io && userSocketMap.has(receiver_id)) {
      //   const socketId = userSocketMap.get(receiver_id);
      //   io.to(socketId!).emit("receive-message", {
      //     sender_id,
      //     receiver_id,
      //     content: message_content,
      //   });
      //   console.log("📤 Sent scheduled message to online user:", receiver_id);
      // } else {
      //   console.log("📴 User is offline, message saved but not delivered now.");
      // }
    }

    const { data, error } = await supabaseSuperClient
  .from('ScheduleMessage')
  .delete()
  .eq('id', id);
  if (error) {
    console.error('Delete failed:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  }

  return NextResponse.json({ message: 'Messages sent' });
}