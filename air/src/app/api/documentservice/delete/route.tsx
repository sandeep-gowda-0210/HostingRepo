import cookie from 'cookie';
import { NextResponse } from 'next/server';
import { createFolder, deleteFileOrFolder } from '@/services/documentService';
export async function DELETE(req:Request){
    let cookies = cookie.parse(req.headers.get('cookie')||'');
    let token = cookies['login-token']!;
    const {id, user_id} = await req.json();
    console.log("The list is ", id , user_id);
    // return NextResponse.json({Message:"No files"}, {status:200});
    
    if( !user_id || !id){
        return NextResponse.json({error:"Provide credentials"},{status:400});
    }
    const {data:folder_data,error} = await deleteFileOrFolder(id,token, user_id);
    if(error!==null || folder_data===null){
        // if(error?.code === '23505')
        //     return NextResponse.json({error: "folder name already used"},{status:401});
        
        return NextResponse.json({error: "Error creating folder"},{status:401});
    }
    return NextResponse.json({data:folder_data},{status:200});
}