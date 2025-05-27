import { NextResponse } from "next/server";
import { parse, serialize } from 'cookie'; // ✅ Correct
import {  shareFiles } from "@/services/documentService";

export async function POST(req:Request){
    let cookies = parse(req.headers.get('cookie')||'');
    let token = cookies['login-token'];    
    const {id, user_id, receiver_id} = await req.json();

    if (!user_id || !id || !receiver_id) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }
    if(!token){
        return NextResponse.json({error:'unatutorized!!'},{status:401})
    }
    console.log("calling");
    
    let {data,error} = await shareFiles(id,user_id,receiver_id,token);
    console.log("called",data);
    
    if(error || data===null || !data)
    {
        console.log("error", error);
            return NextResponse.json({ error }, { status: 500 });
    }
    return NextResponse.json({ data }, { status: 200 });
}