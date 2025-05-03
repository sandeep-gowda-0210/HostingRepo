import supabase from "@/lib/supabaseClient"
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';



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
      .select('user_id,user_name,email_id')
      .neq('user_id', user.id);

    return contactList;
  }