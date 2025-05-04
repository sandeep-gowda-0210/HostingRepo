import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import type { Message } from "@/app/pages/home/chat-page/chat-window/page";


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