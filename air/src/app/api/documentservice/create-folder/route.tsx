import { parse, serialize } from 'cookie'; // ✅ Correct
import { NextResponse } from 'next/server';
import { createFolder } from '@/services/documentService';
export async function POST(req:Request){
    let cookies = parse(req.headers.get('cookie')||'');
    let token = cookies['login-token']!;
    const {name,parent_id, user_id} = await req.json();
    // console.log("The list is ", name, parent_id || null, user_id);
    // return NextResponse.json({Message:"No files"}, {status:200});
    
    if( !user_id || !name){
        return NextResponse.json({error:"no file uploaded"},{status:400});
    }
    const {data:folder_data,error} = await createFolder(name,parent_id || null,token, user_id);
    if(error!==null || folder_data===null){
        // if(error?.code === '23505')
        //     return NextResponse.json({error: "folder name already used"},{status:401});
        
        return NextResponse.json({error: "Error creating folder"},{status:401});
    }
    return NextResponse.json({data:folder_data},{status:200});
}