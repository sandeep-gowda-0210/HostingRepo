import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import type { Message } from "@/app/pages/home/chat-page/chat-window/page";
import { getSocketServer, getUserSocketMap } from "@/utils/socketStore";
export type scheduleMessageType={sender_id:string,receiver_id:string, message_content:string, send_time:Date};

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
  
    if(user.id){
    const { data: friendList, error: friendError } = await supabaseWithToken
  .from('UserFriendList')
  .select('sender_id, receiver_id, last_message_time')
  .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
  .order('last_message_time', { ascending: false });
      
if (friendError && !friendList) {
  console.error(friendError);
} else {
  const contactIds = friendList.map((f) =>
    f.sender_id === user.id ? f.receiver_id : f.sender_id
  );
    const uniqueContactIds = [...new Set(contactIds)];


  const { data: contactList1, error: profileError } = await supabaseWithToken
    .from('Profile')
    .select('user_id, user_name, email_id, profile_url')
    .in('user_id', uniqueContactIds);

  if (profileError) {
    console.error(profileError);
  } else {
    const contactList = friendList.map(friend => {
    const contactId = friend.sender_id === user.id ? friend.receiver_id : friend.sender_id;
    const profile = contactList1.find(p => p.user_id === contactId);
    return {
      ...profile,
      last_message_time: friend.last_message_time
    };
  });

  const uniqueContacts = [];
const seenUserIds = new Set();

for (const contact of contactList) {
  if (!seenUserIds.has(contact.user_id)) {
    uniqueContacts.push(contact);
    seenUserIds.add(contact.user_id);
  }
}

    return uniqueContacts;
  }
}

  }
}

  
export const getSearchedContacts = async(token:string,query:string)=>{
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
    .from('Profile')
    .select('user_id, user_name, email_id, profile_url')
    .or(`user_name.ilike.%${query}%,email_id.ilike.%${query}%`).limit(10);

    return {data, error};
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
    if(messagePayload.file){
      const { name, type, data: base64Data } = messagePayload.file;
      if((typeof base64Data)==="string"){
      const base64 = base64Data.split(",")[1];
      const buffer = Buffer.from(base64, "base64");
      const filePath = `messages/${Date.now()}-${name}`;
      const { error } = await supabaseWithToken.storage
      .from("sharefiles")
      .upload(filePath, buffer, {
        contentType: type,
      });
      if (error) {
        console.error("Supabase upload error:", error.message);
        return;
      }
  
      const { data: publicUrlData } = await supabaseWithToken.storage
        .from("sharefiles")
        .getPublicUrl(filePath);
        
    messagePayload.file_url = publicUrlData.publicUrl;
    }else {
      console.error("Expected file data as base64 string, but got:", typeof base64Data);
      return;
    }
    }
    
    
    if(messagePayload.file){
      let { iv, encryptedData } = encrypt(messagePayload.content);
      // console.log("Pushing message", iv,"   ", encryptedData);
       const { error } = await supabaseWithToken
    .from('Message')
    .insert({sender_id:messagePayload.sender_id,receiver_id:messagePayload.receiver_id,content:encryptedData,type:messagePayload.type, file_url:messagePayload.file_url||null, file_name:messagePayload.file?.name||null, initial_vector: iv});
    if(error)
    console.log("message Data inserted error", error);
  return error;
}
else{
  console.log("The encryption is being done....");
  
    let { iv, encryptedData } = encrypt(messagePayload.content);
    // console.log("Pushing message", iv,"   ", encryptedData);
  const { error } = await supabaseWithToken
    .from('Message')
    .insert({sender_id:messagePayload.sender_id,receiver_id:messagePayload.receiver_id,content:encryptedData,type:messagePayload.type,initial_vector:iv});
    if(error)
    console.log("message Data inserted error", error);
    await setUserFriendList(token,messagePayload.sender_id,messagePayload.receiver_id);
  return error;
}
  
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

    
  let { data, error } = await supabaseWithToken
    .from('Message')
    .select('*').or(
      `and(sender_id.eq.${from_user_id},receiver_id.eq.${to_user_id}),and(sender_id.eq.${to_user_id},receiver_id.eq.${from_user_id})`
    );
    // console.log("message Data inserted error", error);
    if(data){
    data = data.map((element) => {
          element["content"] = decrypt(
            element["content"],
            element["initial_vector"]
          );
          delete element["initial_vector"];
          return element;
        });
      }
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

export function getLocalDateTimeString() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localTime = new Date(now.getTime() - offset * 60 * 1000);
  return localTime.toISOString().slice(0, 16);
}

export const sendScheduledMessage=async ()=>{
  const supabaseSuperClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const now = getLocalDateTimeString();
  // console.log("time",now);
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

    let { iv, encryptedData } = encrypt(message_content);
    const { error: insertError } = await supabaseSuperClient
      .from('Message')
      .insert({
        sender_id,
        receiver_id,
        content: encryptedData,
        initial_vector:iv
      });

    if (insertError) {
      console.error(`Insert failed for ID ${id}:`, insertError);
      continue;
    }
    if (!insertError) {
      const io = getSocketServer();
      const userSocketMap = getUserSocketMap();
      // console.log("io ", io, "usersocketMap ", userSocketMap);
      
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



export const getScheduledMessages=async (token:string, from_user_id:string, to_user_id:string)=>{
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
  const now = getLocalDateTimeString();
  // console.log("time",now);
  const { data: messages, error } = await supabaseWithToken
    .from('ScheduleMessage')
    .select('*')
    .eq('sender_id', from_user_id)
    .eq('receiver_id', to_user_id)
    // .gt('send_time', now)

  if (error) {
    console.error('Fetch error:', error);
  return {data:null,error}
  }

  if (!messages || messages.length === 0) {
  return {data:null,error:null}
  }
  
  return {data:messages,error:null}
}




export const deleteScheduledMessage=async (token:string, message_id:string)=>{
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
  const now = getLocalDateTimeString();
  // console.log("time",now);
 
  const { data, error } = await supabaseWithToken
  .from('ScheduleMessage')
  .delete()
  .eq('id', message_id);
  if (error!==null) {
    console.error('Delete failed:', error.message);
    return {data:null, error};
  }
  return {data,error:null};
}





import crypto from "crypto";


const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex"); // Encryption key (store securely)

export function encrypt(text:string) {
  
  const iv = crypto.randomBytes(16); // Initialization vector
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  console.log("Encrypting!!!!", iv.toString("hex"), encrypted);
  
  return { iv: iv.toString("hex"), encryptedData: encrypted };
}

export function decrypt(encryptedData:string, ivHex:string) {
  console.log("decrypted ",ivHex,encryptedData);
  
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(ivHex, "hex")
  );
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  console.log("decrypted", decrypted);
  
  return decrypted;
}





export async function setUserFriendList(token:string,sender_id:string, receiver_id: string){
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

      
      
      const now = getLocalDateTimeString();
      console.log("setting user list " ,sender_id,
                  receiver_id,
                  now);
    const { error } = await supabaseWithToken
            .from('UserFriendList')
            .upsert([{
                sender_id,
                receiver_id,
                last_message_time:now,
            }], {
                onConflict: 'sender_id,receiver_id'
            });
            if(error!==null){
              console.log("error ", error);
            }
            else{
              console.log("successfully inserted");
              
            }
        return error;
}