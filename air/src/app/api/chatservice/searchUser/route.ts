import { NextResponse } from "next/server";
import cookie from 'cookie';
import { NextApiRequest, NextApiResponse } from "next";
import { getSearchedContacts } from "@/services/chatService";

export async function GET(req: Request) {

    let cookies = cookie.parse(req.headers.get('cookie')||'');
    let token = cookies['login-token'];
    if(!token){
        return NextResponse.json({error:'unatutorized!!'},{status:401})
    }
    
    const { searchParams } = new URL(req.url);
    const receiver_id = searchParams.get('query');
    // console.log("receiver id", receiver_id);
    
  if (typeof receiver_id !== 'string') {
    return NextResponse.json({ message: "Invalid query" },{status:400});
  }

  const {data, error} = await getSearchedContacts(token,receiver_id, )

  if (error || !data) {
    return NextResponse.json({ message: "User not found" },{status:404});
  }
  // console.log("The data is ", data);
  
  return NextResponse.json({users: data},{status:200});
}