import { NextResponse } from "next/server";
import { parse, serialize } from 'cookie'; // ✅ Correct
import { listFiles } from "@/services/documentService";

export async function GET(req:Request){
    let cookies = parse(req.headers.get('cookie')||'');
    let token = cookies['login-token'];
    
    if(!token){
        return NextResponse.json({error:'unatutorized!!'},{status:401})
    }

    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');
    const parent_id = searchParams.get('parent_id') || null;

    if(!user_id){
        return NextResponse.json({error:"user id or parent id not present"}, {status:401});
    }
    let {data,error} = await listFiles(user_id, parent_id, token);
    if(!data || error)
        console.error("Fetch  error for files",error)
    if(data){
        return NextResponse.json({data}, {status:200});
    }
    return NextResponse.json({error:'Cannot list files and folders'},{status:400})
}