import { NextResponse } from "next/server";
import cookie from 'cookie';
import { previewFile } from "@/services/documentService";

export async function GET(req:Request){
    let cookies = cookie.parse(req.headers.get('cookie')||'');
    let token = cookies['login-token'];
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const user_id = searchParams.get('user_id');
    if (!id || !user_id) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }
    if(!token){
        return NextResponse.json({error:'unatutorized!!'},{status:401})
    }
    let {data,error} = await previewFile(id,user_id,token);

    if (data?.url) {
            // return NextResponse.json({ data: data.url }, { status: 200 });
            return NextResponse.redirect(data.url);
    }
    if(error){
        console.log("errors: ",error);
        
    return NextResponse.json({ error }, { status: 500 });}
}